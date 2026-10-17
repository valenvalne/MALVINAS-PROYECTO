import re
import unicodedata

# Diccionario georreferenciado oficial de toponimia histórica de Malvinas (WGS84)
MALVINAS_TOPONYMY = {
    "monte longdon": {
        "display": "Monte Longdon",
        "lat": -51.6667,
        "lng": -57.9833,
        "default_units": "RI Mec 7",
        "description": "Combate nocturno del 11 al 12 de junio de 1982."
    },
    "dos hermanas": {
        "display": "Monte Dos Hermanas (Two Sisters)",
        "lat": -51.6942,
        "lng": -58.0319,
        "default_units": "RI 4",
        "description": "Combates en la cresta defensiva occidental."
    },
    "monte harriet": {
        "display": "Monte Harriet",
        "lat": -51.7167,
        "lng": -58.0167,
        "default_units": "RI 4",
        "description": "Posición defensiva atacada el 11 de junio."
    },
    "tumbledown": {
        "display": "Monte Tumbledown",
        "lat": -51.7000,
        "lng": -57.9333,
        "default_units": "BIM 5",
        "description": "Cruento combate nocturno entre el BIM 5 y la Guardia Escocesa."
    },
    "monte williams": {
        "display": "Monte Williams",
        "lat": -51.7100,
        "lng": -57.9200,
        "default_units": "BIM 5",
        "description": "Posición de retaguardia y apoyo al combate de Tumbledown."
    },
    "sapper hill": {
        "display": "Monte Sapper Hill",
        "lat": -51.7167,
        "lng": -57.8833,
        "default_units": "BIM 5",
        "description": "Última línea de contención antes de Puerto Argentino."
    },
    "pradera del ganso": {
        "display": "Pradera del Ganso (Goose Green)",
        "lat": -51.8286,
        "lng": -58.9714,
        "default_units": "RI 12, RI 25",
        "description": "Batalla del istmo de Darwin y Pradera del Ganso."
    },
    "goose green": {
        "display": "Pradera del Ganso (Goose Green)",
        "lat": -51.8286,
        "lng": -58.9714,
        "default_units": "RI 12, RI 25",
        "description": "Batalla del istmo de Darwin y Pradera del Ganso."
    },
    "darwin": {
        "display": "Darwin",
        "lat": -51.8167,
        "lng": -58.9500,
        "default_units": "RI 12, RI 25",
        "description": "Sector del istmo y emplazamiento del cementerio militar argentino."
    },
    "san carlos": {
        "display": "Bahía San Carlos / Estrecho de San Carlos",
        "lat": -51.5000,
        "lng": -59.0833,
        "default_units": "Fuerza Aérea, Armada Argentina",
        "description": "Cabecera de playa del desembarco británico y ataques aeronavales."
    },
    "puerto argentino": {
        "display": "Puerto Argentino",
        "lat": -51.7000,
        "lng": -57.8500,
        "default_units": "Comando Conjunto Malvinas",
        "description": "Capital y centro logístico y poblacional principal."
    },
    "bam malvinas": {
        "display": "Base Aérea Militar Malvinas (Aeropuerto)",
        "lat": -51.6778,
        "lng": -57.7778,
        "default_units": "Fuerza Aérea Argentina",
        "description": "Pista operativa sujeta a bombardeos continuos que nunca dejó de operar."
    },
    "aeropuerto": {
        "display": "Base Aérea Militar Malvinas (Aeropuerto)",
        "lat": -51.6778,
        "lng": -57.7778,
        "default_units": "Fuerza Aérea Argentina",
        "description": "Pista aérea de Puerto Argentino."
    },
    "bahia fox": {
        "display": "Bahía Fox (Fox Bay)",
        "lat": -51.9667,
        "lng": -60.0833,
        "default_units": "RI 8, Ca Ing 9",
        "description": "Emplazamiento defensivo en Gran Malvina."
    },
    "puerto howard": {
        "display": "Puerto Mitre (Puerto Howard)",
        "lat": -51.6167,
        "lng": -59.5333,
        "default_units": "RI 5",
        "description": "Guarnición argentina en el norte de Gran Malvina."
    },
    "isla borbon": {
        "display": "Isla Borbón (Pebble Island)",
        "lat": -51.3167,
        "lng": -59.6167,
        "default_units": "Estación Aeronaval Malvinas",
        "description": "Base auxiliar atacada por fuerzas especiales británicas el 15 de mayo."
    },
    "bahia agradable": {
        "display": "Bahía Agradable (Fitz Roy)",
        "lat": -51.7833,
        "lng": -58.2167,
        "default_units": "Fuerza Aérea Argentina",
        "description": "Ataques de la V Brigada Aérea el 8 de junio de 1982."
    },
    "fitz roy": {
        "display": "Bahía Agradable (Fitz Roy)",
        "lat": -51.7833,
        "lng": -58.2167,
        "default_units": "Fuerza Aérea Argentina",
        "description": "Ataques aéreos contra la flota británica el 8 de junio."
    }
}

MILITARY_UNITS = [
    "RI Mec 7", "RI 7", "Regimiento 7",
    "RI 4", "Regimiento 4",
    "RI 12", "Regimiento 12",
    "RI 25", "Regimiento 25",
    "RI 8", "Regimiento 8",
    "RI 5", "Regimiento 5",
    "BIM 5", "Batallón de Infantería de Marina 5",
    "BIM 2",
    "Fuerza Aérea", "Grupo 5 de Caza", "Grupo 4 de Caza",
    "Armada Argentina", "Aviación Naval", "ARA General Belgrano",
    "Prefectura Naval", "GC-82 Islas Malvinas", "GC-83 Río Iguazú",
    "Gendarmería Nacional", "Escuadrón Alacrán",
    "Compañía de Comandos 601", "Compañía de Comandos 602",
]

def normalize(text: str) -> str:
    """Normaliza texto para búsquedas sin acentos."""
    if not text:
        return ""
    text = text.lower()
    return "".join(c for c in unicodedata.normalize("NFD", text) if unicodedata.category(c) != "Mn")

def extract_events_from_message(message: str):
    """
    Analiza un mensaje testimonial e identifica lugares, coordenadas,
    fechas aproximadas y unidades militares para generar eventos estructurados.
    """
    if not message or len(message.strip()) < 10:
        return []

    norm_msg = normalize(message)
    detected_events = []

    for key, data in MALVINAS_TOPONYMY.items():
        if key in norm_msg:
            # Buscar unidades
            units_found = []
            for unit in MILITARY_UNITS:
                if normalize(unit) in norm_msg:
                    units_found.append(unit)
            if not units_found and data.get("default_units"):
                units_found.append(data["default_units"])

            # Buscar fecha
            date_match = ""
            date_patterns = [
                r"\b(\d{1,2}\s+de\s+(?:abril|mayo|junio))\b",
                r"\b((?:abril|mayo|junio)\s+de\s+1982)\b",
                r"\b(\d{1,2}/\d{1,2}(?:/1982)?)\b",
                r"\b(11\s+de\s+junio|12\s+de\s+junio|13\s+de\s+junio|14\s+de\s+junio|2\s+de\s+abril|28\s+de\s+mayo|8\s+de\s+junio)\b"
            ]
            for p in date_patterns:
                m = re.search(p, message, re.IGNORECASE)
                if m:
                    date_match = m.group(1)
                    break

            # Extraer cita textual relevante
            sentences = re.split(r"[.\n]", message)
            best_quote = message.strip()
            for s in sentences:
                if key in normalize(s) and len(s.strip()) > 15:
                    best_quote = s.strip()
                    break

            detected_events.append({
                "title": f"Acontecimiento en {data['display']}",
                "toponymy": data["display"],
                "latitude": data["lat"],
                "longitude": data["lng"],
                "event_date": date_match if date_match else "Conflicto 1982",
                "units_involved": ", ".join(units_found),
                "description": f"Relato testimonial ubicado en {data['display']}. {data['description']}",
                "quote": f'"{best_quote}"',
                "confidence": 0.95 if date_match else 0.88,
            })

    return detected_events
