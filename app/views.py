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
from .extractor import extract_events_from_message
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
        name="Veterano / Testimoniante",
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

@csrf_exempt
@require_POST
def chat_api(request):
    """
    Endpoint principal del chat:
    Recibe el mensaje, genera respuesta empática con IA,
    extrae acontecimientos territoriales y sincroniza en tiempo real con Google Sheets.
    """
    try:
        data = json.loads(request.body.decode("utf-8") if request.body else "{}")
    except Exception:
        return JsonResponse({"error": "Formato JSON inválido."}, status=400)

    message_text = (data.get("message") or "").strip()
    if not message_text:
        return JsonResponse({"error": "El mensaje no puede estar vacío."}, status=400)

    session = get_or_create_active_session(request)

    # 1. Registrar mensaje del usuario
    user_msg = ChatMessage.objects.create(
        session=session,
        role="user",
        content=message_text,
        timestamp=timezone.now()
    )
    session.message_count += 1
    session.full_transcript += f"\n[Usuario]: {message_text}"

    # 2. Generar respuesta del agente de IA
    history_records = list(session.messages.all())
    agent_reply = process_agent_message(
        user_message=message_text,
        session=session,
        history_records=history_records
    )

    # 3. Registrar mensaje del asistente
    assistant_msg = ChatMessage.objects.create(
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

    # 4. Extraer eventos territoriales en Malvinas a partir del testimonio
    new_extracted_events = extract_events_from_message(message_text)
    saved_events_data = []

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
                event_date=ev_data["event_date"],
                units_involved=ev_data["units_involved"],
                description=ev_data["description"],
                quote=ev_data["quote"],
                confidence=ev_data["confidence"],
                validation_status="Pendiente de Revision"
            )
            # Sincronización en tiempo real hacia Google Sheets
            sync_ok, sync_msg = sync_event_to_sheets(event)
            saved_events_data.append({
                "event_id": str(event.event_id),
                "title": event.title,
                "toponymy": event.toponymy,
                "latitude": event.latitude,
                "longitude": event.longitude,
                "event_date": event.event_date,
                "units": event.units_involved,
                "quote": event.quote,
                "synced": event.synced_to_sheets,
                "status_message": sync_msg,
            })

    # 5. Sincronizar estado actualizado de la sesión en Google Sheets
    sync_session_to_sheets(session)

    return JsonResponse({
        "ok": True,
        "reply": agent_reply,
        "session_id": str(session.session_id),
        "events_extracted": saved_events_data,
        "total_session_events": session.events.count(),
        "sheets_status": get_sheets_connection_status(),
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
        name="Veterano / Testimoniante",
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
    """Retorna los eventos georreferenciados recolectados para el mapa de la web matriz."""
    session = get_or_create_active_session(request)
    events = list(HistoricalEvent.objects.all().values(
        "event_id", "session_id", "title", "toponymy", "latitude", "longitude",
        "event_date", "units_involved", "description", "quote",
        "confidence", "validation_status", "synced_to_sheets"
    ))
    return JsonResponse({
        "ok": True,
        "count": len(events),
        "events": events
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
