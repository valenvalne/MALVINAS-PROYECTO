import json
import uuid
import logging
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone

from .models import WitnessProfile, ChatSession, ChatMessage, HistoricalEvent
from .ai_service import process_agent_message
from .extractor import extract_events_from_message, extract_date, extract_units, extract_witness_data, ZOOM_SITIO
from .interview import get_testimony_checklist, build_next_question, DEFAULT_WITNESS_NAME, UNDATED_EVENT
from .sheets_service import (
    get_sheets_connection_status,
    sync_session_to_sheets,
    sync_event_to_sheets,
    CSV_TESTIMONIOS,
    CSV_EVENTOS,
)
from .services import append_file_history

logger = logging.getLogger(__name__)

def get_or_create_active_session(request):
    """Obtiene la sesión activa del usuario almacenada en cookies de sesión de Django o crea una nueva."""
    session_id_str = request.session.get("malvinas_chat_session_id")
    if session_id_str:
        try:
            return ChatSession.objects.get(session_id=session_id_str)
        except ChatSession.DoesNotExist:
            pass

    # Crear nuevo perfil de testigo y sesión inicial
    witness = WitnessProfile.objects.create(
        name=DEFAULT_WITNESS_NAME,
        role="Veterano de Guerra",
        unit="",
        privacy_level="Nombre Público",
        consent_given=True
    )
    session = ChatSession.objects.create(
        witness=witness,
        status="En Curso",
        message_count=0,
        summary="",
        full_transcript=""
    )
    request.session["malvinas_chat_session_id"] = str(session.session_id)
    request.session.modified = True

    # Sincronización inicial de la sesión
    sync_session_to_sheets(session)
    return session

def portal(request):
    """Portal web interactivo (Sector 1): mapa, galería y widget de chat conectado a /api/chat/."""
    return render(request, "portal.html")

def index(request):
    """Vista principal de la Plataforma de Testimonios y Agente Virtual de Malvinas."""
    session = get_or_create_active_session(request)
    messages = session.messages.all()
    events = session.events.all()
    sheets_status = get_sheets_connection_status()

    context = {
        "session": session,
        "messages": messages,
        "events": events,
        "sheets_status": sheets_status,
        "total_events_global": HistoricalEvent.objects.count(),
    }
    return render(request, "index.html", context)

def serialize_event(event):
    """Representación JSON de un evento para el chat y el mapa del portal."""
    return {
        "event_id": str(event.event_id),
        "title": event.title,
        "toponymy": event.toponymy,
        "latitude": event.latitude,
        "longitude": event.longitude,
        "zoom_level": event.zoom_level,
        "location_source": event.location_source,
        "event_date": event.event_date,
        "units": event.units_involved,
        "description": event.description,
        "quote": event.quote,
        "validation_status": event.validation_status,
        "witness": public_witness_name(event.session.witness),
        "synced": event.synced_to_sheets,
    }

def public_witness_name(witness):
    """Nombre a exhibir públicamente según el nivel de privacidad elegido por el testimoniante."""
    if witness.privacy_level == "Anónimo" or witness.name == DEFAULT_WITNESS_NAME:
        return f"Testimonio anónimo ({witness.role})"
    if witness.privacy_level == "Solo Iniciales":
        return " ".join(part[0] + "." for part in witness.name.split()) + f" ({witness.role})"
    return f"{witness.name} ({witness.role})"

def apply_witness_data(session, message_text):
    """Completa el perfil del testimoniante con nombre, privacidad y unidad mencionados en el relato."""
    witness = session.witness
    changed = False
    for field, value in extract_witness_data(message_text).items():
        if getattr(witness, field) != value:
            setattr(witness, field, value)
            changed = True
    units = extract_units(message_text)
    if units and not witness.unit:
        witness.unit = ", ".join(units)
        changed = True
        # Los relatos ya ubicados con la unidad por defecto del lugar pasan a la unidad declarada
        session.events.filter(location_source="Toponimia").update(units_involved=witness.unit)
    if changed:
        witness.save()

def last_mentioned_date(session):
    """Última fecha mencionada por el testimoniante en la sesión (para eventos relatados sin fecha)."""
    for msg in session.messages.filter(role="user").order_by("-timestamp"):
        date = extract_date(msg.content)
        if date:
            return date
    return ""

@csrf_exempt
@require_POST
def chat_api(request):
    """
    Endpoint principal del chat:
    Recibe el mensaje, extrae acontecimientos territoriales y datos del testimoniante,
    los persiste, y genera la respuesta empática orientada al siguiente dato pendiente de la ficha.
    """
    try:
        data = json.loads(request.body.decode("utf-8") if request.body else "{}")
    except Exception:
        return JsonResponse({"error": "Formato JSON inválido."}, status=400)

    message_text = (data.get("message") or "").strip()
    if not message_text:
        return JsonResponse({"error": "El mensaje no puede estar vacío."}, status=400)
    mode = data.get("tipo") or "testimonio_veterano"

    session = get_or_create_active_session(request)

    # 1. Registrar mensaje del usuario
    ChatMessage.objects.create(
        session=session,
        role="user",
        content=message_text,
        timestamp=timezone.now()
    )
    session.message_count += 1
    session.full_transcript += f"\n[Usuario]: {message_text}"

    saved_events = []
    if mode == "testimonio_veterano":
        # 2. Completar perfil del testimoniante (nombre, privacidad, unidad)
        apply_witness_data(session, message_text)

        # 3. Extraer eventos territoriales en Malvinas a partir del testimonio
        new_extracted_events = extract_events_from_message(
            message_text,
            fallback_date=last_mentioned_date(session),
            fallback_units=session.witness.unit,
        )
        for ev_data in new_extracted_events:
            # Evitar duplicados exactos en la misma sesión
            exists = HistoricalEvent.objects.filter(
                session=session,
                toponymy=ev_data["toponymy"],
                event_date=ev_data["event_date"]
            ).exists()
            if not exists:
                event = HistoricalEvent.objects.create(
                    session=session,
                    title=ev_data["title"],
                    toponymy=ev_data["toponymy"],
                    latitude=ev_data["latitude"],
                    longitude=ev_data["longitude"],
                    zoom_level=ev_data["zoom_level"],
                    event_date=ev_data["event_date"],
                    units_involved=ev_data["units_involved"],
                    description=ev_data["description"],
                    quote=ev_data["quote"],
                    confidence=ev_data["confidence"],
                    validation_status="Pendiente de Revision"
                )
                # Sincronización en tiempo real hacia Google Sheets
                sync_event_to_sheets(event)
                saved_events.append(event)

        # 4. Si el relato aporta la fecha de un evento ya ubicado sin fecha, completarla
        date_in_message = extract_date(message_text)
        if date_in_message and not saved_events:
            undated = session.events.filter(event_date=UNDATED_EVENT).order_by("-registered_at").first()
            if undated:
                undated.event_date = date_in_message
                undated.save(update_fields=["event_date"])

    checklist = get_testimony_checklist(session)

    # 5. Generar respuesta del agente de IA orientada por la ficha testimonial
    agent_reply = process_agent_message(
        user_message=message_text,
        session=session,
        history_records=list(session.messages.all()),
        mode=mode,
        checklist=checklist,
        new_events=[{"toponymy": e.toponymy} for e in saved_events],
    )

    # 6. Registrar mensaje del asistente
    ChatMessage.objects.create(
        session=session,
        role="assistant",
        content=agent_reply,
        timestamp=timezone.now()
    )
    session.message_count += 1
    session.full_transcript += f"\n[Agente]: {agent_reply}"
    session.save()

    # Registro en archivo persistente de backup
    append_file_history("user", message_text)
    append_file_history("assistant", agent_reply)

    # 7. Sincronizar estado actualizado de la sesión en Google Sheets
    sync_session_to_sheets(session)

    return JsonResponse({
        "ok": True,
        "reply": agent_reply,
        "mode": mode,
        "session_id": str(session.session_id),
        "events_extracted": [serialize_event(e) for e in saved_events],
        "total_session_events": session.events.count(),
        "checklist": checklist,
        "needs_location": mode == "testimonio_veterano" and not checklist["lugar"],
        "sheets_status": get_sheets_connection_status(),
    })

@csrf_exempt
@require_POST
def locate_event_api(request):
    """
    Permite al testimoniante ubicar su relato marcando un punto en el mapa,
    cuando el lugar no figura en el diccionario toponímico.
    """
    try:
        data = json.loads(request.body.decode("utf-8") if request.body else "{}")
        lat = float(data.get("lat"))
        lng = float(data.get("lng"))
    except (TypeError, ValueError):
        return JsonResponse({"error": "Coordenadas inválidas."}, status=400)

    # Límites aproximados del archipiélago de Malvinas (WGS84)
    if not (-53.0 <= lat <= -50.8 and -61.6 <= lng <= -57.4):
        return JsonResponse({"error": "El punto marcado está fuera del archipiélago de Malvinas."}, status=400)

    session = get_or_create_active_session(request)
    last_user_msg = session.messages.filter(role="user").order_by("-timestamp").first()
    relato = last_user_msg.content if last_user_msg else ""
    place_name = (data.get("place_name") or "").strip()[:150] or "Lugar marcado por el testimoniante"

    event = HistoricalEvent.objects.create(
        session=session,
        title=f"Acontecimiento en {place_name}",
        toponymy=place_name,
        latitude=round(lat, 5),
        longitude=round(lng, 5),
        zoom_level=ZOOM_SITIO,
        location_source="Usuario",
        event_date=last_mentioned_date(session) or UNDATED_EVENT,
        units_involved=session.witness.unit,
        description="Relato testimonial ubicado manualmente por el testimoniante en el mapa.",
        quote=f'"{relato}"' if relato else "",
        confidence=0.80,
        validation_status="Pendiente de Revision"
    )
    sync_event_to_sheets(event)

    checklist = get_testimony_checklist(session)
    reply = (
        "Muchas gracias. El lugar que usted señaló quedó registrado en el mapa de la memoria junto a su relato. "
        + build_next_question(checklist, session)
    )
    ChatMessage.objects.create(session=session, role="assistant", content=reply, timestamp=timezone.now())
    session.message_count += 1
    session.full_transcript += f"\n[Agente]: {reply}"
    session.save()

    return JsonResponse({
        "ok": True,
        "reply": reply,
        "event": serialize_event(event),
        "checklist": checklist,
    })

@require_GET
def session_api(request):
    """Retorna información detallada de la sesión activa y perfil del testimoniante."""
    session = get_or_create_active_session(request)
    witness = session.witness
    return JsonResponse({
        "session_id": str(session.session_id),
        "status": session.status,
        "started_at": session.started_at.isoformat(),
        "message_count": session.message_count,
        "witness": {
            "name": witness.name,
            "role": witness.role,
            "unit": witness.unit,
            "privacy_level": witness.privacy_level,
            "consent_given": witness.consent_given,
        }
    })

@csrf_exempt
@require_POST
def update_profile_api(request):
    """Permite al testimoniante o curador ajustar sus datos de perfil o nivel de privacidad."""
    try:
        data = json.loads(request.body.decode("utf-8") if request.body else "{}")
    except Exception:
        return JsonResponse({"error": "JSON inválido."}, status=400)

    session = get_or_create_active_session(request)
    witness = session.witness

    if "name" in data:
        witness.name = data["name"].strip() or "Anónimo"
    if "role" in data:
        witness.role = data["role"]
    if "unit" in data:
        witness.unit = data["unit"].strip()
    if "privacy_level" in data:
        witness.privacy_level = data["privacy_level"]
    if "consent_given" in data:
        witness.consent_given = bool(data["consent_given"])

    witness.save()
    sync_session_to_sheets(session)

    return JsonResponse({"ok": True, "message": "Perfil actualizado correctamente."})

@csrf_exempt
@require_POST
def reset_session_api(request):
    """Reinicia la sesión para comenzar una nueva conversación."""
    witness = WitnessProfile.objects.create(
        name=DEFAULT_WITNESS_NAME,
        role="Veterano de Guerra",
        unit="",
        privacy_level="Nombre Público",
        consent_given=True
    )
    new_session = ChatSession.objects.create(
        witness=witness,
        status="En Curso",
        message_count=0
    )
    request.session["malvinas_chat_session_id"] = str(new_session.session_id)
    request.session.modified = True
    sync_session_to_sheets(new_session)

    return JsonResponse({
        "ok": True,
        "message": "Nueva sesión iniciada.",
        "session_id": str(new_session.session_id)
    })

@require_GET
def events_api(request):
    """Retorna los eventos georreferenciados recolectados para el mapa del portal y la web matriz."""
    events = (
        HistoricalEvent.objects
        .exclude(validation_status="Descartado")
        .exclude(latitude__isnull=True)
        .select_related("session__witness")
        .order_by("-registered_at")
    )
    data = [serialize_event(e) for e in events]
    return JsonResponse({
        "ok": True,
        "count": len(data),
        "events": data
    })

@require_GET
def sheets_status_api(request):
    """Diagnóstico en tiempo real del estado de conexión con Google Sheets."""
    return JsonResponse(get_sheets_connection_status())

@csrf_exempt
@require_POST
def sheets_sync_all_api(request):
    """Fuerza la sincronización de todos los registros pendientes con Google Sheets."""
    sessions = ChatSession.objects.all()
    events = HistoricalEvent.objects.all()
    synced_s = 0
    synced_e = 0

    for s in sessions:
        sync_session_to_sheets(s)
        synced_s += 1

    for e in events:
        sync_event_to_sheets(e)
        synced_e += 1

    return JsonResponse({
        "ok": True,
        "message": f"Sincronizados {synced_s} testimonios y {synced_e} eventos territoriales.",
        "sheets_status": get_sheets_connection_status()
    })
