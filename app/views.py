import json
import uuid
import logging
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone

from .models import WitnessProfile, ChatSession, ChatMessage, HistoricalEvent
from .ai_service import process_agent_message, build_conversation_payload
from .extractor import extract_events_from_message, extract_person_name, MILITARY_UNITS, normalize
from .sheets_service import (
    get_sheets_connection_status,
    sync_session_to_sheets,
    sync_event_to_sheets,
    record_vivencia_to_spreadsheet,
    CSV_TESTIMONIOS,
    CSV_EVENTOS,
)
from .services import append_file_history

logger = logging.getLogger(__name__)

def get_or_create_active_session(request, client_session_id=None):
    """
    Obtiene la sesión activa garantizando continuidad y memoria total:
    1. Si el cliente envía client_session_id (desde app.js o frontend), lo vincula determinísticamente.
    2. Si existe cookie de sesión en request.session, lo recupera.
    3. Si no existe, crea una nueva sesión persistente.
    """
    import uuid
    session_obj = None

    if client_session_id:
        try:
            val_uuid = uuid.UUID(str(client_session_id))
            session_obj = ChatSession.objects.filter(session_id=val_uuid).first()
        except (ValueError, TypeError):
            val_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, str(client_session_id))
            session_obj = ChatSession.objects.filter(session_id=val_uuid).first()

    if not session_obj and request and hasattr(request, "session"):
        session_id_str = request.session.get("malvinas_chat_session_id")
        if session_id_str:
            try:
                session_obj = ChatSession.objects.filter(session_id=session_id_str).first()
            except Exception:
                pass

    if session_obj:
        if request and hasattr(request, "session"):
            request.session["malvinas_chat_session_id"] = str(session_obj.session_id)
            request.session.modified = True
        return session_obj

    # Crear nuevo perfil de testigo y sesión inicial
    witness = WitnessProfile.objects.create(
        name="Veterano / Testimoniante",
        role="Veterano de Guerra",
        unit="",
        privacy_level="Nombre Público",
        consent_given=True
    )
    target_uuid = val_uuid if (client_session_id and 'val_uuid' in locals()) else uuid.uuid4()
    session_obj = ChatSession.objects.create(
        session_id=target_uuid,
        witness=witness,
        status="En Curso",
        message_count=0,
        summary="",
        full_transcript=""
    )
    if request and hasattr(request, "session"):
        request.session["malvinas_chat_session_id"] = str(session_obj.session_id)
        request.session.modified = True

    # Sincronización inicial de la sesión
    sync_session_to_sheets(session_obj)
    return session_obj

def index(request):
    """Vista principal de la Plataforma de Testimonios y Agente Virtual de Malvinas."""
    session = get_or_create_active_session(request)
    messages = session.messages.order_by("timestamp")
    events = session.events.all()
    sheets_status = get_sheets_connection_status()

    # Sincronizar historial completo en request.session
    if hasattr(request, "session"):
        session_history = []
        for msg in messages:
            session_history.append({
                "role": msg.role,
                "content": msg.content,
                "timestamp": msg.timestamp.isoformat() if hasattr(msg.timestamp, "isoformat") else str(msg.timestamp)
            })
        request.session["chat_history"] = session_history
        request.session.modified = True

    context = {
        "session": session,
        "messages": messages,
        "events": events,
        "sheets_status": sheets_status,
        "total_events_global": HistoricalEvent.objects.count(),
    }
    return render(request, "index.html", context)

@csrf_exempt
def chat_api(request):
    origin = request.headers.get("Origin") or request.META.get("HTTP_ORIGIN", "")

    def _cors_response(json_data, status=200):
        resp = JsonResponse(json_data, status=status)
        if origin:
            resp["Access-Control-Allow-Origin"] = origin
            resp["Access-Control-Allow-Credentials"] = "true"
        else:
            resp["Access-Control-Allow-Origin"] = "*"
        resp["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        resp["Access-Control-Allow-Headers"] = "Content-Type, X-CSRFToken, Authorization"
        return resp

    if request.method == "OPTIONS":
        return _cors_response({"ok": True})
    if request.method != "POST":
        return _cors_response({"error": "Método no permitido"}, status=405)
    """
    Endpoint principal del chat:
    Recibe el mensaje, genera respuesta empática con IA,
    extrae acontecimientos territoriales y sincroniza en tiempo real con Google Sheets.
    """
    try:
        data = json.loads(request.body.decode("utf-8") if request.body else "{}")
    except Exception:
        return _cors_response({"error": "Formato JSON inválido."}, status=400)

    message_text = (data.get("message") or data.get("mensaje") or "").strip()
    if not message_text:
        return _cors_response({"error": "El mensaje no puede estar vacío."}, status=400)

    client_sid = data.get("sessionId") or data.get("session_id")
    session = get_or_create_active_session(request, client_session_id=client_sid)

    # Actualizar datos de perfil del veterano/familiar si se proporcionan
    witness = session.witness
    new_name = (data.get("name") or data.get("witness_name") or "").strip()
    new_role = (data.get("role") or data.get("witness_role") or "").strip()
    new_unit = (data.get("units") or data.get("unit") or "").strip()

    norm_txt = normalize(message_text)

    # Detección automática del rol / vínculo en el mensaje
    if "hija" in witness.role.lower():
        pass
    elif "hijo" in witness.role.lower():
        pass
    elif any(k in norm_txt for k in ["hija de veterano", "hija de un veterano", "hija de excombatiente", "soy hija"]):
        witness.role = "Hija de Veterano de Guerra"
    elif any(k in norm_txt for k in ["hijo de veterano", "hijo de un veterano", "hijo de excombatiente", "soy hijo"]):
        witness.role = "Hijo de Veterano de Guerra"
    elif any(k in norm_txt for k in ["esposa", "viuda"]):
        witness.role = "Esposa / Viuda de Veterano"
    elif any(k in norm_txt for k in ["familiar de caido", "hermano de caido", "madre de caido", "padre de caido"]):
        witness.role = "Familiar de Caído en Combate"
    elif any(k in norm_txt for k in ["familiar de veterano", "hermano de veterano", "hermana de veterano", "sobrino", "nieto", "mi papa", "mi padre"]):
        witness.role = "Familiar de Veterano de Guerra"
    elif any(k in norm_txt for k in ["soy veterano", "excombatiente", "soldado conscripto", "yo estuve", "estuve en"]):
        witness.role = "Veterano de Guerra"
    elif new_role and new_role not in ["Veterano de Guerra", "Consultante Histórico"]:
        witness.role = new_role

    # Detección automática del nombre en el texto si el usuario se presenta
    detected_name = extract_person_name(message_text)
    if detected_name:
        witness.name = detected_name

    # Detección automática de la unidad militar en el texto
    if not witness.unit:
        for u in MILITARY_UNITS:
            if normalize(u) in norm_txt:
                witness.unit = u
                break

    if new_name and new_name != "Veterano / Testimoniante":
        witness.name = new_name
    if new_unit:
        witness.unit = new_unit
    witness.save()

    # 1. Registrar mensaje del usuario en base de datos
    user_msg = ChatMessage.objects.create(
        session=session,
        role="user",
        content=message_text,
        timestamp=timezone.now()
    )
    session.message_count += 1
    session.full_transcript += f"\n[Usuario]: {message_text}"

    # Sincronizar mensaje del usuario en request.session["chat_history"]
    if hasattr(request, "session"):
        if "chat_history" not in request.session or not isinstance(request.session.get("chat_history"), list):
            request.session["chat_history"] = [
                {
                    "role": m.role,
                    "content": m.content,
                    "timestamp": m.timestamp.isoformat() if hasattr(m.timestamp, "isoformat") else str(m.timestamp)
                }
                for m in session.messages.order_by("timestamp")
            ]
        else:
            request.session["chat_history"].append({
                "role": "user",
                "content": message_text,
                "timestamp": timezone.now().isoformat()
            })
        request.session.modified = True

    # 2. Construir arreglo completo de mensajes (messages_payload) para el modelo LLM
    db_history = list(session.messages.order_by("timestamp"))
    messages_payload = build_conversation_payload(
        history_records=db_history,
        current_user_message=message_text
    )

    # 3. Generar respuesta del agente de IA con retención contextual y resolución de anáforas
    turn_res = process_agent_message(
        user_message=message_text,
        session=session,
        history_records=db_history,
        messages_payload=messages_payload
    )
    agent_reply = str(turn_res)

    # Manejo de reinicio limpio ordenado desde el propio chat
    if getattr(turn_res, "reset_session", False):
        session.messages.all().delete()
        session.message_count = 1
        session.full_transcript = f"[Agente]: {agent_reply}"
        session.summary = ""
        session.save()

        ChatMessage.objects.create(
            session=session,
            role="assistant",
            content=agent_reply,
            timestamp=timezone.now()
        )

        if hasattr(request, "session"):
            request.session["chat_history"] = [{
                "role": "assistant",
                "content": agent_reply,
                "timestamp": timezone.now().isoformat()
            }]
            request.session["chat_interview_state"] = {}
            request.session["chat_user_name"] = ""
            request.session.modified = True

        return _cors_response({
            "ok": True,
            "reply": agent_reply,
            "reset_session": True,
            "user_name": "",
            "history": request.session.get("chat_history", []) if hasattr(request, "session") else [],
            "session_id": str(session.session_id),
            "events_extracted": [],
            "total_session_events": 0,
            "sheets_status": get_sheets_connection_status(),
        })

    # 4. Registrar mensaje del asistente en base de datos
    assistant_msg = ChatMessage.objects.create(
        session=session,
        role="assistant",
        content=agent_reply,
        timestamp=timezone.now()
    )
    session.message_count += 1
    session.full_transcript += f"\n[Agente]: {agent_reply}"

    # Sincronizar respuesta del asistente en request.session["chat_history"]
    if hasattr(request, "session"):
        request.session["chat_history"].append({
            "role": "assistant",
            "content": agent_reply,
            "timestamp": timezone.now().isoformat()
        })
        request.session.modified = True

    # Guardar estado conversacional en session.summary y request.session
    conv_state = getattr(turn_res, "state", {})
    if conv_state:
        session.summary = json.dumps(conv_state, ensure_ascii=False)
        person_name = conv_state.get("full_name") or conv_state.get("user_name")
        if person_name and person_name != "Veterano / Testimoniante":
            witness.name = person_name
            if hasattr(request, "session"):
                request.session["chat_user_name"] = person_name
        if conv_state.get("role"):
            witness.role = conv_state["role"]
        if conv_state.get("regiment"):
            witness.unit = conv_state["regiment"]
        elif conv_state.get("unit"):
            witness.unit = conv_state["unit"]
        witness.save()
        if hasattr(request, "session"):
            request.session["chat_interview_state"] = conv_state
            request.session.modified = True
    session.save()

    # Registro en archivo persistente de backup
    append_file_history("user", message_text)
    append_file_history("assistant", agent_reply)

    # 4. Guardar testimonio y evento georreferenciado SOLO cuando el usuario confirma explícitamente
    saved_events_data = []
    if getattr(turn_res, "save_now", False):
        ev_data = getattr(turn_res, "event_data", None)
        places_str = conv_state.get("combat_place") or conv_state.get("place", "")

        # Construir narrativa testimonial estructurada con todos los campos obligatorios de la entrevista
        full_interview_narrative = (
            f"Testimoniante: {conv_state.get('full_name', witness.name)} ({conv_state.get('role', witness.role)}) | "
            f"Veterano de Guerra: {conv_state.get('veteran_name', witness.name)} | "
            f"Regimiento / Unidad: {conv_state.get('regiment', witness.unit or 'Sin especificar')} | "
            f"Lugar de Combate: {places_str or 'Sin especificar'} | "
            f"Llegada a Malvinas: {conv_state.get('arrival_date', 'Sin especificar')} | "
            f"Vuelta al Continente: {conv_state.get('return_date', 'Sin especificar')} | "
            f"Vivencia / Anécdota: {conv_state.get('anecdote', conv_state.get('summary_vivencia', message_text))}"
        )

        # Resolver ev_data si no vino en el retorno pero places_str corresponde a un lugar conocido
        if not ev_data and places_str and places_str != "No lo recuerda / Sin especificar":
            from app.extractor import MALVINAS_TOPONYMY
            from app.ai_service import resolve_assisted_place, extract_explicit_place
            ev_data = resolve_assisted_place(places_str, MALVINAS_TOPONYMY) or extract_explicit_place(places_str, is_answering_place=True)

        # A. Guardar en hojas de cálculo (Excel .xlsx y CSV) sin sobrescribir registros previos
        record_vivencia_to_spreadsheet(
            session=session,
            user_message=full_interview_narrative,
            agent_reply=agent_reply,
            places_str=places_str,
            extra_data=conv_state
        )

                # B. Registrar evento territorial para mapa destacando al veterano de guerra
        if ev_data:
            testimoniante_title = conv_state.get("full_name") or witness.name or "Testimoniante"
            vet_title = conv_state.get("veteran_name") or witness.name or "Veterano de Guerra"
            role_title = conv_state.get("role") or witness.role or "Testimoniante"

            # Formular título y descripción destacando prominentemente al veterano que lo dejó
            if vet_title and vet_title != testimoniante_title:
                event_title = f"Testimonio del Veterano de Guerra Don {vet_title} (Aportado por {testimoniante_title}) en {ev_data['display']}"
                desc_title = f"🎖️ Veterano de Guerra: Don {vet_title} | ✍️ Testimonio aportado por su {role_title}: {testimoniante_title} | {full_interview_narrative}"
            else:
                event_title = f"Testimonio del Veterano de Guerra Don {vet_title} en {ev_data['display']}"
                desc_title = f"🎖️ Veterano de Guerra: Don {vet_title} | {full_interview_narrative}"

            date_range = f"Llegada: {conv_state.get('arrival_date', '1982')} - Vuelta: {conv_state.get('return_date', '1982')}"
            quote_text = f'"{conv_state.get("anecdote", conv_state.get("summary_vivencia", message_text))}" — Veterano de Guerra: Don {vet_title}'

            event = HistoricalEvent.objects.create(
                session=session,
                title=event_title,
                toponymy=ev_data["display"],
                latitude=ev_data["lat"],
                longitude=ev_data["lng"],
                event_date=date_range,
                units_involved=conv_state.get("regiment", "") or conv_state.get("unit", "") or ev_data.get("default_units", ""),
                description=desc_title,
                quote=quote_text,
                confidence=0.98,
                validation_status="Aprobado Web"
            )
            sync_ok, sync_msg = sync_event_to_sheets(event)
            saved_events_data.append({
                "event_id": str(event.event_id),
                "title": event.title,
                "veteran_name": vet_title,
                "veteran": vet_title,
                "testimoniante": testimoniante_title,
                "role": role_title,
                "toponymy": event.toponymy,
                "latitude": event.latitude,
                "longitude": event.longitude,
                "event_date": event.event_date,
                "units": event.units_involved,
                "quote": event.quote,
                "description": event.description,
                "synced": event.synced_to_sheets,
                "status_message": sync_msg,
            })

    # 5. Sincronizar estado actualizado de la sesión
    sync_session_to_sheets(session)

    return _cors_response({
        "ok": True,
        "reply": agent_reply,
        "user_name": witness.name if (witness and witness.name != "Veterano / Testimoniante") else "",
        "history": request.session.get("chat_history", []) if hasattr(request, "session") else [],
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
    """Reinicia la sesión para comenzar una nueva conversación limpia y efímera, sin acumulación basura."""
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
        message_count=1,
        summary="",
        full_transcript=""
    )
    welcome_msg = "¡Hola! Es un honor recibirte en este espacio de memoria de Malvinas. Para comenzar una nueva entrevista o consulta, ¿cómo te llamás?"
    ChatMessage.objects.create(
        session=new_session,
        role="assistant",
        content=welcome_msg,
        timestamp=timezone.now()
    )
    new_session.full_transcript = f"[Agente]: {welcome_msg}"
    new_session.save()

    # Limpieza total y efímera de la sesión HTTP en Django
    if hasattr(request, "session"):
        request.session["malvinas_chat_session_id"] = str(new_session.session_id)
        request.session["chat_history"] = [{
            "role": "assistant",
            "content": welcome_msg,
            "timestamp": timezone.now().isoformat()
        }]
        request.session["chat_interview_state"] = {}
        request.session["chat_user_name"] = ""
        request.session.modified = True

    sync_session_to_sheets(new_session)

    return JsonResponse({
        "ok": True,
        "message": "Sesión reiniciada con éxito e historial limpio.",
        "session_id": str(new_session.session_id),
        "welcome_message": welcome_msg
    })

@require_GET
def events_api(request):
    """Retorna los eventos georreferenciados recolectados para el mapa de la web matriz destacando al veterano."""
    session = get_or_create_active_session(request)
    events_qs = HistoricalEvent.objects.all().select_related("session__witness")
    events = []
    for ev in events_qs:
        vet_name = ""
        testimoniante = ""
        role = ""
        if ev.session and ev.session.witness:
            testimoniante = ev.session.witness.name
            role = ev.session.witness.role

        if "Veterano de Guerra Don " in ev.title:
            vet_name = ev.title.split("Veterano de Guerra Don ")[1].split(" (")[0].split(" en ")[0].strip()
        elif "Veterano de Guerra: Don " in ev.description:
            vet_name = ev.description.split("Veterano de Guerra: Don ")[1].split(" |")[0].strip()
        elif "Veterano de Guerra: " in ev.description:
            vet_name = ev.description.split("Veterano de Guerra: ")[1].split(" |")[0].strip()
        elif testimoniante and testimoniante not in ["Veterano / Testimoniante", "Anónimo"]:
            vet_name = testimoniante
        else:
            vet_name = "Veterano de Malvinas"

        events.append({
            "event_id": str(ev.event_id),
            "session_id": str(ev.session_id) if ev.session_id else "",
            "title": ev.title,
            "veteran_name": vet_name,
            "veteran": vet_name,
            "testimoniante": testimoniante,
            "role": role,
            "toponymy": ev.toponymy,
            "latitude": ev.latitude,
            "longitude": ev.longitude,
            "event_date": ev.event_date,
            "units_involved": ev.units_involved,
            "units": ev.units_involved,
            "description": ev.description,
            "quote": ev.quote,
            "confidence": ev.confidence,
            "validation_status": ev.validation_status,
            "synced_to_sheets": ev.synced_to_sheets
        })
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
