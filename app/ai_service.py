import os
import re
import logging
from .services import get_system_prompt
from .extractor import MALVINAS_TOPONYMY, normalize
from .interview import build_next_question, build_checklist_prompt

logger = logging.getLogger(__name__)

def generate_local_historical_reply(message: str) -> str:
    """Respuesta local para el modo "Consulta Histórica" basada en la toponimia georreferenciada."""
    msg_norm = normalize(message)
    for place_key, data in MALVINAS_TOPONYMY.items():
        if place_key in msg_norm:
            return (
                f"{data['display']}: {data['description']} "
                f"Unidades argentinas vinculadas: {data['default_units']}. "
                "Puede ubicar este sitio en el mapa y explorar los testimonios registrados en la zona."
            )
    return (
        "En el conflicto de 1982 intervinieron el Ejército, la Armada y la Fuerza Aérea, con el apoyo de la Marina Mercante "
        "y la Prefectura Naval. Puede consultarme por un lugar concreto (Monte Longdon, Tumbledown, Pradera del Ganso, "
        "Bahía San Carlos, entre otros) o explorar el mapa para ver los hitos y testimonios registrados."
    )

def generate_local_empathetic_reply(message: str, history_messages: list, session, checklist: dict, new_events: list) -> str:
    """
    Generador empático determinístico local:
    Permite probar el sistema de inmediato incluso sin clave de API de Claude/OpenAI,
    respetando el registro solemne, el pacing y la calidez solicitada, y orientando
    la conversación hacia el siguiente dato pendiente de la ficha testimonial.
    """
    msg_norm = normalize(message)
    turns_count = len(history_messages)
    next_question = build_next_question(checklist, session)

    # Detección de saludos iniciales
    if any(w in msg_norm for w in ["hola", "buen dia", "buenas tardes", "buenas noches", "saludos"]) and turns_count <= 2:
        return (
            "Buenas tardes. Es un verdadero honor recibirlo en este espacio de memoria y homenaje. "
            "Queremos agradecerle profundamente su disposición para compartir sus vivencias o las de su familia. "
            "Toda la información que desee confiarme será tratada con absoluto respeto y quedará ubicada en el mapa de nuestras Islas Malvinas. "
            "¿Le gustaría comenzar contándome en qué zona de las islas estuvo destinado?"
        )

    # Detección de cansancio, dolor o necesidad de pausa
    if any(w in msg_norm for w in ["dolor", "triste", "cansado", "no quiero hablar mas", "hasta aca", "chau", "gracias por todo", "pausa"]):
        return (
            "Comprendo perfectamente y respeto con toda solemnidad su sentir. "
            "Le agradecemos de corazón, en nombre de toda la comunidad, el inmenso valor de su testimonio y su entrega a la Patria. "
            "Su relato ha quedado debidamente registrado y a resguardo. Cuando usted desee retomar o descansar, este espacio siempre estará abierto con el mayor de los respetos."
        )

    # Validación del relato antes de indagar (escucha activa)
    if new_events:
        places_str = " y ".join(dict.fromkeys(ev["toponymy"] for ev in new_events))
        acknowledgement = (
            f"Comprendo con profundo respeto lo que relata sobre {places_str}. "
            "Sabemos el enorme significado histórico y humano que tuvieron esos días en ese territorio, "
            "y su recuerdo ya quedó señalado en el mapa de la memoria. "
        )
    elif turns_count < 4:
        acknowledgement = "Le escucho con total atención y respeto. Cada palabra suya es un pedazo vivo de nuestra historia que merece ser preservado. "
    else:
        acknowledgement = "Muchas gracias por confiarme este relato. Estamos registrando fielmente cada uno de estos datos. "

    return acknowledgement + next_question

def process_agent_message(user_message: str, session, history_records: list, mode: str = "testimonio_veterano",
                          checklist: dict = None, new_events: list = None) -> str:
    """
    Procesa el mensaje del usuario utilizando Anthropic Claude (si hay clave válida)
    o el Asistente Empático Local (fallback).
    En modo testimonio, el estado de la ficha orienta la próxima pregunta del agente.
    """
    checklist = checklist or {}
    new_events = new_events or []
    api_key = os.getenv("ANTHROPIC_API_KEY", "").strip()

    if api_key and api_key.startswith("sk-ant-"):
        try:
            from anthropic import Anthropic
            client = Anthropic(api_key=api_key)
            model_name = os.getenv("CLAUDE_MODEL", "claude-3-5-sonnet-20241022")

            # El historial ya incluye el último mensaje del usuario (se registra antes de llamar al agente)
            messages_payload = [{"role": h.role, "content": h.content} for h in history_records[-15:]]

            if mode == "consulta_historica":
                system_prompt = get_system_prompt() + (
                    "\n\n---\n\n### MODO CONSULTA HISTÓRICA\nEl usuario es un estudiante o investigador, no un testimoniante. "
                    "Responde con rigor historiográfico y brevedad; no le solicites datos de la ficha testimonial."
                )
            else:
                system_prompt = get_system_prompt() + build_checklist_prompt(checklist)

            response = client.messages.create(
                model=model_name,
                max_tokens=1000,
                system=system_prompt,
                messages=messages_payload,
                temperature=0.3
            )
            return response.content[0].text
        except Exception as e:
            logger.warning(f"Error llamando a Anthropic Claude: {e}. Usando asistente empático local.")

    # Fallback local
    if mode == "consulta_historica":
        return generate_local_historical_reply(user_message)
    return generate_local_empathetic_reply(
        message=user_message,
        history_messages=history_records,
        session=session,
        checklist=checklist,
        new_events=new_events,
    )
