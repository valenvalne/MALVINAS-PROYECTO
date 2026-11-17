import re
import unicodedata

# Diccionario georreferenciado oficial de toponimia histórica de Malvinas (WGS84)
MALVINAS_TOPONYMY = {
    # 1. Operación Rosario / Desembarco 2 de Abril (Puerto Argentino / Playas)
    "desembarco del 2 de abril": {
        "display": "Puerto Argentino / Playa Roja (Desembarco 2 de Abril, Operación Rosario)",
        "lat": -51.6917,
        "lng": -57.8167,
        "default_units": "BIM 2, RI 25, Comandos Anfibios, Buzos Tácticos",
        "description": "Recuperación de la soberanía sobre las Islas Malvinas el 2 de abril de 1982 sin bajas enemigas."
    },
    "desembarcaron": {
        "display": "Puerto Argentino / Playa Roja (Desembarco 2 de Abril, Operación Rosario)",
        "lat": -51.6917,
        "lng": -57.8167,
        "default_units": "BIM 2, RI 25, Comandos Anfibios, Buzos Tácticos",
        "description": "Recuperación de la soberanía sobre las Islas Malvinas el 2 de abril de 1982 sin bajas enemigas."
    },
    "desembarco": {
        "display": "Puerto Argentino / Playa Roja (Desembarco 2 de Abril, Operación Rosario)",
        "lat": -51.6917,
        "lng": -57.8167,
        "default_units": "BIM 2, RI 25, Comandos Anfibios, Buzos Tácticos",
        "description": "Recuperación de la soberanía sobre las Islas Malvinas el 2 de abril de 1982 sin bajas enemigas."
    },
    "operacion rosario": {
        "display": "Puerto Argentino / Playa Roja (Operación Rosario)",
        "lat": -51.6917,
        "lng": -57.8167,
        "default_units": "BIM 2, RI 25, Comandos Anfibios, Buzos Tácticos",
        "description": "Histórica Operación Rosario que recuperó las islas sin bajas enemigas."
    },
    "playa roja": {
        "display": "Playa Roja (Bahía Yorke - Desembarco de Blindados VAO)",
        "lat": -51.6833,
        "lng": -57.7833,
        "default_units": "BIM 2, RI 25",
        "description": "Punto de desembarco de los vehículos anfibios VAO el 2 de abril."
    },
    "playa caiman": {
        "display": "Playa Caimán (Desembarco de Comandos Anfibios)",
        "lat": -51.7000,
        "lng": -57.8000,
        "default_units": "Agrupación Comandos Anfibios",
        "description": "Desembarco nocturno de los Comandos Anfibios desde el destructor ARA Santísima Trinidad."
    },
    "punta celebroña": {
        "display": "Punta Celebroña (Desembarco de Buzos Tácticos)",
        "lat": -51.6500,
        "lng": -57.7500,
        "default_units": "Agrupación de Buzos Tácticos",
        "description": "Punto de infiltración submarina de los Buzos Tácticos desde el submarino ARA Santa Fe."
    },
    "bahia yorke": {
        "display": "Bahía Yorke (Sector Desembarco y Pista Aérea)",
        "lat": -51.6833,
        "lng": -57.7833,
        "default_units": "BIM 2, Fuerza Aérea",
        "description": "Ensenada de aproximación y desembarco del 2 de abril."
    },
    "moody brook": {
        "display": "Cuartel de Moody Brook",
        "lat": -51.6967,
        "lng": -57.9033,
        "default_units": "Comandos Anfibios, BIM 2",
        "description": "Antiguo cuartel de los Royal Marines tomado pacíficamente el 2 de abril."
    },

    # 2. Crucero ARA General Belgrano
    "crucero belgrano": {
        "display": "Crucero ARA General Belgrano (Zona de Ataque Sur)",
        "lat": -55.4000,
        "lng": -61.4167,
        "default_units": "Armada Argentina (ARA General Belgrano)",
        "description": "Torpedeamiento del Crucero Belgrano fuera de la zona de exclusión el 2 de mayo de 1982."
    },
    "general belgrano": {
        "display": "Crucero ARA General Belgrano (Zona de Ataque Sur)",
        "lat": -55.4000,
        "lng": -61.4167,
        "default_units": "Armada Argentina (ARA General Belgrano)",
        "description": "Torpedeamiento del Crucero Belgrano fuera de la zona de exclusión el 2 de mayo de 1982."
    },
    "belgrano": {
        "display": "Crucero ARA General Belgrano (Zona de Ataque Sur)",
        "lat": -55.4000,
        "lng": -61.4167,
        "default_units": "Armada Argentina (ARA General Belgrano)",
        "description": "Torpedeamiento del Crucero Belgrano fuera de la zona de exclusión el 2 de mayo de 1982."
    },

    # 3. Georgias del Sur / Grytviken / Puerto Leith
    "georgia": {
        "display": "Islas Georgias del Sur (Grytviken / Puerto Leith)",
        "lat": -54.2833,
        "lng": -36.5000,
        "default_units": "ARA Guerrico, Infantería de Marina",
        "description": "Izamiento inicial de la bandera el 19 de marzo y combate de Grytviken el 3 de abril."
    },
    "grytviken": {
        "display": "Grytviken (Islas Georgias del Sur)",
        "lat": -54.2833,
        "lng": -36.5000,
        "default_units": "ARA Guerrico, Armada Argentina",
        "description": "Recuperación de Grytviken el 3 de abril por la corbeta ARA Guerrico."
    },
    "puerto leith": {
        "display": "Puerto Leith (Islas Georgias del Sur)",
        "lat": -54.1417,
        "lng": -36.6833,
        "default_units": "Obreros Civiles Davidoff, Armada Argentina",
        "description": "Lugar del izamiento del pabellón nacional el 19 de marzo de 1982."
    },

    # 4. Montes y Frentes de Combate (Isla Soledad)
    "monte longdon": {
        "display": "Monte Longdon",
        "lat": -51.6667,
        "lng": -57.9833,
        "default_units": "RI Mec 7, Ca Ing 10, BIM 5",
        "description": "Cruento combate nocturno cuerpo a cuerpo del 11 al 12 de junio de 1982."
    },
    "longdon": {
        "display": "Monte Longdon",
        "lat": -51.6667,
        "lng": -57.9833,
        "default_units": "RI Mec 7, Ca Ing 10, BIM 5",
        "description": "Cruento combate nocturno cuerpo a cuerpo del 11 al 12 de junio de 1982."
    },
    "dos hermanas": {
        "display": "Monte Dos Hermanas (Two Sisters)",
        "lat": -51.6942,
        "lng": -58.0319,
        "default_units": "RI 4, Ca Com 6",
        "description": "Combates en la cresta defensiva occidental la noche del 11 al 12 de junio."
    },
    "two sisters": {
        "display": "Monte Dos Hermanas (Two Sisters)",
        "lat": -51.6942,
        "lng": -58.0319,
        "default_units": "RI 4, Ca Com 6",
        "description": "Combates en la cresta defensiva occidental la noche del 11 al 12 de junio."
    },
    "monte harriet": {
        "display": "Monte Harriet",
        "lat": -51.7167,
        "lng": -58.0167,
        "default_units": "RI 4",
        "description": "Posición defensiva atacada por fuerzas británicas el 11 y 12 de junio."
    },
    "harriet": {
        "display": "Monte Harriet",
        "lat": -51.7167,
        "lng": -58.0167,
        "default_units": "RI 4",
        "description": "Posición defensiva atacada por fuerzas británicas el 11 y 12 de junio."
    },
    "tumbledown": {
        "display": "Monte Tumbledown",
        "lat": -51.7000,
        "lng": -57.9333,
        "default_units": "BIM 5, RI 4",
        "description": "Legendaria defensa nocturna entre el BIM 5 y la Guardia Escocesa británica el 13 y 14 de junio."
    },
    "monte tumbledown": {
        "display": "Monte Tumbledown",
        "lat": -51.7000,
        "lng": -57.9333,
        "default_units": "BIM 5, RI 4",
        "description": "Legendaria defensa nocturna entre el BIM 5 y la Guardia Escocesa británica el 13 y 14 de junio."
    },
    "monte williams": {
        "display": "Monte Williams",
        "lat": -51.7100,
        "lng": -57.9200,
        "default_units": "BIM 5",
        "description": "Posición de retaguardia y apoyo al combate de Tumbledown."
    },
    "williams": {
        "display": "Monte Williams",
        "lat": -51.7100,
        "lng": -57.9200,
        "default_units": "BIM 5",
        "description": "Posición de retaguardia y apoyo al combate de Tumbledown."
    },
    "sapper hill": {
        "display": "Monte Sapper Hill (Colina Zapador)",
        "lat": -51.7167,
        "lng": -57.8833,
        "default_units": "BIM 5, Escuadrón Panhard",
        "description": "Última línea de contención antes de Puerto Argentino el 14 de junio."
    },
    "colina zapador": {
        "display": "Monte Sapper Hill (Colina Zapador)",
        "lat": -51.7167,
        "lng": -57.8833,
        "default_units": "BIM 5, Escuadrón Panhard",
        "description": "Última línea de contención antes de Puerto Argentino el 14 de junio."
    },
    "wireless ridge": {
        "display": "Wireless Ridge (Crestas Inalámbricas)",
        "lat": -51.6750,
        "lng": -57.8833,
        "default_units": "RI Mec 7",
        "description": "Heroica contención frente al 2 Para británico la noche del 13 al 14 de junio."
    },
    "wireless": {
        "display": "Wireless Ridge (Crestas Inalámbricas)",
        "lat": -51.6750,
        "lng": -57.8833,
        "default_units": "RI Mec 7",
        "description": "Heroica contención frente al 2 Para británico la noche del 13 al 14 de junio."
    },

    # 5. Istmo de Darwin y Pradera del Ganso
    "pradera del ganso": {
        "display": "Pradera del Ganso (Goose Green)",
        "lat": -51.8286,
        "lng": -58.9714,
        "default_units": "RI 12, RI 25, GA 3",
        "description": "Batalla del istmo de Darwin y Pradera del Ganso del 28 al 29 de mayo."
    },
    "goose green": {
        "display": "Pradera del Ganso (Goose Green)",
        "lat": -51.8286,
        "lng": -58.9714,
        "default_units": "RI 12, RI 25, GA 3",
        "description": "Batalla del istmo de Darwin y Pradera del Ganso del 28 al 29 de mayo."
    },
    "darwin": {
        "display": "Darwin",
        "lat": -51.8167,
        "lng": -58.9500,
        "default_units": "RI 12, RI 25",
        "description": "Sector del istmo donde combatió la sección del Teniente Estévez."
    },

    # 6. San Carlos y Bahías Principales
    "san carlos": {
        "display": "Bahía San Carlos / Estrecho de San Carlos",
        "lat": -51.5000,
        "lng": -59.0833,
        "default_units": "Fuerza Aérea, Armada Argentina, RI 12",
        "description": "Cabecera del desembarco británico y escenario de 'El Callejón de las Bombas'."
    },
    "callejon de las bombas": {
        "display": "Estrecho de San Carlos (Callejón de las Bombas)",
        "lat": -51.5000,
        "lng": -59.0833,
        "default_units": "Fuerza Aérea Argentina, Aviación Naval",
        "description": "Ataques rasantes históricos contra la flota naval británica."
    },
    "bahia agradable": {
        "display": "Bahía Agradable (Fitz Roy)",
        "lat": -51.7833,
        "lng": -58.2167,
        "default_units": "Fuerza Aérea Argentina",
        "description": "Ataques de la V y VI Brigadas Aéreas el 8 de junio de 1982 ('El día más negro de la flota')."
    },
    "fitz roy": {
        "display": "Bahía Agradable (Fitz Roy)",
        "lat": -51.7833,
        "lng": -58.2167,
        "default_units": "Fuerza Aérea Argentina",
        "description": "Ataques aéreos contra buques británicos Sir Galahad y Sir Tristram el 8 de junio."
    },

    # 7. Puerto Argentino e Instalaciones
    "puerto argentino": {
        "display": "Puerto Argentino",
        "lat": -51.7000,
        "lng": -57.8500,
        "default_units": "Comando Conjunto Malvinas",
        "description": "Capital y centro logístico y poblacional principal de las Islas Malvinas."
    },
    "stanley": {
        "display": "Puerto Argentino",
        "lat": -51.7000,
        "lng": -57.8500,
        "default_units": "Comando Conjunto Malvinas",
        "description": "Capital y centro logístico y poblacional principal de las Islas Malvinas."
    },
    "bam malvinas": {
        "display": "Base Aérea Militar Malvinas (Aeropuerto)",
        "lat": -51.6778,
        "lng": -57.7778,
        "default_units": "Fuerza Aérea Argentina, GADA 601",
        "description": "Pista operativa de Puerto Argentino que resistió bombardeos incesantes sin dejar de operar."
    },
    "aeropuerto": {
        "display": "Base Aérea Militar Malvinas (Aeropuerto)",
        "lat": -51.6778,
        "lng": -57.7778,
        "default_units": "Fuerza Aérea Argentina, GADA 601",
        "description": "Pista operativa de Puerto Argentino que resistió bombardeos incesantes sin dejar de operar."
    },
    "peninsula camber": {
        "display": "Península Camber",
        "lat": -51.6833,
        "lng": -57.8500,
        "default_units": "BIM 5, Prefectura Naval",
        "description": "Península defensiva al norte de Puerto Argentino."
    },
    "camber": {
        "display": "Península Camber",
        "lat": -51.6833,
        "lng": -57.8500,
        "default_units": "BIM 5, Prefectura Naval",
        "description": "Península defensiva al norte de Puerto Argentino."
    },
    "hospital militar": {
        "display": "Hospital Militar de Puerto Argentino",
        "lat": -51.6975,
        "lng": -57.8550,
        "default_units": "Sanidad Militar Conjunta",
        "description": "Atención médica y quirúrgica constante a los combatientes heridos."
    },
    "apostadero naval": {
        "display": "Apostadero Naval Malvinas (Muelle de Puerto Argentino)",
        "lat": -51.6950,
        "lng": -57.8520,
        "default_units": "Armada Argentina, Prefectura Naval",
        "description": "Base de operaciones navales y de los guardacostas GC-82 y GC-83."
    },

    # 8. Gran Malvina
    "bahia fox": {
        "display": "Bahía Fox (Fox Bay)",
        "lat": -51.9667,
        "lng": -60.0833,
        "default_units": "RI 8, Ca Ing 9",
        "description": "Emplazamiento defensivo en el sur de Gran Malvina."
    },
    "puerto howard": {
        "display": "Puerto Mitre (Puerto Howard)",
        "lat": -51.6167,
        "lng": -59.5333,
        "default_units": "RI 5",
        "description": "Guarnición argentina en el norte de Gran Malvina."
    },
    "puerto mitre": {
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
        "description": "Base aeronaval auxiliar atacada el 15 de mayo de 1982."
    },
    "gran malvina": {
        "display": "Gran Malvina (Sector General)",
        "lat": -51.7500,
        "lng": -60.0000,
        "default_units": "RI 5, RI 8",
        "description": "Teatro de operaciones en la isla occidental del archipiélago."
    },
    "isla soledad": {
        "display": "Isla Soledad (Sector General)",
        "lat": -51.7500,
        "lng": -58.5000,
        "default_units": "Comando Conjunto Malvinas",
        "description": "Teatro de operaciones en la isla oriental del archipiélago."
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
    "BIM 2", "Batallón de Infantería de Marina 2",
    "Comandos Anfibios", "Agrupación Comandos Anfibios",
    "Buzos Tácticos", "Agrupación de Buzos Tácticos",
    "Fuerza Aérea", "Fuerza Aérea Argentina", "Grupo 5 de Caza", "Grupo 4 de Caza",
    "Armada Argentina", "Aviación Naval", "ARA General Belgrano", "ARA Guerrico",
    "Prefectura Naval", "GC-82 Islas Malvinas", "GC-83 Río Iguazú",
    "Gendarmería Nacional", "Escuadrón Alacrán",
    "Compañía de Comandos 601", "Compañía de Comandos 602",
    "Compañía de Ingenieros 10", "Ca Ing 10", "Compañía de Comunicaciones 6",
    "Grupo de Artillería 3", "GA 3", "GADA 601",
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
    if not message or len(message.strip()) < 5:
        return []

    norm_msg = normalize(message)
    detected_events = []
    seen_topos = set()

    # Ordenar claves de mayor a menor longitud para priorizar nombres específicos
    sorted_keys = sorted(MALVINAS_TOPONYMY.keys(), key=lambda k: len(k), reverse=True)

    for key in sorted_keys:
        data = MALVINAS_TOPONYMY[key]
        if key in norm_msg and data["display"] not in seen_topos:
            seen_topos.add(data["display"])

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

            if not date_match and ("desembarco" in key or "2 de abril" in norm_msg):
                date_match = "2 de abril de 1982"

            # Extraer cita textual relevante
            sentences = re.split(r"[.\n]", message)
            best_quote = message.strip()
            for s in sentences:
                if key in normalize(s) and len(s.strip()) > 10:
                    best_quote = s.strip()
                    break

            detected_events.append({
                "title": f"Acontecimiento en {data['display']}",
                "toponymy": data["display"],
                "latitude": data["lat"],
                "longitude": data["lng"],
                "event_date": date_match if date_match else "Conflicto 1982",
                "units_involved": ", ".join(units_found[:3]),
                "description": f"Relato testimonial ubicado en {data['display']}. {data['description']}",
                "quote": f'"{best_quote}"',
                "confidence": 0.95 if date_match else 0.90,
            })

    return detected_events


def extract_father_name(text: str):
    """
    Detecta si un familiar menciona el nombre de su padre o familiar veterano.
    """
    if not text:
        return None
    patterns = [
        r'(?:mi papa|mi padre|mi papá|mi tio|mi tío|mi abuelo|mi hermano|mi esposo|mi marido|mi familiar|el veterano)\s+(?:se llamaba|se llama|era|fue|es)\s+([A-Za-zÀ-ſ]+(?:\s+[A-Za-zÀ-ſ]+){0,3})',
        r'(?:nombre de mi papa|nombre de mi padre|nombre de mi papá|nombre de mi familiar|nombre del veterano)\s+(?:era|fue|es|se llamaba)?\s*([A-Za-zÀ-ſ]+(?:\s+[A-Za-zÀ-ſ]+){0,3})',
        r'(?:se llamaba|se llama)\s+([A-Za-zÀ-ſ]+(?:\s+[A-Za-zÀ-ſ]+){0,3})',
    ]
    stop_words = {'del', 'de', 'en', 'y', 'con', 'el', 'la', 'los', 'las', 'que', 'era', 'estuvo', 'un', 'una', 'combatio', 'combatió', 'durante', 'fui'}
    for p in patterns:
        m = re.search(p, text, re.IGNORECASE)
        if m:
            words = m.group(1).strip().split()
            clean = []
            for w in words:
                w_c = re.sub(r'[^A-Za-zÀ-ſ]', '', w)
                if not w_c or w_c.lower() in stop_words:
                    break
                clean.append(w_c.capitalize())
            if clean:
                return ' '.join(clean)
    return None


def extract_person_name(text: str):
    """
    Detecta de forma inteligente el nombre del interlocutor
    a partir de fórmulas coloquiales comunes en español.
    """
    if not text:
        return None

    patterns = [
        r'(?:me llamo|mi nombre es)\s+([A-Za-zÀ-ſ]+(?:\s+[A-Za-zÀ-ſ]+){0,2})',
        r'\b(?:soy|yo soy)\s+(?:el soldado\s+conscripto|el soldado|el conscripto|el veterano|el cabo|el sargento|el subteniente|el teniente)?\s*([A-Za-zÀ-ſ]+(?:\s+[A-Za-zÀ-ſ]+){0,2})'
    ]
    ignored = {
        'veterano', 'familiar', 'un', 'una', 'hijo', 'hija', 'esposa', 'hermano', 'sobrino',
        'nieto', 'argentino', 'conscripto', 'soldado', 'de', 'del', 'la', 'otro', 'testimonio',
        'guerra', 'combatiente', 'excombatiente', 'quien', 'alguien', 'el', 'los', 'las', 'muy'
    }
    stop_words = {'del', 'de', 'en', 'y', 'con', 'el', 'la', 'los', 'las', 'que', 'para', 'por', 'durante', 'estuve', 'era', 'mi', 'su', 'soy', 'un', 'una'}

    for p in patterns:
        m = re.search(p, text, re.IGNORECASE)
        if m:
            candidate = m.group(1).strip()
            words = candidate.split()
            if words and words[0].lower() not in ignored:
                clean_words = []
                for w in words:
                    if w.lower() in stop_words or w.lower() in ignored:
                        break
                    clean_words.append(w.capitalize())
                if clean_words:
                    return ' '.join(clean_words)
    return None


def interpret_central_event(text_norm: str, place_name: str = "", unit: str = "", father_name: str = "") -> str:
    """
    Interpreta de manera analítica y respetuosa el hecho central más importante
    del relato testimonial, extrayendo el núcleo de la vivencia sin suponer datos no expresados.
    """
    vet_prefix = f"Don {father_name}" if father_name else ""

    # 1. Homenaje de familiar relatando sobre su padre o familiar veterano
    if father_name and not any(k in text_norm for k in ["yo estuve", "yo combati", "desembarque", "fui desplegado"]):
        loc = f" en {place_name}" if place_name else ""
        u = f" junto al {unit}" if unit else ""
        return f"Homenaje testimonial y memoria del servicio militar de {vet_prefix}{loc}{u}."

    # 2. Desembarco / 2 de Abril / Operación Rosario
    if any(k in text_norm for k in ["desembarco", "operacion rosario", "2 de abril", "playa roja", "playa caiman", "vehiculos anfibios", "vao"]):
        loc = f" en {place_name}" if place_name else ""
        u = f" junto al {unit}" if unit else ""
        if loc or u:
            return f"Participación en el desembarco del 2 de abril (Operación Rosario){loc}{u}."
        return "Participación en el desembarco anfibio del 2 de abril (Operación Rosario) y recuperación de la soberanía nacional en las islas."

    # 3. Ataque y hundimiento del Crucero ARA General Belgrano
    if any(k in text_norm for k in ["belgrano", "torpedeo", "conqueror", "balsas"]):
        return "Supervivencia al ataque al Crucero ARA General Belgrano y rescate en las aguas gélidas del Atlántico Sur."

    # 4. Georgias del Sur (Grytviken / Leith)
    if any(k in text_norm for k in ["georgia", "grytviken", "leith", "guerrico"]):
        return "Acciones de recuperación y defensa de la soberanía en las Islas Georgias del Sur (Grytviken / Puerto Leith)."

    # 5. Fuerza Aérea / Bautismo de Fuego
    if any(k in text_norm for k in ["bautismo de fuego", "1 de mayo", "skyhawk", "mirage", "dagger", "canberra", "salidas de combate"]):
        return "Misiones de combate aéreo y defensa del espacio soberano de las islas."

    # 6. Combates en los Montes (Monte Longdon, Tumbledown, Harriet, Dos Hermanas, etc.)
    if "longdon" in text_norm:
        u = f" junto al {unit}" if unit else ""
        return f"Defensa de la posición y combate en Monte Longdon durante la ofensiva británica{u}."
    if "tumbledown" in text_norm:
        u = f" junto al {unit}" if unit else ""
        return f"Defensa de la posición y combate nocturno en Monte Tumbledown{u}."
    if any(k in text_norm for k in ["dos hermanas", "two sisters", "harriet", "williams", "sapper hill", "wireless ridge"]):
        u = f" junto al {unit}" if unit else ""
        loc = place_name or "las laderas y crestas defensivas"
        return f"Resistencia y defensa en {loc}{u}."

    # 7. Darwin / Pradera del Ganso (Goose Green)
    if any(k in text_norm for k in ["darwin", "pradera del ganso", "goose green"]):
        u = f" junto al {unit}" if unit else ""
        return f"Participación en los combates del istmo de Darwin y Pradera del Ganso{u}."

    # 8. Estrecho de San Carlos / Callejón de las Bombas
    if any(k in text_norm for k in ["san carlos", "callejon de las bombas"]):
        return "Acciones de combate y contención frente al desembarco británico en el Estrecho de San Carlos."

    # 9. Bahía Agradable / Fitz Roy
    if any(k in text_norm for k in ["fitz roy", "bahia agradable"]):
        return "Acciones de combate y ataque aeronaval en Bahía Agradable (Fitz Roy)."

    # 10. Memoria de compañeros caídos o heridos
    if any(k in text_norm for k in ["camarada caido", "companero caido", "amigo caido", "murio a mi lado", "cayo en combate", "perdimos a"]):
        return "Memoria sagrada, auxilio a heridos y homenaje a los camaradas caídos en defensa de la Patria."

    # 11. Pozos de zorro / frío / nieve / artillería
    if any(k in text_norm for k in ["bombardeo", "artilleria naval", "pozo de zorro", "pozos", "frio", "nieve", "trinchera"]):
        loc = f" en {place_name}" if place_name else ""
        return f"Resistencia en posiciones defensivas y trincheras{loc} bajo condiciones climáticas extremas y hostigamiento de fuego."

    # 12. Lugar identificado
    if place_name:
        u = f" con el {unit}" if unit else ""
        return f"Despliegue y servicio militar en {place_name}{u} durante el conflicto bélico de 1982."

    # 13. Testimonio general
    return "Vivencia testimonial y memoria del servicio militar durante la Guerra de Malvinas."
