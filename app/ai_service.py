import os
import re
import logging
from .services import get_system_prompt
from .extractor import MALVINAS_TOPONYMY, normalize

logger = logging.getLogger(__name__)

HISTORICAL_KNOWLEDGE = {
    "belgrano": (
        "El 2 de mayo de 1982 a las 16:02 hs, el Crucero ARA General Belgrano fue atacado y hundido "
        "fuera de la zona de exclusión militar por el submarino nuclear británico HMS Conqueror. "
        "En esta acción entregaron su vida 323 tripulantes argentinos. Tras 40 horas en balsas salvavidas bajo un "
        "fuerte temporal antártico, 770 marinos fueron rescatados con vida por los buques ARA Bouchard, ARA Piedrabuena y aviso Gurruchaga."
    ),
    "rosario": (
        "La Operación Rosario se llevó a cabo el 2 de abril de 1982 para la recuperación pacífica de las Islas Malvinas, "
        "con órdenes estrictas de no causar bajas británicas. Durante la toma de la Casa de Gobierno ofrendó su vida "
        "el Capitán de Corbeta Pedro Edgardo Giachino, primer héroe caído del conflicto."
    ),
    "sheffield": (
        "El 4 de mayo de 1982, dos cazas Super Étendard de la Armada Argentina (Capitán Bedacarratz y Teniente Mayora), "
        "guiados por un avión explorador Neptune, dispararon dos misiles AM-39 Exocet e impactaron en el destructor británico "
        "HMS Sheffield, provocando su incendio incontrolable y posterior hundimiento."
    ),
    "bautismo": (
        "El 1 de mayo de 1982 se produjo el Bautismo de Fuego de la Fuerza Aérea Argentina. La contienda inició tras los "
        "bombardeos de un avión Vulcan sobre Puerto Argentino. La FAA ejecutó 56 salidas de combate con aviones Mirage, "
        "Dagger y A-4 Skyhawk para repeler a la flota invasora, cayendo heroicamente los primeros 14 aviadores."
    ),
    "san_carlos": (
        "A partir del 21 de mayo de 1982, durante el desembarco británico en el Estrecho de San Carlos ('El Callejón de las Bombas'), "
        "la aviación argentina atacó a vuelo rasante a la flota inglesa, hundiendo las fragatas HMS Ardent y HMS Antelope, "
        "y averiando de gravedad a varios destructores."
    ),
    "coventry": (
        "El 25 de mayo de 1982, en el Día de la Patria, aviones A-4B Skyhawk de la Fuerza Aérea Argentina (escuadrilla Vulcano y Zeus) "
        "hundieron al destructor HMS Coventry, mientras dos Super Étendard impactaron con misiles Exocet al buque logístico Atlantic Conveyor."
    ),
    "darwin": (
        "En la Batalla de Pradera del Ganso y Darwin (28-29 de mayo de 1982), el Regimiento de Infantería 12 y efectivos del RI 25 "
        "resistieron el asalto del 2° Batallón de Paracaidistas británico. Allí combatió hasta su último aliento el Teniente Roberto Estévez "
        "y cayó abatido el jefe británico, Teniente Coronel Herbert Jones."
    ),
    "longdon": (
        "El Combate de Monte Longdon (noche del 11 al 12 de junio de 1982) fue el más cruento cuerpo a cuerpo del conflicto. "
        "La Compañía B del Regimiento de Infantería 7 (Subteniente Baldini), ingenieros de la Ca Ing 10 y personal del BIM 5 "
        "resistieron durante casi diez horas el asalto frontal con bayonetas del 3 Para británico."
    ),
    "tumbledown": (
        "En Monte Tumbledown (13-14 de junio de 1982), el Batallón de Infantería de Marina Nº 5 (BIM 5) comandado por Carlos Robacio, "
        "junto a la 4ª Sección del Teniente Carlos Vázquez y la sección del Subteniente Oscar Silva (RI 4), libró una resistencia heroica "
        "frente al asalto de la Guardia Escocesa británica."
    )
}

def format_messages_for_anthropic(history_records: list, current_user_message: str) -> list:
    """Formatea la lista de mensajes respetando la alternancia user/assistant requerida por Anthropic."""
    raw_list = []
    for h in history_records:
        role = getattr(h, "role", "user")
        content = getattr(h, "content", "")
        if not content:
            continue
        mapped_role = "assistant" if role in ["assistant", "model", "bot"] else "user"
        raw_list.append({"role": mapped_role, "content": content.strip()})

    if current_user_message and current_user_message.strip():
        raw_list.append({"role": "user", "content": current_user_message.strip()})

    # Asegurar que comience con user
    while raw_list and raw_list[0]["role"] != "user":
        raw_list.pop(0)

    if not raw_list:
        raw_list = [{"role": "user", "content": current_user_message or "Hola"}]

    # Fusionar consecutivos
    merged = []
    for item in raw_list:
        if merged and merged[-1]["role"] == item["role"]:
            merged[-1]["content"] += "\n\n" + item["content"]
        else:
            merged.append({"role": item["role"], "content": item["content"]})

    # Asegurar que termine en user
    if merged and merged[-1]["role"] != "user":
        merged.append({"role": "user", "content": current_user_message or "Continúa"})

    return merged

def generate_local_empathetic_reply(message: str, history_messages: list, witness_role: str = "Veterano de Guerra") -> str:
    """
    Generador historiográfico y empático de respaldo:
    Responde con precisión histórica y empatía sincera sin usar respuestas programadas restrictivas.
    """
    msg_norm = normalize(message)

    # 1. Detección de familiar de veterano (padre, familiar, abuelo, tío)
    if any(k in msg_norm for k in ["mi padre", "mi papa", "mi viejo"]):
        return (
            "Es un inmenso honor poder conversar con usted sobre su padre. Su entrega y valentía en las Islas Malvinas forman parte de lo más noble de nuestra historia, y para su familia debe ser un motivo de profundo orgullo.\n\n"
            "Le escuchamos con total atención, respeto y sin ningún apuro: ¿cómo se llama su padre? ¿Recuerda en qué fuerza, regimiento o unidad militar sirvió, o en qué zona de las islas estuvo destinado?"
        )

    if any(k in msg_norm for k in ["mi abuelo", "mi tio", "mi hermano", "mi familiar"]):
        return (
            "Es un gran honor y un verdadero privilegio poder escuchar la historia de su familiar. La entrega de quienes defendieron nuestra Patria en 1982 es un legado que merece ser recordado y preservado con el máximo respeto.\n\n"
            "Le escuchamos con total atención: ¿cómo se llama y qué recuerdos o vivencias de aquellos días tiene sobre él?"
        )

    # 2. Detección de dolor o duelo
    if any(k in msg_norm for k in ["murio", "fallecio", "cayo", "dolor", "triste", "le costo"]):
        return (
            "Comprendemos y acompañamos con profundo respeto y calidez ese sentir. Para los combatientes y sus seres queridos, la experiencia de la guerra y la posguerra ha sido una prueba inmensa. "
            "Que hoy decida hablar de él y mantener vivo su recuerdo es un acto de amor supremo y de verdadero homenaje a su entrega.\n\n"
            "Tómese todo el tiempo que necesite; este espacio es suyo para recordar lo que sienta propicio compartir."
        )

    # 3. Búsqueda de respuestas fácticas históricas ante preguntas o temas
    if any(k in msg_norm for k in ["belgrano", "conqueror", "2 de mayo"]):
        return HISTORICAL_KNOWLEDGE["belgrano"]
    if any(k in msg_norm for k in ["2 de abril", "rosario", "giachino"]):
        return HISTORICAL_KNOWLEDGE["rosario"]
    if any(k in msg_norm for k in ["sheffield", "super etendard", "exocet", "4 de mayo"]):
        return HISTORICAL_KNOWLEDGE["sheffield"]
    if any(k in msg_norm for k in ["1 de mayo", "bautismo", "vulcan"]):
        return HISTORICAL_KNOWLEDGE["bautismo"]
    if any(k in msg_norm for k in ["san carlos", "callejon", "ardent", "antelope", "crippa"]):
        return HISTORICAL_KNOWLEDGE["san_carlos"]
    if any(k in msg_norm for k in ["coventry", "conveyor", "25 de mayo"]):
        return HISTORICAL_KNOWLEDGE["coventry"]
    if any(k in msg_norm for k in ["pradera del ganso", "goose green", "darwin", "estevez"]):
        return HISTORICAL_KNOWLEDGE["darwin"]
    if any(k in msg_norm for k in ["longdon", "baldini", "ri 7"]):
        return HISTORICAL_KNOWLEDGE["longdon"]
    if any(k in msg_norm for k in ["tumbledown", "bim 5", "robacio", "vazquez"]):
        return HISTORICAL_KNOWLEDGE["tumbledown"]
    if any(k in msg_norm for k in ["bajas", "muertos", "cuantos murieron", "heroes caidos"]):
        return (
            "Durante la Guerra de Malvinas ofrendaron su vida 649 héroes argentinos: "
            "323 de la Armada, 194 del Ejército, 55 de la Fuerza Aérea, 7 de la Gendarmería, "
            "2 de la Prefectura y 16 de la Marina Mercante y personal civil."
        )

    # 2. Detección de lugares específicos de Malvinas
    detected_places = []
    for place_key, data in MALVINAS_TOPONYMY.items():
        if place_key in msg_norm:
            detected_places.append(data["display"])

    if detected_places:
        places_str = " y ".join(detected_places)
        return (
            f"Comprendo y valoro profundamente lo que relata sobre {places_str}. "
            f"Sabemos el trascendente valor histórico y humano que tuvieron esos días en ese territorio. "
            f"¿Desea compartir algún detalle sobre la unidad militar, la sección o los compañeros que se encontraban allí?"
        )

    # 3. Detección de saludos iniciales
    if any(w in msg_norm for w in ["hola", "buen dia", "buenas tardes", "buenas noches", "saludos"]):
        return (
            "Buenas tardes. Es un verdadero honor recibirle en este espacio de memoria y homenaje a nuestros combatientes de Malvinas. "
            "Estamos a su entera disposición tanto para escuchar sus vivencias con profundo respeto como para dialogar sobre los acontecimientos de 1982. "
            "¿En qué podemos acompañarle hoy?"
        )

    # 4. Respuesta empática atenta
    return (
        "Le escucho con profundo respeto y atención. Cada detalle y memoria sobre los acontecimientos de 1982 "
        "es fundamental para la preservación de nuestra historia nacional. Por favor, continúe explayándose a su propio ritmo."
    )

def process_agent_message(user_message: str, session, history_records: list) -> str:
    """
    Procesa el mensaje del usuario utilizando Anthropic Claude (si hay clave válida)
    o el Asistente Histórico Local.
    """
    api_key = os.getenv("ANTHROPIC_API_KEY", "").strip()

    if api_key and api_key.startswith("sk-ant-"):
        try:
            from anthropic import Anthropic
            client = Anthropic(api_key=api_key)
            model_name = os.getenv("CLAUDE_MODEL", "claude-3-5-sonnet-20241022").strip()

            messages_payload = format_messages_for_anthropic(history_records, user_message)

            response = client.messages.create(
                model=model_name,
                max_tokens=1200,
                system=get_system_prompt(),
                messages=messages_payload,
                temperature=0.3
            )
            return response.content[0].text
        except Exception as e:
            logger.warning(f"Error llamando a Anthropic Claude: {e}. Usando asistente histórico local.")

    # Fallback empático e historiográfico local
    return generate_local_empathetic_reply(
        message=user_message,
        history_messages=history_records,
        witness_role=session.witness.role if (session and hasattr(session, "witness")) else "Veterano de Guerra"
    )
