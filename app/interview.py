"""
Guía de entrevista testimonial:
Determina qué datos de la "ficha" del testimonio ya fueron recopilados y cuál conviene
solicitar a continuación, para que el agente oriente la conversación (de a una pregunta)
hacia la información necesaria para persistir y ubicar el relato en el mapa.
"""

DEFAULT_WITNESS_NAME = "Veterano / Testimoniante"
UNDATED_EVENT = "Conflicto 1982"

# Orden de prioridad: primero lo indispensable para ubicar el relato en el mapa
CHECKLIST_ORDER = ["lugar", "fecha", "unidad", "identidad"]

CHECKLIST_LABELS = {
    "lugar": "Lugar de las islas donde ocurrió lo relatado",
    "fecha": "Fecha o período aproximado (mes / día de 1982)",
    "unidad": "Unidad, regimiento, compañía o buque en el que prestaba servicio",
    "identidad": "Nombre del testimoniante o preferencia de anonimato",
}

NEXT_QUESTIONS = {
    "lugar": (
        "¿Recuerda en qué lugar de las islas ocurrió lo que me relata? "
        "Si no conoce el nombre del paraje, puede marcarlo directamente en el mapa con el botón «Marcar lugar en el mapa»."
    ),
    "fecha": "¿Recuerda aproximadamente en qué fecha o mes de 1982 ocurrió lo que relata en {lugar}?",
    "unidad": "¿En qué unidad, regimiento, compañía o buque prestaba usted servicio en aquellos días?",
    "identidad": (
        "Para el registro histórico, ¿desea que su testimonio figure con su nombre completo, solo con sus iniciales, "
        "o prefiere que se publique de forma anónima? Si desea figurar con su nombre, puede decirme «Me llamo…»."
    ),
}

CLOSING_QUESTION = (
    "Su testimonio ya quedó registrado y ubicado en el mapa de la memoria. "
    "¿Hay algún otro momento, lugar o compañero que desee agregar, o prefiere que demos por completado este valioso registro?"
)


def get_testimony_checklist(session) -> dict:
    """Devuelve el estado de la ficha testimonial de la sesión: {dato: True/False}."""
    witness = session.witness
    events = list(session.events.all())
    return {
        "lugar": bool(events),
        "fecha": any(e.event_date and e.event_date != UNDATED_EVENT for e in events),
        "unidad": bool(witness.unit.strip()),
        "identidad": witness.name != DEFAULT_WITNESS_NAME or witness.privacy_level == "Anónimo",
    }


def get_next_missing_field(checklist: dict):
    for field in CHECKLIST_ORDER:
        if not checklist.get(field):
            return field
    return None


def build_next_question(checklist: dict, session) -> str:
    field = get_next_missing_field(checklist)
    if field is None:
        return CLOSING_QUESTION
    last_event = session.events.order_by("-registered_at").first()
    lugar = last_event.toponymy if last_event else "ese lugar"
    return NEXT_QUESTIONS[field].format(lugar=lugar)


def build_checklist_prompt(checklist: dict) -> str:
    """Bloque dinámico que se agrega al system prompt de Claude con el estado de la ficha."""
    lines = ["", "---", "", "### 6. ESTADO ACTUAL DE LA FICHA TESTIMONIAL (generado por el sistema)"]
    for field in CHECKLIST_ORDER:
        mark = "[x]" if checklist.get(field) else "[ ]"
        lines.append(f"- {mark} {CHECKLIST_LABELS[field]}")
    field = get_next_missing_field(checklist)
    if field:
        lines.append("")
        lines.append(
            f"Dato prioritario pendiente: **{CHECKLIST_LABELS[field]}**. Después de validar con calidez lo que el "
            "testimoniante acaba de contar, si es oportuno, formúlale UNA sola pregunta suave para obtener este dato."
        )
        if field == "lugar":
            lines.append(
                "Si el lugar que menciona no figura en la toponimia conocida, invítalo a marcarlo en el mapa con el "
                "botón «Marcar lugar en el mapa»."
            )
    else:
        lines.append("")
        lines.append("La ficha está completa: agradece, ofrece agregar otros recuerdos o cerrar el registro.")
    return "\n".join(lines)
