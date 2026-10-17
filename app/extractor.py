import re
import unicodedata

# Niveles de zoom de Leaflet a partir de los cuales cada ícono se individualiza en el mapa
# (coinciden con las "Escalas" del portal: 8 = archipiélago, 10-11 = isla/región, 13+ = local)
ZOOM_ARCHIPIELAGO = 8
ZOOM_REGION = 11
ZOOM_ZONA = 12
ZOOM_POBLADO = 13
ZOOM_SITIO = 14

# Diccionario georreferenciado oficial de toponimia histórica de Malvinas (WGS84)
MALVINAS_TOPONYMY = {
    "monte longdon": {
        "display": "Monte Longdon",
        "lat": -51.6667,
        "lng": -57.9833,
        "zoom": ZOOM_SITIO,
        "default_units": "RI Mec 7",
        "description": "Combate nocturno del 11 al 12 de junio de 1982."
    },
    "dos hermanas": {
        "display": "Monte Dos Hermanas (Two Sisters)",
        "lat": -51.6942,
        "lng": -58.0319,
        "zoom": ZOOM_SITIO,
        "default_units": "RI 4",
        "description": "Combates en la cresta defensiva occidental."
    },
    "monte harriet": {
        "display": "Monte Harriet",
        "lat": -51.7167,
        "lng": -58.0167,
        "zoom": ZOOM_SITIO,
        "default_units": "RI 4",
        "description": "Posición defensiva atacada el 11 de junio."
    },
    "tumbledown": {
        "display": "Monte Tumbledown",
        "lat": -51.7000,
        "lng": -57.9333,
        "zoom": ZOOM_SITIO,
        "default_units": "BIM 5",
        "description": "Cruento combate nocturno entre el BIM 5 y la Guardia Escocesa."
    },
    "monte williams": {
        "display": "Monte Williams",
        "lat": -51.7100,
        "lng": -57.9200,
        "zoom": ZOOM_SITIO,
        "default_units": "BIM 5",
        "description": "Posición de retaguardia y apoyo al combate de Tumbledown."
    },
    "sapper hill": {
        "display": "Monte Sapper Hill",
        "lat": -51.7167,
        "lng": -57.8833,
        "zoom": ZOOM_SITIO,
        "default_units": "BIM 5",
        "description": "Última línea de contención antes de Puerto Argentino."
    },
    "pradera del ganso": {
        "display": "Pradera del Ganso (Goose Green)",
        "lat": -51.8286,
        "lng": -58.9714,
        "zoom": ZOOM_POBLADO,
        "default_units": "RI 12, RI 25",
        "description": "Batalla del istmo de Darwin y Pradera del Ganso."
    },
    "goose green": {
        "display": "Pradera del Ganso (Goose Green)",
        "lat": -51.8286,
        "lng": -58.9714,
        "zoom": ZOOM_POBLADO,
        "default_units": "RI 12, RI 25",
        "description": "Batalla del istmo de Darwin y Pradera del Ganso."
    },
    "darwin": {
        "display": "Darwin",
        "lat": -51.8167,
        "lng": -58.9500,
        "zoom": ZOOM_POBLADO,
        "default_units": "RI 12, RI 25",
        "description": "Sector del istmo y emplazamiento del cementerio militar argentino."
    },
    "san carlos": {
        "display": "Bahía San Carlos / Estrecho de San Carlos",
        "lat": -51.5000,
        "lng": -59.0833,
        "zoom": ZOOM_REGION,
        "default_units": "Fuerza Aérea, Armada Argentina",
        "description": "Cabecera de playa del desembarco británico y ataques aeronavales."
    },
    "puerto argentino": {
        "display": "Puerto Argentino",
        "lat": -51.7000,
        "lng": -57.8500,
        "zoom": ZOOM_POBLADO,
        "default_units": "Comando Conjunto Malvinas",
        "description": "Capital y centro logístico y poblacional principal."
    },
    "bam malvinas": {
        "display": "Base Aérea Militar Malvinas (Aeropuerto)",
        "lat": -51.6778,
        "lng": -57.7778,
        "zoom": ZOOM_SITIO,
        "default_units": "Fuerza Aérea Argentina",
        "description": "Pista operativa sujeta a bombardeos continuos que nunca dejó de operar."
    },
    "aeropuerto": {
        "display": "Base Aérea Militar Malvinas (Aeropuerto)",
        "lat": -51.6778,
        "lng": -57.7778,
        "zoom": ZOOM_SITIO,
        "default_units": "Fuerza Aérea Argentina",
        "description": "Pista aérea de Puerto Argentino."
    },
    "bahia fox": {
        "display": "Bahía Fox (Fox Bay)",
        "lat": -51.9667,
        "lng": -60.0833,
        "zoom": ZOOM_POBLADO,
        "default_units": "RI 8, Ca Ing 9",
        "description": "Emplazamiento defensivo en Gran Malvina."
    },
    "puerto howard": {
        "display": "Puerto Mitre (Puerto Howard)",
        "lat": -51.6167,
        "lng": -59.5333,
        "zoom": ZOOM_POBLADO,
        "default_units": "RI 5",
        "description": "Guarnición argentina en el norte de Gran Malvina."
    },
    "isla borbon": {
        "display": "Isla Borbón (Pebble Island)",
        "lat": -51.3167,
        "lng": -59.6167,
        "zoom": ZOOM_ZONA,
        "default_units": "Estación Aeronaval Malvinas",
        "description": "Base auxiliar atacada por fuerzas especiales británicas el 15 de mayo."
    },
    "bahia agradable": {
        "display": "Bahía Agradable (Fitz Roy)",
        "lat": -51.7833,
        "lng": -58.2167,
        "zoom": ZOOM_ZONA,
        "default_units": "Fuerza Aérea Argentina",
        "description": "Ataques de la V Brigada Aérea el 8 de junio de 1982."
    },
    "fitz roy": {
        "display": "Bahía Agradable (Fitz Roy)",
        "lat": -51.7833,
        "lng": -58.2167,
        "zoom": ZOOM_ZONA,
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

DATE_PATTERNS = [
    r"\b(\d{1,2}\s+de\s+(?:abril|mayo|junio))\b",
    r"\b((?:abril|mayo|junio)\s+de\s+1982)\b",
    r"\b(\d{1,2}/\d{1,2}(?:/1982)?)\b",
    r"\b((?:principios|mediados|fines)\s+de\s+(?:abril|mayo|junio))\b",
    r"\b(?:en|durante)\s+((?:abril|mayo|junio))\b",
]

def extract_date(message: str) -> str:
    """Devuelve la primera fecha o período de 1982 mencionado en el mensaje (o cadena vacía)."""
    for p in DATE_PATTERNS:
        m = re.search(p, message or "", re.IGNORECASE)
        if m:
            return m.group(1)
    return ""

def extract_units(message: str) -> list:
    """Devuelve las unidades militares mencionadas explícitamente en el mensaje."""
    norm_msg = normalize(message)
    found = []
    for unit in MILITARY_UNITS:
        # Coincidencia por palabra completa para no confundir "RI 7" con "RI 7x" ni "RI 4" con "RI 45"
        if re.search(r"(?<![\w])" + re.escape(normalize(unit)) + r"(?![\w])", norm_msg):
            found.append(unit)
    return found

NAME_PATTERN = re.compile(
    r"(?i:me llamo|mi nombre es)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){0,3})"
)

def extract_witness_data(message: str) -> dict:
    """Detecta datos de identidad del testimoniante: nombre y preferencia de privacidad."""
    result = {}
    m = NAME_PATTERN.search(message or "")
    if m:
        result["name"] = m.group(1).strip()

    norm_msg = normalize(message)
    if "anonim" in norm_msg:
        result["privacy_level"] = "Anónimo"
    elif "iniciales" in norm_msg:
        result["privacy_level"] = "Solo Iniciales"
    elif any(w in norm_msg for w in ["con mi nombre", "nombre completo", "nombre publico"]):
        result["privacy_level"] = "Nombre Público"
    return result

def extract_events_from_message(message: str, fallback_date: str = "", fallback_units: str = ""):
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
            units_found = extract_units(message) or ([fallback_units] if fallback_units else [])
            if not units_found and data.get("default_units"):
                units_found.append(data["default_units"])

            date_match = extract_date(message) or fallback_date

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
                "zoom_level": data.get("zoom", ZOOM_REGION),
            })

    return detected_events
