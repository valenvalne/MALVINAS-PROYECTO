import os
import re
import logging
from .services import get_system_prompt
from .extractor import MALVINAS_TOPONYMY, normalize

logger = logging.getLogger(__name__)

def generate_local_empathetic_reply(message: str, history_messages: list, witness_role: str = "Veterano de Guerra") -> str:
    """
    Generador empático determinístico local:
    Permite probar el sistema de inmediato incluso sin clave de API de Claude/OpenAI,
    respetando el registro solemne, el pacing y la calidez solicitada.
    """
    msg_norm = normalize(message)
    turns_count = len(history_messages)

    # Detección de saludos iniciales
    if any(w in msg_norm for w in ["hola", "buen dia", "buenas tardes", "buenas noches", "saludos"]):
        if turns_count <= 2:
            return (
                "Buenas tardes. Es un verdadero honor recibirlo en este espacio de memoria y homenaje. "
                "Queremos agradecerle profundamente su disposición para compartir sus vivencias o las de su familia. "
                "Toda la información que desee confiarme será tratada con absoluto respeto para preservar la historia en el territorio de nuestras Islas Malvinas. "
                "¿Le gustaría comenzar contándome en qué unidad sirvió o en qué zona de las islas estuvo destinado?"
            )

    # Detección de cansancio, dolor o necesidad de pausa
    if any(w in msg_norm for w in ["dolor", "triste", "cansado", "no quiero hablar mas", "hasta aca", "chau", "gracias por todo", "pausa"]):
        return (
            "Comprendo perfectamente y respeto con toda solemnidad su sentir. "
            "Le agradecemos de corazón, en nombre de toda la comunidad, el inmenso valor de su testimonio y su entrega a la Patria. "
            "Su relato ha quedado debidamente registrado y a resguardo. Cuando usted desee retomar o descansar, este espacio siempre estará abierto con el mayor de los respetos."
        )

    # Detección de lugares específicos mencionados
    detected_places = []
    for place_key, data in MALVINAS_TOPONYMY.items():
        if place_key in msg_norm:
            detected_places.append(data["display"])

    if detected_places:
        places_str = " y ".join(detected_places)
        return (
            f"Comprendo con profundo respeto lo que relata sobre {places_str}. "
            f"Sabemos el enorme significado histórico y humano que tuvieron esos días en ese territorio. "
            f"Gracias por compartir este recuerdo tan valioso. Tómese todo el tiempo que necesite. "
            f"¿Había algún compañero, sección o detalle particular de ese momento que le gustaría dejar registrado en la memoria histórica?"
        )

    # Respuesta empática contextual por defecto según el avance
    if turns_count < 4:
        return (
            "Le escucho con total atención y respeto. Cada palabra suya es un pedazo vivo de nuestra historia que merece ser preservado. "
            "Por favor, continúe explayándose a su propio ritmo sobre lo que sentía o vivía en aquellos días."
        )
    elif turns_count < 8:
        return (
            "Muchas gracias por confiarme este relato. Estamos registrando fielmente cada uno de estos acontecimientos. "
            "¿Recuerda aproximadamente en qué época o mes ocurrió esto, o si se encontraban cerca de alguna posición o paraje conocido?"
        )
    else:
        return (
            "Su testimonio es de un valor histórico incalculable para nuestro pueblo. "
            "Hemos tomado nota de estos acontecimientos en nuestro mapa de memoria. "
            "¿Hay algo más que sienta importante agregar, o desea que demos por completado este valioso registro?"
        )

def process_agent_message(user_message: str, session, history_records: list) -> str:
    """
    Procesa el mensaje del usuario utilizando Anthropic Claude (si hay clave válida)
    o el Asistente Empático Local (fallback).
    """
    api_key = os.getenv("ANTHROPIC_API_KEY", "").strip()

    if api_key and api_key.startswith("sk-ant-"):
        try:
            from anthropic import Anthropic
            client = Anthropic(api_key=api_key)
            model_name = os.getenv("CLAUDE_MODEL", "claude-3-5-sonnet-20241022")

            messages_payload = []
            for h in history_records[-15:]:
                messages_payload.append({
                    "role": h.role,
                    "content": h.content
                })
            messages_payload.append({"role": "user", "content": user_message})

            response = client.messages.create(
                model=model_name,
                max_tokens=1000,
                system=get_system_prompt(),
                messages=messages_payload,
                temperature=0.3
            )
            return response.content[0].text
        except Exception as e:
            logger.warning(f"Error llamando a Anthropic Claude: {e}. Usando asistente empático local.")

    # Fallback empático local
    return generate_local_empathetic_reply(
        message=user_message,
        history_messages=history_records,
        witness_role=session.witness.role
    )
