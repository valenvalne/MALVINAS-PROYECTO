import os
import re
import json
import logging
import requests
from typing import List, Dict, Any, Optional

from .services import get_system_prompt
from .extractor import MALVINAS_TOPONYMY, MILITARY_UNITS, normalize, extract_person_name, extract_father_name, interpret_central_event

logger = logging.getLogger(__name__)


def build_conversation_payload(history_records: list, current_user_message: str) -> List[Dict[str, str]]:
    """
    Construye un historial limpio y estructurado para la API de Claude / LLM,
    garantizando alternancia estricta de roles (user -> assistant -> user)
    y evitando duplicaciones del mensaje actual.
    """
    messages_payload: List[Dict[str, str]] = []

    records_to_process = list(history_records)
    if records_to_process and getattr(records_to_process[-1], 'role', '') == 'user' and getattr(records_to_process[-1], 'content', '') == current_user_message:
        records_to_process = records_to_process[:-1]

    for h in records_to_process[-12:]:
        role = 'user' if getattr(h, 'role', '') == 'user' else 'assistant'
        content = (getattr(h, 'content', '') or '').strip()
        if not content:
            continue

        if messages_payload and messages_payload[-1]['role'] == role:
            messages_payload[-1]['content'] += "\n" + content
        else:
            messages_payload.append({'role': role, 'content': content})

    if messages_payload and messages_payload[-1]['role'] == 'user':
        messages_payload[-1]['content'] += "\n" + current_user_message
    else:
        messages_payload.append({'role': 'user', 'content': current_user_message})

    while messages_payload and messages_payload[0]['role'] != 'user':
        messages_payload.pop(0)

    return messages_payload


def _call_anthropic_direct(messages_payload: List[Dict[str, str]], system_prompt: str, api_key: str, model_name: str) -> Optional[str]:
    """Llama a la API oficial directa de Anthropic Claude."""
    try:
        from anthropic import Anthropic
        client = Anthropic(api_key=api_key)
        target_model = model_name or 'claude-3-5-sonnet-20241022'
        response = client.messages.create(
            model=target_model,
            max_tokens=500,
            system=system_prompt,
            messages=messages_payload,
            temperature=0.35
        )
        if response.content and len(response.content) > 0:
            logger.info(f"Respuesta generada con éxito por Anthropic Directo ({target_model})")
            return response.content[0].text
    except Exception as e:
        logger.warning(f"Error en Anthropic API directa: {e}")
    return None


def _call_openrouter_claude(messages_payload: List[Dict[str, str]], system_prompt: str, api_key: str, model_name: str) -> Optional[str]:
    """
    Llama a modelos a través de OpenRouter con reintentos adaptativos.
    """
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "HTTP-Referer": "http://localhost:8000",
        "X-Title": "Agente Testimonial Malvinas",
        "Content-Type": "application/json"
    }

    full_messages = [{"role": "system", "content": system_prompt}] + messages_payload

    candidate_models = []
    if model_name:
        candidate_models.append(model_name)
    candidate_models.extend(["openai/gpt-4o-mini", "openai/gpt-4o-mini-2024-07-18"])

    seen = set()
    unique_candidates = [m for m in candidate_models if not (m in seen or seen.add(m))]

    for target_model in unique_candidates:
        for tokens_budget in [180, 120, 80]:
            try:
                payload = {
                    "model": target_model,
                    "messages": full_messages,
                    "max_tokens": tokens_budget,
                    "temperature": 0.35
                }
                resp = requests.post(url, headers=headers, json=payload, timeout=20)
                if resp.status_code == 200:
                    data = resp.json()
                    choice = data.get("choices", [{}])[0]
                    text = choice.get("message", {}).get("content", "").strip()
                    if text:
                        logger.info(f"Respuesta generada con éxito por {target_model} vía OpenRouter")
                        return text
                elif resp.status_code == 402:
                    m = re.search(r"can only afford (\d+)", resp.text)
                    if m:
                        affordable = int(m.group(1))
                        if affordable >= 40 and affordable < tokens_budget:
                            retry_payload = {
                                "model": target_model,
                                "messages": full_messages,
                                "max_tokens": max(35, affordable - 10),
                                "temperature": 0.35
                            }
                            resp_retry = requests.post(url, headers=headers, json=retry_payload, timeout=15)
                            if resp_retry.status_code == 200:
                                text = resp_retry.json().get("choices", [{}])[0].get("message", {}).get("content", "").strip()
                                if text:
                                    return text
                    break
            except Exception as e:
                logger.warning(f"Excepción llamando a OpenRouter ({target_model}): {e}")
                break

    return None





def is_relato_intent(msg_norm: str) -> bool:
    """
    Detecta de forma amplia y precisa si el mensaje expresa la intención de dejar,
    contar, relatar, escribir o compartir un relato, vivencia, testimonio, anécdota o historia,
    o si contiene frases alusivas a dejar su experiencia de Malvinas.
    """
    m = msg_norm.lower().strip()

    standalone = [
        'mi testimonio', 'mi relato', 'mi vivencia', 'mi historia', 'mi anecdota',
        'relato de malvinas', 'testimonio de malvinas', 'vivencia de malvinas',
        'relato de veterano', 'testimonio de veterano', 'dejar relato', 'dejar testimonio',
        'dejar vivencia', 'escribir relato', 'contar relato'
    ]
    if any(m == s or m.startswith(s + ' ') or m.endswith(' ' + s) or (' ' + s + ' ') in m for s in standalone):
        return True

    direct_phrases = [
        'mi relato', 'un relato', 'el relato', 'este relato',
        'mi vivencia', 'una vivencia', 'la vivencia',
        'mi testimonio', 'un testimonio', 'el testimonio',
        'mi historia', 'una historia', 'la historia',
        'mi experiencia', 'una experiencia',
        'mi anecdota', 'una anecdota',
        'lo que vivi', 'lo que pasamos', 'lo que pase', 'lo que nos paso', 'lo que me paso',
        'lo que vivio', 'lo que vivieron', 'lo que le paso'
    ]

    action_verbs = [
        'dejar', 'dejo', 'cuento', 'contar', 'relato', 'relatar',
        'escribir', 'escribo', 'compartir', 'comparto', 'subir', 'subo',
        'aportar', 'aporto', 'registrar', 'registro', 'grabar', 'grabo',
        'pasar', 'paso', 'tengo', 'dar', 'doy', 'publicar', 'publico'
    ]

    has_noun = any(p in m for p in ['relato', 'testimonio', 'vivencia', 'anecdota', 'experiencia', 'historia'])
    has_action = any(v in m for v in action_verbs)
    has_intent_modal = any(mod in m for mod in [
        'quiero', 'quisiera', 'vengo', 'puedo', 'podria', 'deseo',
        'me gustaria', 'gustaria', 'voy a', 'vengo a', 'te puedo', 'te voy a'
    ])

    if any(p in m for p in direct_phrases) and (has_action or has_intent_modal or 'en malvinas' in m or 'de malvinas' in m or 'combate' in m):
        return True

    if has_noun and (has_action or has_intent_modal):
        return True

    if any(m.startswith(start) for start in ['relato de', 'testimonio de', 'vivencia de', 'historia de', 'anecdota de']):
        return True

    if any(k in m for k in ['quiero relatar', 'puedo relatar', 'vengo a relatar', 'voy a relatar', 'te puedo relatar', 'te relato']):
        return True

    if any(k in m for k in ['quiero contar', 'puedo contar', 'vengo a contar', 'voy a contar', 'te puedo contar', 'te cuento']):
        return True

    if 'lo que vivi' in m or 'lo que vivio mi' in m or 'lo que le paso a mi' in m:
        return True

    return False

def is_personal_testimony(msg_norm: str) -> bool:
    """
    Determina con precisión si el mensaje es un testimonio o vivencia personal (o familiar),
    para evitar responder con resúmenes enciclopédicos impersonales.
    """
    markers = [
        "estuve", "estuvimos", "fui", "fuimos", "desembarque", "desembarcamos",
        "combati", "combatimos", "me toco", "nos toco", "llegue", "llegamos",
        "mi historia", "mi vivencia", "mi relato", "mi testimonio",
        "mi papa", "mi padre", "mi hermano", "mi marido", "mi abuelo", "mi tio",
        "mi companero", "mi posicion", "mi regimiento", "mi trinchera", "mi seccion",
        "soy veterano", "soy excombatiente", "soy soldado", "soy conscripto",
        "soy hija", "soy hijo", "soy familiar", "soy viuda", "soy hermano", "soy hermana",
        "quiero contar", "quiero dejar", "vengo a contar", "vengo a registrar",
        "hacer memoria", "dejar mi testimonio", "dejar registrado", "recuerdo que",
        "nosotros estabamos", "estabamos en", "nos atacaron", "nos bombardearon",
        "vengo a", "mi nombre es", "me llamo"
    ]
    return is_relato_intent(msg_norm) or any(m in msg_norm for m in markers)


def is_factual_question(msg_norm: str) -> bool:
    """Detecta si el mensaje es una pregunta histórica factual."""
    return any(k in msg_norm for k in [
        "que ocurrio", "que paso", "que sucedio", "como fue", "cuando fue", "cuando se",
        "quien fue", "quien peleo", "quienes combatieron", "cuantos murieron", "cuantas bajas",
        "por que", "quien comando", "que batallas", "que unidades", "explicame", "contame sobre",
        "que se sabe", "historia de"
    ]) or msg_norm.startswith("¿que") or msg_norm.startswith("que ") or msg_norm.startswith("¿cuando") or msg_norm.startswith("cuando ") or msg_norm.startswith("¿como") or msg_norm.startswith("¿quien")

def answer_historical_query(msg_norm: str) -> Optional[str]:
    """
    Enciclopedia histórica rigurosa de Malvinas 1982:
    Solo responde consultas objetivas (¿Qué ocurrió?, ¿Cuándo fue?, etc.)
    cuando el usuario NO está contando una vivencia personal propia.
    """
    # 1. Crucero ARA General Belgrano
    if any(k in msg_norm for k in ["belgrano", "conqueror"]) and any(k in msg_norm for k in ["hundimiento", "crucero", "torpedo", "muertos", "bajas", "cuando", "que paso"]):
        return (
            "El 2 de mayo de 1982 a las 16:02 hs, el Crucero ARA General Belgrano fue torpedeado fuera de la zona de exclusión militar "
            "declarada por Gran Bretaña por el submarino nuclear británico HMS Conqueror. En este ataque y el posterior naufragio "
            "entregaron su vida 323 tripulantes argentinos, la mayor pérdida humana del conflicto. Tras más de 40 horas bajo un fuerte "
            "temporal antártico con olas de hasta 8 metros y temperaturas bajo cero, 770 marinos fueron rescatados heroicamente "
            "de las balsas salvavidas por los buques ARA Bouchard, ARA Piedrabuena y el aviso ARA Gurruchaga."
        )

    # 2. Operación Rosario / 2 de Abril (solo consulta teórica)
    if "giachino" in msg_norm or "operacion rosario" in msg_norm or ("2 de abril" in msg_norm and (is_factual_question(msg_norm) or any(k in msg_norm for k in ["que paso", "como fue", "que ocurrio", "desembarco", "recuperacion"]))):
        return (
            "La Operación Rosario, ejecutada entre el 1 y 2 de abril de 1982, permitió la recuperación de la soberanía sobre las Islas Malvinas "
            "cumpliendo la estricta orden del mando de no causar ninguna baja a las fuerzas británicas ni a la población civil. "
            "Desembarcaron los Comandos Anfibios en Playa Caimán, los Buzos Tácticos en Punta Celebroña y los vehículos anfibios VAO "
            "del BIM 2 y el Regimiento de Infantería 25 en Playa Roja. Durante la toma de la Casa de Gobierno entregó su vida "
            "el Capitán de Corbeta Pedro Edgardo Giachino, primer héroe caído en el conflicto, protegiendo a sus hombres."
        )

    # 3. Georgias del Sur / Grytviken / Leith
    if any(k in msg_norm for k in ["georgia", "leith", "grytviken", "guerrico"]) and any(k in msg_norm for k in ["que paso", "cuando", "combate", "historia"]):
        return (
            "La gesta se inició el 19 de marzo de 1982 en Puerto Leith (Islas Georgias del Sur) cuando obreros civiles de Constantino Davidoff "
            "izaron la bandera argentina. El 3 de abril, la corbeta ARA Guerrico y una fracción de Infantería de Marina recuperaron Grytviken "
            "en un duro combate donde la corbeta repelió el fuego de lanzacohetes y armas automáticas enemigas. "
            "En esa acción ofrendaron su vida el Cabo Primero de Mar Patricio Guanca y los conscriptos Mario Almonacid y Jorge Águila."
        )

    # 4. Bautismo de Fuego de la Fuerza Aérea (1° de Mayo)
    if any(k in msg_norm for k in ["1 de mayo", "bautismo de fuego", "black buck"]):
        return (
            "El 1 de mayo de 1982 se conmemora el heroico Bautismo de Fuego de la Fuerza Aérea Argentina. La jornada inició de madrugada con "
            "el bombardeo de un avión británico Vulcan (Operación Black Buck) sobre la pista de Puerto Argentino, seguido de ataques de "
            "aviones Sea Harrier y bombardeo naval de destructores británicos. La FAA lanzó 56 salidas de combate con escuadrillas de Mirage, "
            "Dagger, Canberra y A-4 Skyhawk. Cayeron combatiendo con honor 14 miembros de la fuerza aérea, entre ellos el Capitán Gustavo García Cuerva, "
            "e infligieron severos daños a buques de la Royal Navy."
        )

    # 5. Ataque al HMS Sheffield
    if any(k in msg_norm for k in ["sheffield", "bedacarratz", "mayora"]) or (("super etendard" in msg_norm or "exocet" in msg_norm) and "4 de mayo" in msg_norm):
        return (
            "El 4 de mayo de 1982, dos cazas Super Étendard de la 2ª Escuadrilla Aeronaval de la Armada Argentina, piloteados por el "
            "Capitán de Corbeta Augusto Bedacarratz y el Teniente de Fragata Armando Mayora, guiados por un avión explorador SP-2H Neptune, "
            "volaron al ras del mar en riguroso silencio radar y lanzaron dos misiles AM-39 Exocet. Uno de los misiles impactó de lleno en "
            "el destructor lanzamisiles británico HMS Sheffield, provocando un incendio incontrolable que causó su posterior hundimiento."
        )

    # 6. San Carlos / Callejón de las Bombas
    if any(k in msg_norm for k in ["san carlos", "callejon de las bombas", "ardent", "antelope", "crippa"]) and any(k in msg_norm for k in ["que paso", "como fue", "batalla", "desembarco britanico"]):
        return (
            "El 21 de mayo de 1982 las fuerzas británicas iniciaron el desembarco en el Estrecho de San Carlos. El Teniente de Navío Owen Crippa, "
            "en un monoplaza Aermacchi MB-339, realizó un histórico ataque en solitario contra la fragata HMS Argonaut. Durante las jornadas siguientes, "
            "denominadas por los propios británicos como 'El Callejón de las Bombas', aviadores de la Fuerza Aérea y de la Armada atacaron "
            "a vuelo rasante bajo intenso fuego antiaéreo, hundiendo las fragatas HMS Ardent y HMS Antelope, y averiando gravemente a numerosos buques enemigos."
        )

    # 7. HMS Coventry y Atlantic Conveyor (25 de Mayo)
    if any(k in msg_norm for k in ["coventry", "atlantic conveyor", "25 de mayo"]) and any(k in msg_norm for k in ["que paso", "hundimiento", "como fue"]):
        return (
            "El 25 de mayo de 1982, en el Día de la Patria, la aviación militar argentina asestó dos golpes devastadores a la flota británica. "
            "Una escuadrilla de A-4B Skyhawk de la FAA (Capitán Carballo y Teniente Rinke) bombardeó y hundió en 20 minutos al moderno destructor "
            "Tipo 42 HMS Coventry. Simultáneamente, dos Super Étendard (Capitán Curilovic y Teniente Barraza) impactaron misiles Exocet en el buque "
            "logístico Atlantic Conveyor, hundiendo valiosos helicópteros Chinook y vitales pertrechos de la fuerza de desembarco enemiga."
        )

    # 8. Batalla de Pradera del Ganso / Darwin (Goose Green)
    if any(k in msg_norm for k in ["pradera del ganso", "goose green", "darwin"]) and any(k in msg_norm for k in ["que paso", "como fue", "batalla"]):
        return (
            "Entre el 28 y 29 de mayo de 1982 se libró la Batalla de Pradera del Ganso y Darwin. El Regimiento de Infantería 12, con fracciones "
            "del RI 25 y artillería del Grupo 3, resistió durante más de 36 horas el embate del 2° Batallón de Paracaidistas británico (2 Para). "
            "En las colinas de Darwin cayó al frente de sus hombres el Teniente Roberto Néstor Estévez, quien continuó reglando el fuego aun herido "
            "de muerte. En esta batalla cayó mortalmente herido el propio comandante británico del batallón, el Teniente Coronel Herbert 'H' Jones."
        )

    # 9. Bahía Agradable / Fitz Roy (8 de Junio)
    if any(k in msg_norm for k in ["bahia agradable", "fitz roy", "sir galahad", "sir tristram"]) and any(k in msg_norm for k in ["que paso", "como fue", "8 de junio"]):
        return (
            "El 8 de junio de 1982 es recordado en los anales militares británicos como 'El día más negro de la flota'. "
            "Aviones A-4B Skyhawk y Dagger de la V y VI Brigadas Aéreas de la FAA sorprendieron en Bahía Agradable (Fitz Roy) a los buques logísticos "
            "de desembarco RFA Sir Galahad y RFA Sir Tristram cargados de tropas de la Guardia Galesa. El bombardeo desató catastróficos incendios, "
            "causando más de 50 muertos británicos y destruyendo equipo pesado de asalto antes de que pudieran entrar en combate."
        )

    # 10. Monte Longdon (consulta teórica)
    if any(k in msg_norm for k in ["monte longdon", "longdon"]) and (is_factual_question(msg_norm) or any(k in msg_norm for k in ["que paso", "que ocurrio", "como fue", "cuando fue"])):
        return (
            "La Batalla de Monte Longdon (noche del 11 al 12 de junio de 1982) fue uno de los combates cuerpo a cuerpo más feroces de la guerra. "
            "La Compañía B del Regimiento de Infantería Mecanizado 7 (al mando del Subteniente Baldini), junto a la 1ª Sección de Ingenieros 10 "
            "y una sección de ametralladoras 12,7 mm del BIM 5, resistieron casi 10 horas el asalto frontal del 3° Batallón de Paracaidistas británico (3 Para). "
            "Bajo temperaturas polares, nieve y fuego masivo de artillería naval, los soldados argentinos defendieron cada cresta y peñasco con bravura."
        )

    # 11. Cese de Fuego / 14 de Junio
    if any(k in msg_norm for k in ["14 de junio", "cese del fuego", "rendicion", "fin de la guerra"]) and any(k in msg_norm for k in ["que paso", "como fue", "cuando"]):
        return (
            "El 14 de junio de 1982, tras agotarse las reservas de munición pesada y ante la inminencia de combates en el área urbana de Puerto Argentino "
            "que ponían en riesgo a la población civil, se concertó el cese de fuego entre el General Mario Benjamín Menéndez y el General Jeremy Moore. "
            "Los combatientes argentinos entregaron sus armas con la dignidad intacta y la frente en alto tras 74 días de resistencia heroica, "
            "siendo evacuados hacia el continente a bordo del buque hospital ARA Bahía Paraíso y el transatlántico Canberra."
        )

    # 12. Cantidad de Bajas / Caídos Generales (solo si no es consulta anafórica referida a un lugar o combate previo)
    if not any(k in msg_norm for k in ["alli", "ahi", "en ese", "en esa", "en este", "en esta"]) and (("cuantos" in msg_norm and any(k in msg_norm for k in ["murieron", "caidos", "bajas", "muertos", "fallecieron"])) or any(k in msg_norm for k in ["cantidad de bajas", "total de muertos", "heroes caidos", "649 caidos"])):
        return (
            "En la Guerra de Malvinas entregaron su vida 649 héroes argentinos: 323 de la Armada Argentina (la mayoría en el Crucero Belgrano), "
            "194 del Ejército Argentino, 55 de la Fuerza Aérea Argentina, 7 de la Gendarmería Nacional, 2 de la Prefectura Naval y 16 de la Marina Mercante "
            "y personal civil. Las fuerzas armadas británicas reconocieron 255 muertos oficiales y cientos de heridos. "
            "Cada uno de nuestros 649 caídos es un custodio eterno de nuestra soberanía."
        )

    # 13. Soberanía Argentina y Antecedentes
    if any(k in msg_norm for k in ["soberania", "por que son argentinas", "derechos", "1833", "antecedentes"]):
        return (
            "La soberanía argentina sobre las Islas Malvinas, Georgias del Sur y Sandwich del Sur es inalienable e imprescriptible. "
            "Se fundamenta en la sucesión territorial de la Corona Española (1810), la continuidad geográfica en la plataforma continental, "
            "y el ejercicio efectivo y pacífico de la soberanía civil y militar por parte de las Provincias Unidas del Río de la Plata hasta el "
            "3 de enero de 1833, fecha en que las islas fueron usurpadas por la fuerza de las armas por la corbeta británica HMS Clio, "
            "expulsando a las autoridades y población argentina."
        )

    # 14. Rol del Perú y Apoyo Latinoamericano
    if any(k in msg_norm for k in ["peru", "belaunde", "mirage 5", "apoyo de peru", "ayuda de peru", "peruanos"]):
        return (
            "El Perú protagonizó uno de los gestos de solidaridad y hermandad más nobles de la historia contemporánea. "
            "Bajo la presidencia de Fernando Belaúnde Terry, Perú brindó apoyo militar directo e incondicional a la Argentina: "
            "envió en vuelo secreto 10 aviones de combate Mirage 5P con pilotos peruanos que aterrizaron en Tandil, misiles Exocet, "
            "piezas de repuesto aeronáuticas, municiones pesadas y armamento. Asimismo, Perú encabezó activas gestiones de paz "
            "diplomáticas y puso sus representaciones en el mundo al servicio de Argentina. La gratitud del pueblo argentino hacia el Perú es eterna."
        )

    # 15. Rol de Chile y Radares
    if any(k in msg_norm for k in ["chile", "pinochet", "apoyo de chile", "papel de chile"]):
        return (
            "Durante el conflicto de 1982, el régimen de Augusto Pinochet en Chile prestó asistencia estratégica secreta a las fuerzas británicas. "
            "Desde la base de Punta Arenas, radares de largo alcance chilenos alertaban a la flota británica en tiempo real cada vez que despegaban "
            "escuadrillas de la Fuerza Aérea y la Aviación Naval argentina desde Río Grande, Río Gallegos y San Julián. Asimismo, se permitió el uso "
            "encubierto de territorio y pistas chilenas para helicópteros y comandos británicos del Special Air Service (SAS)."
        )

    # 16. Rol de Estados Unidos
    if any(k in msg_norm for k in ["estados unidos", "eeuu", "reagan", "caspar weinberger", "apoyo de estados unidos"]):
        return (
            "Pese a los compromisos del Tratado Interamericano de Asistencia Recíproca (TIAR), el gobierno de los Estados Unidos (presidido por Ronald Reagan) "
            "apoyó abiertamente al Reino Unido. Proveyó a la fuerza de tareas británica vital inteligencia satelital y de comunicaciones desde la base "
            "de Wideawake en la Isla Ascensión, suministró millones de galones de combustible de aviación y entregó los avanzados misiles aire-aire "
            "Sidewinder AIM-9L que otorgaron a los Sea Harrier británicos una ventaja tecnológica determinante en combate aire-aire."
        )

    # 17. Fuerza Aérea Argentina y Aviones del conflicto
    if any(k in msg_norm for k in ["aviones", "fuerza aerea", "skyhawk", "mirage", "dagger", "pucara", "hercules", "super etendard", "aviacion"]):
        return (
            "La aviación militar argentina (Fuerza Aérea y Aviación Naval) protagonizó una epopeya reconocida mundialmente por su destreza y arrojo supremo. "
            "Volando a ras de las olas a casi 1.000 km/h para evitar el radar británico, pilotos de Mirage III, IAI Dagger, Douglas A-4B y A-4C Skyhawk, "
            "Super Étendard y Pucará hundieron destructores, fragatas y buques logísticos británicos (Sheffield, Coventry, Ardent, Antelope, Sir Galahad, "
            "Atlantic Conveyor). 55 oficiales, suboficiales y conscriptos de la Fuerza Aérea entregaron su vida combatiendo con honor inmortal."
        )

    # 18. Armamento Terrestre y Artillería
    if any(k in msg_norm for k in ["fusil", "fusiles", "fal", "mag", "armas", "armamento", "citer", "artilleria", "canon", "canones"]):
        return (
            "Las fuerzas terrestres argentinas emplearon el fusil de asalto FAL (calibre 7,62 mm) fabricado en la Dirección General de Fabricaciones Militares, "
            "ametralladoras pesadas MAG, lanzacohetes y morteros pesados. Se destacó de forma sobresaliente el Grupo de Artillería 3 (GA 3) y la artillería "
            "del BIM 5 con cañones Oto Melara de 105 mm y los cañones pesados CITER de 155 mm transportados por aire, cuyo tiro de precisión mantuvo a raya "
            "el avance de las brigadas británicas hasta las últimas horas en Puerto Argentino."
        )

    # 19. Causas del conflicto y por qué se fue a la guerra
    if any(k in msg_norm for k in ["por que empezo", "causas de la guerra", "por que fue la guerra", "como se origino", "origen de la guerra"]):
        return (
            "La Guerra de Malvinas tuvo como causa profunda casi un siglo y medio de ocupación colonial ilegal británica tras la usurpación de 1833, "
            "y la negativa reiterada de Gran Bretaña a negociar la soberanía conforme a la Resolución 2065 de las Naciones Unidas. En abril de 1982, "
            "la recuperación militar argentina buscó forzar una salida diplomática internacional definitiva, pero el gobierno británico envió una fuerza "
            "de tareas para retomar las islas por la fuerza, desencadenando 74 días de guerra abierta en el Atlántico Sur."
        )

    # 20. Clima, frío, trincheras y vida cotidiana en las Islas
    if any(k in msg_norm for k in ["clima", "frio", "trincheras", "pozo de zorro", "comida", "cartas", "chocolate", "vida en malvinas", "como vivian"]):
        return (
            "Los combatientes argentinos soportaron condiciones geográficas y climáticas extremas en las islas: temperaturas de hasta 15 grados bajo cero, "
            "vientos polares constantes de más de 80 km/h, turba mojada y pozos de zorro anegados de agua helada. Pese a que el bloqueo naval enemigo dificultó "
            "el suministro regular de raciones calientes en las alturas, la hermandad de los soldados al compartir el rancho y el afecto de las cartas y encomiendas "
            "enviadas por el pueblo argentino desde el continente constituyeron el sostén moral más profundo de la gesta."
        )

    # 21. Prisioneros de guerra y regreso a Puerto Madryn
    if any(k in msg_norm for k in ["prisioneros", "puerto madryn", "madryn se quedo sin pan", "campo de mayo", "regreso al continente"]):
        return (
            "Tras el cese de fuego del 14 de junio, los soldados argentinos fueron concentrados en Puerto Argentino y repatriados en el buque Canberra, "
            "el Norland y el buque hospital Bahía Paraíso. El arribo a Puerto Madryn el 19 de junio quedó grabado para siempre como 'El día que Madryn se quedó sin pan', "
            "cuando la comunidad entera desobedeció los cordones militares para abrazar, alimentar con pan casero y agradecer con lágrimas y orgullo a nuestros combatientes."
        )

    # 22. Respondedor universal para cualquier otra consulta histórica sobre el conflicto
    if is_factual_question(msg_norm) or any(k in msg_norm for k in ["guerra", "malvinas", "islas", "1982", "conflicto", "heroes", "soldados", "combate", "ingleses", "britanicos", "thatcher", "galtieri", "marina", "ejercito"]):
        return (
            "Durante el conflicto de 1982 en las Islas Malvinas, Georgias y Sandwich del Sur, las fuerzas armadas y civiles argentinas "
            "protagonizaron 74 días de resistencia heroica frente a la fuerza de tareas británica bajo condiciones climáticas y geográficas extremas, "
            "demostrando profunda valentía, abnegación y patriotismo en defensa de nuestra soberanía nacional.\n\n"
            "Podés hacerme todas las preguntas históricas que desees sobre batallas específicas (Monte Longdon, Darwin, Bahía Agradable, San Carlos, Tumbledown, Harriet), "
            "unidades participantes, misiones aeronavales, el Crucero Belgrano, armamento o sobre la memoria eterna de nuestros 649 héroes."
        )

    return None




def is_anaphoric_reference(msg_norm: str) -> bool:
    """Detecta si la consulta contiene referencias anafóricas o pronombres relativos al contexto previo."""
    anaphoric_markers = [
        "alli", "ahi", "en ese lugar", "en ese sitio", "en ese sector",
        "ese buque", "ese crucero", "ese barco", "ese destructor", "ese submarino",
        "ese monte", "esa posicion", "esa colina", "esa batalla", "ese combate",
        "ese ataque", "esa accion", "el anterior", "la anterior", "de eso", "de esto",
        "en esa fecha", "ese dia", "ese momento", "quien comandaba", "quien era el comandante",
        "quien era el jefe", "quienes pelearon ahi", "quienes combatieron ahi",
        "cuantos murieron alli", "cuantos cayeron alli", "cuantas bajas hubo alli",
        "cuantos murieron ahi", "cuantos cayeron ahi", "cuantas bajas hubo ahi",
        "cuantos murieron en ese", "cuantos cayeron en ese", "cuantas bajas en ese",
        "cuantos murieron", "cuantas bajas", "cuantos cayeron", "donde cayo", "donde murio", "donde fue", "donde ocurrio"
    ]
    return any(marker in msg_norm for marker in anaphoric_markers)


def extract_topic_from_history(history_records: list) -> Optional[str]:
    """Identifica el tema histórico o lugar central discutido en los turnos más recientes del historial."""
    for record in reversed(history_records):
        if isinstance(record, dict):
            raw = record.get("content", "")
        else:
            raw = getattr(record, "content", "") or ""
        content = normalize(raw)
        if not content:
            continue
        if any(k in content for k in ["belgrano", "crucero general belgrano", "conqueror"]):
            return "belgrano"
        if any(k in content for k in ["monte longdon", "longdon", "baldini"]):
            return "longdon"
        if any(k in content for k in ["pradera del ganso", "darwin", "estevez", "piaggi"]):
            return "darwin"
        if any(k in content for k in ["operacion rosario", "2 de abril", "giachino", "desembarco"]):
            return "operacion_rosario"
        if any(k in content for k in ["sheffield", "bedacarratz", "mayora", "exocet"]):
            return "sheffield"
        if any(k in content for k in ["bahia agradable", "fitz roy", "sir galahad", "sir tristram"]):
            return "bahia_agradable"
        if any(k in content for k in ["san carlos", "callejon de las bombas", "crippa"]):
            return "san_carlos"
        if any(k in content for k in ["georgia", "grytviken", "leith", "guerrico"]):
            return "georgias"
        if any(k in content for k in ["1 de mayo", "bautismo de fuego"]):
            return "bautismo_fuego"
        if any(k in content for k in ["tumbledown", "bim 5", "vazquez"]):
            return "tumbledown"
    return None


def resolve_contextual_historical_query(msg_norm: str, history_records: list) -> Optional[str]:
    """
    Resuelve consultas breves o anafóricas (p.ej. '¿Y cuántos murieron allí?', '¿Quién era el comandante?')
    rastreando el tema histórico activo en los turnos anteriores del historial.
    """
    if not is_anaphoric_reference(msg_norm) and not is_factual_question(msg_norm):
        return None

    topic = extract_topic_from_history(history_records)
    if not topic:
        return None

    is_casualty_query = any(k in msg_norm for k in ["cuantos murieron", "cuantas bajas", "cuantos cayeron", "donde cayo", "donde murio", "donde fue", "donde ocurrio", "cuantos fallecieron", "bajas", "muertos"])
    is_commander_query = any(k in msg_norm for k in ["comandante", "quien comandaba", "quien mandaba", "quien dirigia", "jefe", "al mando", "quien fue el comandante"])
    is_date_query = any(k in msg_norm for k in ["cuando fue", "en que fecha", "que dia", "a que hora", "cuando ocurrio", "cuando se"])
    is_general_followup = any(k in msg_norm for k in ["que paso despues", "como termino", "como fue eso", "y que mas paso"])
    is_location_query = any(k in msg_norm for k in ["donde cayo", "donde murio", "donde fue", "donde ocurrio", "donde estaba", "en que lugar", "donde"])

    if topic == "belgrano":
        if is_casualty_query:
            return (
                "En el hundimiento del Crucero ARA General Belgrano entregaron su vida 323 tripulantes argentinos "
                "(más de la mitad del total de caídos en el conflicto). Lograron sobrevivir y ser rescatados 770 marinos "
                "tras soportar más de 40 horas en balsas salvavidas a la deriva bajo temperaturas antárticas extremas."
            )
        if is_commander_query:
            return (
                "El comandante del Crucero ARA General Belgrano era el Capitán de Navío Héctor Bonzo, "
                "quien supervisó la evacuación ordenada de su tripulación hasta el último instante y fue el último oficial "
                "en abandonar el navío antes de que se hundiera en las aguas australes."
            )
        if is_date_query:
            return (
                "El hundimiento se produjo el 2 de mayo de 1982 a las 16:02 hs, tras el impacto de dos torpedos lanzados "
                "por el submarino nuclear británico HMS Conqueror, encontrándose el buque fuera de la zona de exclusión militar."
            )
        if is_general_followup:
            return (
                "Tras el impacto de los torpedos, la tripulación se lanzó a las balsas de emergencia. Se desplegó una heroica misión "
                "de búsqueda y rescate liderada por los buques argentinos ARA Bouchard, ARA Piedrabuena y ARA Gurruchaga, "
                "que permitió salvar la vida de 770 tripulantes en medio de olas gigantescas."
            )

    elif topic == "longdon":
        if is_casualty_query:
            return (
                "En la encarnizada Batalla de Monte Longdon ofrendaron su vida 31 combatientes argentinos y se contaron más de 120 heridos. "
                "Las fuerzas británicas del 3 Para sufrieron 23 bajas mortales y cerca de 50 heridos en combate cuerpo a cuerpo."
            )
        if is_commander_query:
            return (
                "La defensa en Monte Longdon estuvo sostenida principalmente por la Compañía B del Regimiento de Infantería Mecanizado 7 (RI Mec 7), "
                "destacándose el heroísmo del Subteniente Juan Domingo Baldini al frente de la 1ª Sección, apoyados por la 1ª Sección de Ingenieros 10 "
                "y personal del BIM 5."
            )
        if is_date_query:
            return (
                "La Batalla de Monte Longdon se libró durante la noche del 11 al 12 de junio de 1982, prolongándose hasta la mañana."
            )

    elif topic == "darwin":
        if is_casualty_query:
            return (
                "En la Batalla de Pradera del Ganso y Darwin entregaron su vida 47 soldados y oficiales argentinos, destacándose la entrega del Teniente Roberto Estévez. "
                "Por el bando británico, el 2 Para reconoció 18 muertos, entre ellos su propio jefe de batallón, el Teniente Coronel 'H' Jones."
            )
        if is_commander_query:
            return (
                "La Fuerza de Tareas Mercedes del Ejército Argentino estaba al mando del Teniente Coronel Ítalo Ángel Piaggi. "
                "Por las fuerzas británicas, atacó el 2° Batallón de Paracaidistas liderado por el Teniente Coronel Herbert 'H' Jones hasta su caída en combate."
            )
        if is_date_query:
            return "La Batalla de Pradera del Ganso y Darwin se desarrolló entre el 28 y el 29 de mayo de 1982."

    elif topic == "operacion_rosario":
        if is_location_query:
            return (
                "El Capitán de Corbeta Pedro Edgardo Giachino cayó heroicamente en la Casa de Gobierno (residencia del gobernador Rex Hunt) "
                "en Puerto Argentino el 2 de abril de 1982, tras intimar la rendición protegiendo a sus hombres."
            )
        if is_casualty_query:
            return (
                "Durante la Operación Rosario el 2 de abril de 1982 no hubo bajas británicas ni civiles, conforme a las directivas estrictas del mando militar argentino. "
                "La única baja fatal argentina fue la del heroico Capitán de Corbeta Pedro Edgardo Giachino al intimar la rendición de la casa del gobernador."
            )
        if is_commander_query:
            return (
                "El comandante de la Fuerza de Desembarco fue el Contraalmirante Carlos Büsser. La fracción de comandos anfibios que tomó la residencia del gobernador británico estuvo a cargo del Capitán de Corbeta Pedro Edgardo Giachino."
            )
        if is_date_query:
            return "La recuperación de las islas mediante la Operación Rosario se concretó el 2 de abril de 1982."

    elif topic == "sheffield":
        if is_casualty_query:
            return (
                "En el destructor británico HMS Sheffield fallecieron 20 tripulantes y 26 resultaron heridos tras el impacto del misil Exocet AM-39 lanzado por la Aviación Naval Argentina."
            )
        if is_commander_query:
            return (
                "La misión fue ejecutada por la 2ª Escuadrilla Aeronaval de Caza y Ataque al mando del Capitán de Corbeta Augusto Bedacarratz, acompañado por el Teniente de Fragata Armando Mayora en aviones Super Étendard."
            )
        if is_date_query:
            return "El impacto del misil Exocet sobre el HMS Sheffield ocurrió el 4 de mayo de 1982."

    elif topic == "bahia_agradable":
        if is_casualty_query:
            return (
                "En el bombardeo de Bahía Agradable (Fitz Roy) murieron más de 50 soldados británicos, la mayoría de la Guardia Galesa a bordo del RFA Sir Galahad, "
                "y decenas sufrieron quemaduras gravísimas. La Fuerza Aérea Argentina perdió 3 pilotos en esa acción histórica."
            )
        if is_date_query:
            return "El ataque en Bahía Agradable tuvo lugar el 8 de junio de 1982 ('El día más negro de la flota británica')."

    elif topic == "san_carlos":
        if is_casualty_query:
            return (
                "En el Estrecho de San Carlos ('El Callejón de las Bombas') la aviación argentina logró el hundimiento de las fragatas HMS Ardent y HMS Antelope "
                "y averió seriamente a los buques HMS Argonaut, HMS Brilliant, HMS Broadsword y HMS Glasgow, sufriendo la pérdida de valerosos pilotos que volaban a escasos metros del agua."
            )
        if is_date_query:
            return "Las operaciones en el Estrecho de San Carlos se iniciaron el 21 de mayo de 1982 con el desembarco británico."

    elif topic == "georgias":
        if is_casualty_query:
            return (
                "En las acciones de recuperación de Grytviken (Islas Georgias del Sur) el 3 de abril de 1982 murieron en combate tres marinos argentinos a bordo de la corbeta ARA Guerrico: el Cabo Primero Patricio Guanca y los conscriptos Mario Almonacid y Jorge Águila."
            )
        if is_date_query:
            return "Los hechos en las Islas Georgias comenzaron con el desembarco de obreros civiles en Puerto Leith el 19 de marzo y continuaron con la acción militar del 3 de abril de 1982."

    return None


class AgentResponse(dict):
    """Respuesta enriquecida que funciona como string y diccionario de control."""
    def __init__(self, reply, save_now=False, state=None, event_data=None, reset_session=False):
        super().__init__(reply=reply, save_now=save_now, state=state or {}, event_data=event_data, reset_session=reset_session)
        self.reply = reply
        self.save_now = save_now
        self.state = state or {}
        self.event_data = event_data
        self.reset_session = reset_session

    def __str__(self):
        return self.reply


def parse_name(text: str):
    """Extrae el nombre de forma robusta deteniéndose en preposiciones y conectores."""
    if not text:
        return None
    clean = text.strip().rstrip('.!,;')
    stop_words = {
        'y', 'de', 'del', 'en', 'con', 'que', 'soy', 'un', 'una', 'mi', 'su',
        'era', 'estuve', 'estuvo', 'hija', 'hijo', 'veterano', 'veterana',
        'familiar', 'combatio', 'combatió', 'para', 'por'
    }

    m = re.search(r'(?:me llamo|mi nombre es)\s+([A-Za-zÀ-ſ]+(?:\s+[A-Za-zÀ-ſ]+){0,2})', clean, re.IGNORECASE)
    if m:
        words = m.group(1).split()
        res = []
        for w in words:
            w_c = re.sub(r'[^A-Za-zÀ-ſ]', '', w)
            if not w_c or w_c.lower() in stop_words:
                break
            res.append(w_c.capitalize())
        if res:
            return ' '.join(res)

    m2 = re.search(r'\b(?:soy|yo soy)\s+([A-Za-zÀ-ſ]+(?:\s+[A-Za-zÀ-ſ]+){0,2})', clean, re.IGNORECASE)
    if m2:
        words = m2.group(1).split()
        res = []
        for w in words:
            w_c = re.sub(r'[^A-Za-zÀ-ſ]', '', w)
            if not w_c or w_c.lower() in stop_words:
                break
            res.append(w_c.capitalize())
        if res:
            return ' '.join(res)

    words = clean.split()
    ignored = {
        'hola', 'buenas', 'buen', 'dia', 'tardes', 'noches', 'si', 'no',
        'veterano', 'veterana', 'hijo', 'hija', 'familiar', 'quiero', 'contar',
        'historia', 'relato', 'vivencia', 'mi', 'papa', 'padre', 'mama', 'tio'
    }
    filtered = []
    for w in words:
        w_c = re.sub(r'[^A-Za-zÀ-ſ]', '', w)
        if not w_c:
            continue
        if w_c.lower() in stop_words or w_c.lower() in ignored:
            break
        filtered.append(w_c.capitalize())
    if 1 <= len(filtered) <= 3:
        return ' '.join(filtered)

    return None


def detect_role(msg_norm: str):
    """Detecta el rol del interlocutor respecto a la gesta de Malvinas."""
    if any(k in msg_norm for k in ['hija de', 'hija del', 'soy hija', 'hija']):
        return "Hija de Veterano de Guerra"
    if any(k in msg_norm for k in ['hijo de', 'hijo del', 'soy hijo', 'hijo']):
        return "Hijo de Veterano de Guerra"
    if any(k in msg_norm for k in ['esposa de', 'esposa del', 'viuda de', 'viuda del', 'esposa', 'viuda']):
        return "Esposa / Viuda de Veterano"
    if any(k in msg_norm for k in ['hermano de', 'hermano del', 'hermana de', 'hermana del', 'hermano', 'hermana']):
        return "Hermano/a de Veterano"
    if any(k in msg_norm for k in ['nieto de', 'nieto del', 'nieta de', 'nieta del', 'nieto', 'nieta']):
        return "Nieto/a de Veterano"
    if any(k in msg_norm for k in ['familiar de', 'familiar del', 'sobrino', 'sobrina', 'mi papa', 'mi padre', 'mi abuelo', 'mi tio', 'familiar']):
        return "Familiar de Veterano de Guerra"
    if any(k in msg_norm for k in ['soy veterano', 'soy veterana', 'veterano de guerra', 'veterana de guerra', 'excombatiente', 'conscripto', 'yo estuve', 'yo combati', 'fui soldado', 'veterano', 'veterana']):
        return "Veterano de Guerra"
    return ""


def extract_veteran_name(user_msg: str):
    """Extrae el nombre del veterano si viene expresado en relaciones familiares o de homenaje."""
    patterns = [
        r'(?:hija|hijo|familiar|esposa|viuda|hermano|hermana|nieto|nieta|sobrino|sobrina)\s+(?:de(?:l)?(?:\s+veterano|\s+excombatiente)?)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)+)',
        r'(?:mi\s+(?:papá|papa|padre|abuelo|tío|tio|hermano))\s+(?:se llamaba|se llama|es|fue)?\s*([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)+)',
        r'(?:en memoria de|homenaje a|historia de|para don|para)\s+(?:don|el veterano)?\s*([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)+)'
    ]
    for pat in patterns:
        m = re.search(pat, user_msg, re.IGNORECASE)
        if m:
            cand = m.group(1).strip()
            norm_c = normalize(cand)
            if not any(bad in norm_c for bad in ['un veterano', 'la guerra', 'las islas', 'malvinas', 'puerto argentino']):
                cand = re.sub(r'^(?:veterano|excombatiente|don|se llamaba|se llama|era|fue)\s+', '', cand, flags=re.IGNORECASE).strip()
                return cand
    return None


ASSISTED_LOCATIONS_MAP = {
    1: 'puerto argentino',
    2: 'pradera del ganso',
    3: 'monte longdon',
    4: 'tumbledown',
    5: 'dos hermanas',
    6: 'monte harriet',
    7: 'bahia fox',
    8: 'puerto howard',
    9: 'colina zapador',
    10: 'san carlos'
}

WORD_NUMBER_MAP = {
    'uno': 1, 'primero': 1, 'primera': 1, '1': 1,
    'dos': 2, 'segundo': 2, 'segunda': 2, '2': 2,
    'tres': 3, 'tercero': 3, 'tercera': 3, '3': 3,
    'cuatro': 4, 'cuarto': 4, 'cuarta': 4, '4': 4,
    'cinco': 5, 'quinto': 5, 'quinta': 5, '5': 5,
    'seis': 6, 'sexto': 6, 'sexta': 6, '6': 6,
    'siete': 7, 'septimo': 7, 'septima': 7, '7': 7,
    'ocho': 8, 'octavo': 8, 'octava': 8, '8': 8,
    'nueve': 9, 'noveno': 9, 'novena': 9, '9': 9,
    'diez': 10, 'decimo': 10, 'decima': 10, '10': 10
}


def resolve_assisted_place(user_msg: str, toponymy_dict: dict):
    """Resuelve la selección del usuario a partir de número, ordinal o nombre de lugar asistido."""
    norm = normalize(user_msg)

    # 1. Chequear número dígito (1 a 10)
    m = re.search(r'\b(10|[1-9])\b', norm)
    if m:
        num = int(m.group(1))
        key = ASSISTED_LOCATIONS_MAP.get(num)
        if key and key in toponymy_dict:
            return toponymy_dict[key]

    # 2. Chequear palabra de número
    words = norm.split()
    for w in words:
        if w in WORD_NUMBER_MAP:
            num = WORD_NUMBER_MAP[w]
            key = ASSISTED_LOCATIONS_MAP.get(num)
            if key and key in toponymy_dict:
                return toponymy_dict[key]

    # 3. Chequear nombres directos de toponimias ordenados por longitud descendente
    for k in sorted(toponymy_dict.keys(), key=len, reverse=True):
        if k in norm:
            return toponymy_dict[k]

    return None


ASSISTANCE_LOCATIONS_TEXT = (
    "📍 **1. Puerto Argentino / Stanley:** Capital, aeropuerto, zona costera y logística.\n"
    "📍 **2. Pradera del Ganso (Goose Green) / Darwin:** Istmo de Darwin, combates del RI 12 y RI 25.\n"
    "📍 **3. Monte Longdon:** Posición del Regimiento de Infantería 7 (combate nocturno del 11 al 12 de junio).\n"
    "📍 **4. Monte Tumbledown:** Posición del Batallón de Infantería de Marina 5 (BIM 5).\n"
    "📍 **5. Monte Dos Hermanas (Two Sisters):** Posición del Regimiento de Infantería 4 y 6.\n"
    "📍 **6. Monte Harriet:** Posición defensiva del Regimiento de Infantería 4.\n"
    "📍 **7. Bahía Fox (Fox Bay):** Isla Gran Malvina, Regimiento 8 y Compañía de Ingenieros 9.\n"
    "📍 **8. Puerto Howard (Puerto Mitre):** Isla Gran Malvina, Regimiento de Infantería 5.\n"
    "📍 **9. Colina Zapador (Sapper Hill) / Monte Williams:** Posiciones del BIM 5 cercanas a la capital.\n"
    "📍 **10. Estrecho de San Carlos / Bahía San Carlos:** Cabecera del desembarco británico y combate aeronaval."
)


def extract_explicit_place(msg_norm: str, is_answering_place: bool = False):
    """
    Extrae el lugar SOLO si el usuario indica explícitamente haber estado allí
    o si la pregunta anterior le consultaba expresamente por el lugar.
    NUNCA toma lugares de consultas teóricas ni de mensajes del asistente.
    """
    if any(q in msg_norm for q in ["que paso", "como fue", "quien estuvo", "que ocurrio", "cuando fue", "por que"]):
        return None

    sorted_topos = sorted(MALVINAS_TOPONYMY.keys(), key=lambda k: len(k), reverse=True)
    presence_markers = [
        "estuve", "estuvimos", "combati", "combatio", "combatio en", "combatieron", "combatimos",
        "estuvo", "estuvo en", "desembarque", "desembarco", "desembarcaron", "desembarcamos",
        "me destinaron", "lo destinaron", "nos destinaron", "llegue", "llego", "llegaron", "llegamos",
        "posicion", "trinchera", "apostado", "apostados", "zona de",
        "operacion rosario", "desembarco"
    ]
    has_presence = any(m in msg_norm for m in presence_markers)
    if has_presence or is_answering_place:
        for key in sorted_topos:
            if key in msg_norm:
                return MALVINAS_TOPONYMY[key]
    return None

# Aliases para compatibilidad
extract_place_flexible = extract_explicit_place


def extract_explicit_unit(msg_norm: str):
    """Detecta unidades militares explícitas en el mensaje."""
    for u in MILITARY_UNITS:
        if normalize(u) in msg_norm:
            return u
    return ""

# Aliases para compatibilidad
extract_unit_flexible = extract_explicit_unit


def is_confirmation(msg_norm: str):
    """Valida si el mensaje es una confirmación afirmativa explícita."""
    words = msg_norm.split()
    confirms = ["si", "sí", "dale", "confirmar", "confirmo", "correcto", "guardalo", "guardar", "de acuerdo", "adelante", "ok", "perfecto", "exacto", "por favor"]
    return any(c in words for c in confirms) or msg_norm.strip() in confirms


def is_correction_intent(norm_msg: str):
    """Valida si el usuario manifiesta intención de corregir datos."""
    words = norm_msg.split()
    if "no" in words or "cambiar" in words or "corregir" in words or "error" in words or "en realidad" in norm_msg:
        return True
    return False


def is_dont_remember(msg_norm: str) -> bool:
    """Detecta si el usuario manifiesta no recordar o no saber una fecha o dato exacto."""
    patterns = [
        r'\bno\s+(?:lo\s+|me\s+)?(?:recuerdo|acuerdo|se|sabria|preciso)\b',
        r'\bno\s+tengo\s+(?:la\s+)?(?:fecha|idea|dato|certeza)\b',
        r'\bno\s+se\b',
        r'\bdesconozco\b',
        r'\bno\s+lo\s+se\b',
        r'\btampoco\s+(?:lo\s+|me\s+)?(?:recuerdo|acuerdo|se)\b',
        r'\bni\s+idea\b',
        r'\bno\s+esta\s+claro\b',
        r'\bse\s+me\s+borro\b',
        r'\bningun[oa]s?\b',
        r'\bno\s+me\s+suena\b',
        r'\bsin\s+especificar\b',
        r'\bdejar(?:lo)?\s+asi\b'
    ]
    return any(re.search(p, msg_norm) for p in patterns)


def is_approximate_date(text: str) -> bool:
    """
    Detecta si el usuario menciona un mes aproximado, época del año o período no exacto.
    Ejemplos: 'principios de abril', 'fue por mayo', 'a mediados de junio', 'en mayo', 'fines de abril', 'otoño del 82'.
    """
    norm = normalize(text)
    approx_terms = [
        "principios", "primeros dias", "primeros vuelos", "comienzos", "mediados", "fines", "finales",
        "por mayo", "por abril", "por junio", "por marzo", "en mayo", "en abril", "en junio", "en marzo",
        "durante mayo", "durante abril", "durante junio", "cerca de mayo", "cerca de abril",
        "hacia abril", "hacia mayo", "hacia junio", "otono", "desembarco", "cese de fuego", "rendicion",
        "semana santa"
    ]
    months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio"]

    if any(t in norm for t in approx_terms):
        return True

    words = norm.split()
    for m in months:
        if m in words:
            if not re.search(r'\b\d{1,2}\b', norm):
                number_words = ["dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez",
                                "once", "doce", "trece", "catorce", "quince", "veinte", "veintiuno"]
                if not any(nw in words for nw in number_words):
                    return True
    return False


def is_restart_intent(msg_norm: str) -> bool:
    """Detecta si el usuario solicita reiniciar o limpiar el chat o la conversación."""
    patterns = [
        r'\breiniciar(?:\s+el)?(?:\s+chat|\s+conversacion|\s+sesion|\s+entrevista)?\b',
        r'\bborrar(?:\s+el)?(?:\s+chat|\s+historial|\s+mensajes|\s+conversacion)?\b',
        r'\blimpiar(?:\s+el)?(?:\s+chat|\s+historial|\s+mensajes|\s+conversacion)?\b',
        r'\bnueva\s+entrevista\b',
        r'\bnuevo\s+chat\b',
        r'\bnueva\s+conversacion\b',
        r'\bcomenzar\s+(?:de\s+nuevo|otra\s+vez)\b',
        r'\bempezar\s+(?:de\s+nuevo|otra\s+vez)\b',
        r'\breset(?:\s+chat)?\b'
    ]
    return any(re.search(p, msg_norm) for p in patterns)


def is_finished_story_intent(msg_norm: str) -> bool:
    """Detecta si el usuario manifiesta haber terminado de contar su vivencia o relato."""
    patterns = [
        r'\beso\s+(?:es|fue)\s+todo\b',
        r'\bya\s+termine\b',
        r'\bya\s+conclui\b',
        r'\bno\s+tengo\s+mas\s+(?:para\s+agregar|nada|que\s+contar)\b',
        r'\bhasta\s+aca\s+llego\b',
        r'\bno\s+(?:me\s+acuerdo|recuerdo)\s+mas\b',
        r'\beso\s+(?:es|fue)\s+lo\s+que\s+vivi\b',
        r'\bya\s+(?:te\s+)?conte\s+todo\b',
        r'\bes\s+todo\b'
    ]
    return any(re.search(p, msg_norm) for p in patterns)


def build_structured_summary_card(s: dict, is_updated: bool = False, updated_field: str = "") -> str:
    """Construye el resumen estructurado de la entrevista con opciones explícitas de modificación."""
    name = s.get("full_name") or s.get("user_name", "Testimoniante")
    vet = s.get("veteran_name") or name
    role = s.get("role", "Veterano de Guerra")
    regiment = s.get("regiment") or "No lo recuerda / Sin especificar"
    place = s.get("combat_place") or "No lo recuerda / Sin especificar"
    arrival = s.get("arrival_date") or "No especificado"
    ret = s.get("return_date") or "No especificado"
    anecdote = s.get("anecdote") or s.get("summary_vivencia", "Sin relato registrado")

    if is_updated:
        header = f"¡Dato actualizado con éxito, {name}!"
        if updated_field:
            header += f" Se modificó el campo **{updated_field}**."
    else:
        header = f"Muchas gracias por abrir tu corazón y compartir esta vivencia tan sentida, {name}."

    nl = "\n"
    card = (
        f"{header}{nl}{nl}"
        f"📋 **RESUMEN ESTRUCTURADO DEL TESTIMONIO (PROYECTO MALVINIZACIÓN):**{nl}"
        f"• **1. Testimoniante (quien da y firma el testimonio):** {name} ({role}){nl}"
        f"• **2. Veterano de Guerra homenajeado:** Don {vet}{nl}"
        f"• **3. Regimiento / Unidad militar:** {regiment}{nl}"
        f"• **4. Lugar de combate en las Islas:** {place}{nl}"
        f"• **5. Fecha / Mes de llegada a Malvinas:** {arrival}{nl}"
        f"• **6. Fecha / Mes de regreso al continente:** {ret}{nl}"
        f"• **7. Relato o vivencia:** \"{anecdote}\"{nl}{nl}"
        f"--------------------------------------------------{nl}"
        f"✏️ **OPCIÓN DE MODIFICACIÓN O CORRECCIÓN:**{nl}"
        f"Antes de guardar de forma definitiva en la base de datos y en la hoja de cálculo, tenés la opción de revisar y modificar cualquier dato:{nl}"
        f"• Podés indicarme qué dato querés cambiar. Por ejemplo:{nl}"
        f"   - *\"Modificar lugar a Monte Harriet\"* (o *\"Modificar lugar\"*){nl}"
        f"   - *\"Modificar fecha de llegada a mediados de abril\"* (o *\"Modificar fecha\"*){nl}"
        f"   - *\"Modificar regimiento a RIMEC 7\"* (o *\"Modificar regimiento\"*){nl}"
        f"   - *\"Modificar veterano a Juan Carlos Pérez\"* (o *\"Modificar nombre\"*){nl}"
        f"   - *\"Modificar relato a ...\"* (o *\"Modificar vivencia\"*){nl}{nl}"
        f"• Si todos los datos están correctos, por favor escribí **\"Confirmar\"** o **\"Sí, guardar\"** para registrar la entrevista."
    )
    return card


def extract_inline_modification(user_msg: str, msg_norm: str) -> tuple:
    """Detecta si el usuario pide modificar un campo y suministra el nuevo valor en la misma frase."""
    patterns = [
        (r'(?:modificar|cambiar|corregir)\s+(?:el\s+)?lugar(?:es)?(?:\s+de\s+combate)?(?:\s+(?:a|por|en|:)\s+)(.+)', 'lugar'),
        (r'(?:modificar|cambiar|corregir)\s+(?:el\s+)?regimiento(?:\s+(?:a|por|en|:)\s+)(.+)', 'regimiento'),
        (r'(?:modificar|cambiar|corregir)\s+(?:la\s+)?unidad(?:\s+militar)?(?:\s+(?:a|por|en|:)\s+)(.+)', 'regimiento'),
        (r'(?:modificar|cambiar|corregir)\s+(?:la\s+)?(?:fecha\s+de\s+)?llegada(?:\s+(?:a|por|en|:)\s+)(.+)', 'llegada'),
        (r'(?:modificar|cambiar|corregir)\s+(?:la\s+)?(?:fecha\s+de\s+)?(?:vuelta|regreso|retorno)(?:\s+(?:a|por|en|:)\s+)(.+)', 'regreso'),
        (r'(?:modificar|cambiar|corregir)\s+(?:la\s+)?fecha(?:\s+(?:a|por|en|:)\s+)(.+)', 'fecha'),
        (r'(?:modificar|cambiar|corregir)\s+(?:el\s+)?(?:nombre\s+del\s+)?veterano(?:\s+(?:a|por|en|:)\s+)(.+)', 'veterano'),
        (r'(?:modificar|cambiar|corregir)\s+(?:mi\s+)?nombre(?:\s+(?:a|por|en|:)\s+)(.+)', 'nombre'),
        (r'(?:modificar|cambiar|corregir)\s+(?:el\s+)?(?:relato|vivencia|testimonio|anecdota)(?:\s+(?:a|por|en|:)\s+)(.+)', 'relato'),
    ]
    for pattern, field in patterns:
        m = re.search(pattern, user_msg, re.IGNORECASE)
        if m:
            val = m.group(1).strip().strip('"\'')
            if val:
                return field, val
    return None, None


def detect_target_modification_field(msg_norm: str) -> str:
    """Detecta qué campo desea modificar el usuario cuando no especificó el valor de inmediato."""
    if any(k in msg_norm for k in ["lugar", "monte", "posicion", "isla"]):
        return "lugar"
    if any(k in msg_norm for k in ["regimiento", "unidad", "batallon", "escuadrilla"]):
        return "regimiento"
    if any(k in msg_norm for k in ["llegada", "arribo"]):
        return "llegada"
    if any(k in msg_norm for k in ["vuelta", "regreso", "retorno", "partida"]):
        return "regreso"
    if "fecha" in msg_norm or "mes" in msg_norm:
        return "fecha"
    if any(k in msg_norm for k in ["veterano", "papa", "padre"]):
        return "veterano"
    if any(k in msg_norm for k in ["mi nombre", "testimoniante"]):
        return "nombre"
    if any(k in msg_norm for k in ["relato", "vivencia", "anecdota", "historia"]):
        return "relato"
    return "general"


def apply_field_modification(s: dict, field: str, val: str) -> str:
    """Aplica la modificación al estado según el campo y retorna la descripción del campo actualizado."""
    clean_val = val.strip().strip('"\'')
    norm_val = normalize(clean_val)

    if field == "lugar":
        s["combat_place"] = clean_val
        assisted_p = resolve_assisted_place(clean_val, MALVINAS_TOPONYMY)
        if assisted_p:
            s["combat_place"] = assisted_p["display"]
            s["place_data"] = assisted_p
        elif is_dont_remember(norm_val):
            s["combat_place"] = "No lo recuerda / Sin especificar"
            s["place_data"] = None
        else:
            s["place_data"] = None
        return "Lugar de combate"

    elif field == "regimiento":
        if is_dont_remember(norm_val):
            s["regiment"] = "No lo recuerda / Sin especificar"
        else:
            s["regiment"] = clean_val
        return "Regimiento / Unidad militar"

    elif field == "llegada":
        if is_dont_remember(norm_val):
            s["arrival_date"] = "No especificado"
        else:
            s["arrival_date"] = clean_val
        return "Fecha de llegada"

    elif field in ["regreso", "vuelta"]:
        if is_dont_remember(norm_val):
            s["return_date"] = "No especificado"
        else:
            s["return_date"] = clean_val
        return "Fecha de regreso"

    elif field == "fecha":
        if any(k in norm_val for k in ["vuelta", "regreso", "partida"]):
            s["return_date"] = clean_val
            return "Fecha de regreso"
        else:
            s["arrival_date"] = clean_val
            return "Fecha de llegada"

    elif field == "veterano":
        s["veteran_name"] = clean_val
        return "Veterano de Guerra"

    elif field == "nombre":
        s["full_name"] = clean_val
        s["user_name"] = clean_val
        return "Nombre del testimoniante"

    elif field in ["relato", "vivencia", "anecdota"]:
        s["anecdote"] = clean_val
        s["summary_vivencia"] = clean_val
        return "Relato o vivencia"

    else:
        # Inferir según contenido
        if any(k in norm_val for k in ["veterano", "papa", "padre"]):
            s["veteran_name"] = clean_val
            return "Veterano de Guerra"
        elif any(k in norm_val for k in ["regimiento", "unidad", "batallon"]):
            s["regiment"] = clean_val
            return "Regimiento / Unidad militar"
        elif any(k in norm_val for k in ["llegada", "abril"]):
            s["arrival_date"] = clean_val
            return "Fecha de llegada"
        elif any(k in norm_val for k in ["vuelta", "regreso", "junio"]):
            s["return_date"] = clean_val
            return "Fecha de regreso"
        elif any(k in norm_val for k in ["monte", "puerto", "isla", "bahia", "darwin"]):
            s["combat_place"] = clean_val
            assisted_p = resolve_assisted_place(clean_val, MALVINAS_TOPONYMY)
            if assisted_p:
                s["combat_place"] = assisted_p["display"]
                s["place_data"] = assisted_p
            return "Lugar de combate"
        else:
            s["anecdote"] = clean_val
            s["summary_vivencia"] = clean_val
            return "Relato o vivencia"


def process_conversational_turn(user_msg: str, state: dict) -> dict:
    """
    Motor de entrevista guiada paso a paso para el Proyecto Malvinización:
    1. CERO ALUCINACIONES: Jamás inventa relatos ni resúmenes que el usuario no contó.
    2. Entrevistador empático y paciente: preguntas estrictamente de a una por vez.
    3. Detección de temporalidad aproximada (no exige fecha exacta, valida con seguimiento).
    4. Flujo diferenciado para Familiares (pregunta nombre de veterano y no se bloquea ante olvido de regimiento).
    5. Asistencia geográfica interactiva (lista de 10 puntos clave de Malvinas si no recuerda el lugar).
    6. Persistencia estructurada de datos.
    """
    s = dict(state) if state else {}
    step = s.get("interview_step", "")
    stage = s.get("stage", "")

    msg_norm = normalize(user_msg).strip()

    if is_restart_intent(msg_norm):
        s.clear()
        return {
            "reply": (
                "He reiniciado la conversación y limpiado el historial por completo. Es un honor recibirte en este espacio de memoria de Malvinas.\n\n" +
                "Para comenzar una nueva entrevista o consulta histórica, ¿cómo te llamás?"
            ),
            "save_now": False,
            "reset_session": True,
            "state": {}
        }

    # Si ya se guardó y el usuario escribe de nuevo para iniciar otro testimonio
    if stage == "confirmed_saved":
        preserved_name = s.get("full_name") or s.get("user_name", "")
        s.clear()
        if preserved_name:
            s["full_name"] = preserved_name
            s["user_name"] = preserved_name
        step = ""
        stage = ""

    active_steps = [
        "ask_name",
        "ask_role",
        "ask_veteran_name",
        "ask_regiment",
        "ask_place",
        "assist_place",
        "ask_arrival_date",
        "ask_return_date",
        "ask_anecdote",
        "confirm",
        "correction",
    ]
    # PASO 0: Inicio de conversación, saludo o frase abierta (solo si aún no estamos en un paso activo de entrevista)
    if step not in active_steps:
        detected_name = parse_name(user_msg)
        has_intro = bool(re.search(r'\b(?:me llamo|mi nombre es|soy|yo soy)\s+([A-Za-zÀ-ſ]+)', user_msg, re.IGNORECASE))
        detected_role = detect_role(msg_norm)
        detected_vet = extract_veteran_name(user_msg)

        if detected_name and has_intro:
            s["full_name"] = detected_name
            s["user_name"] = detected_name
            s["stage"] = "interview"

            if detected_role and "veterano" not in detected_role.lower():
                s["role"] = detected_role
                if detected_vet:
                    s["veteran_name"] = detected_vet
                    s["interview_step"] = "ask_regiment"
                    return {
                        "reply": (
                            f"¡Muchas gracias y bienvenida/o, {detected_name}! Qué inmenso honor y deber de gratitud patriótica recibir a las familias de nuestros combatientes.\n\n"
                            f"Dejamos asentado con orgullo el homenaje a Don {detected_vet}.\n\n"
                            f"Para comenzar: ¿A qué regimiento, batallón, escuadrilla o unidad militar perteneció Don {detected_vet} en 1982 (por ejemplo, Regimiento 7, Regimiento 25, BIM 5, etc.)?\n"
                            f"(Si no recordás la unidad militar exacta, decímelo con total tranquilidad y continuamos)."
                        ),
                        "save_now": False,
                        "state": s
                    }
                else:
                    s["interview_step"] = "ask_veteran_name"
                    return {
                        "reply": (
                            f"¡Muchas gracias y bienvenida/o, {detected_name}! Qué inmenso honor y deber de gratitud patriótica recibir a los familiares de nuestros combatientes.\n\n"
                            f"Para dedicarle este merecido homenaje: ¿Cuál es el nombre y apellido completo de tu familiar veterano?"
                        ),
                        "save_now": False,
                        "state": s
                    }
            else:
                s["role"] = "Veterano de Guerra"
                s["veteran_name"] = detected_name
                s["interview_step"] = "ask_regiment"
                return {
                    "reply": (
                        f"¡Muchas gracias y bienvenido, {detected_name}! Es un honor y un deber de gratitud patriótica recibir tu testimonio de Malvinas.\n\n"
                        f"Vamos a realizar una entrevista guiada paso a paso para custodiar fielmente cada detalle de tu experiencia.\n\n"
                        f"Primera pregunta: ¿De qué regimiento, batallón, escuadrilla o unidad militar formaste parte en 1982 (por ejemplo, Regimiento 7, Regimiento 25, BIM 5, etc.)?\n"
                        f"(Si no recordás la unidad exacta, decímelo con total tranquilidad y continuamos)."
                    ),
                    "save_now": False,
                    "state": s
                }

        s["interview_step"] = "ask_name"
        s["stage"] = "interview"
        return {
            "reply": (
                "¡Es un absoluto honor y un deber de gratitud patriótica recibirte en este espacio de memoria de Malvinas!\n\n"
                "Para comenzar y registrar correctamente este testimonio: ¿Cuál es tu nombre y apellido completo (de la persona que está escribiendo hoy)? ¿Y sos veterano de guerra de Malvinas o familiar de un combatiente?"
            ),
            "save_now": False,
            "state": s
        }

    # PASO A: Nombre completo
    if step == "ask_name":
        cand_name = parse_name(user_msg)
        name = cand_name if cand_name else user_msg.strip()
        s["full_name"] = name
        s["user_name"] = name

        cand_role = detect_role(msg_norm)
        cand_vet = extract_veteran_name(user_msg)

        if cand_role:
            s["role"] = cand_role
            if "veterano" in cand_role.lower() and not any(f in cand_role.lower() for f in ["hijo", "hija", "esposa", "viuda", "hermano", "nieto", "familiar"]):
                s["veteran_name"] = name
                s["interview_step"] = "ask_regiment"
                return {
                    "reply": (
                        f"Mucho gusto, {name}. Gracias de corazón por tu servicio y valor por la Patria.\n\n"
                        f"¿De qué regimiento, batallón, escuadrilla o unidad militar formaste parte en 1982 (por ejemplo, Regimiento 7, Regimiento 25, BIM 5, etc.)?\n"
                        f"(Si no recordás la unidad militar exacta, decímelo con total tranquilidad y continuamos)."
                    ),
                    "save_now": False,
                    "state": s
                }
            else:
                if cand_vet:
                    s["veteran_name"] = cand_vet
                    s["interview_step"] = "ask_regiment"
                    return {
                        "reply": (
                            f"Mucho gusto, {name}. Es un honor inmenso recibir el testimonio de las familias de nuestros combatientes.\n\n"
                            f"Dejamos asentado con orgullo el homenaje a Don {cand_vet}.\n\n"
                            f"¿A qué regimiento, batallón, escuadrilla o unidad militar perteneció Don {cand_vet} en 1982?\n"
                            f"(Si no recordás la unidad militar exacta, decímelo con total tranquilidad y continuamos)."
                        ),
                        "save_now": False,
                        "state": s
                    }
                else:
                    s["interview_step"] = "ask_veteran_name"
                    return {
                        "reply": (
                            f"Mucho gusto, {name}. Es un honor inmenso recibir el testimonio de las familias de nuestros combatientes.\n\n"
                            f"Para dedicarle este merecido homenaje: ¿Cuál es el nombre y apellido completo de tu familiar veterano?"
                        ),
                        "save_now": False,
                        "state": s
                    }
        else:
            s["interview_step"] = "ask_role"
            return {
                "reply": (
                    f"Mucho gusto, {name}.\n\n"
                    f"Para registrarte con exactitud: ¿Sos veterano de guerra de Malvinas o familiar de un veterano?"
                ),
                "save_now": False,
                "state": s
            }

    # PASO A.2: Rol / Vínculo
    if step == "ask_role":
        cand_role = detect_role(msg_norm) or "Veterano de Guerra"
        s["role"] = cand_role
        name = s.get("full_name") or s.get("user_name", "")
        cand_vet = extract_veteran_name(user_msg)

        if "veterano" in cand_role.lower() and not any(f in cand_role.lower() for f in ["hijo", "hija", "esposa", "viuda", "hermano", "nieto", "familiar"]):
            s["veteran_name"] = name
            s["interview_step"] = "ask_regiment"
            return {
                "reply": (
                    f"Gracias por tu valor y entrega a la Patria, {name}.\n\n"
                    f"¿De qué regimiento, batallón, escuadrilla o unidad militar formaste parte en 1982 (por ejemplo, Regimiento 7, Regimiento 25, BIM 5, Fuerza Aérea, etc.)?\n"
                    f"(Si no recordás la unidad militar exacta, decímelo con total tranquilidad y continuamos)."
                ),
                "save_now": False,
                "state": s
            }
        else:
            if cand_vet:
                s["veteran_name"] = cand_vet
                s["interview_step"] = "ask_regiment"
                return {
                    "reply": (
                        f"Gracias, {name}. La voz y memoria de las familias son indispensables para la Causa Malvinas.\n\n"
                        f"Dejamos asentado con orgullo el homenaje a Don {cand_vet}.\n\n"
                        f"¿A qué regimiento, batallón, escuadrilla o unidad militar perteneció Don {cand_vet} en 1982?\n"
                        f"(Si no recordás la unidad militar exacta, decímelo con total tranquilidad y continuamos)."
                    ),
                    "save_now": False,
                    "state": s
                }
            s["interview_step"] = "ask_veteran_name"
            return {
                "reply": (
                    f"Gracias, {name}. La voz y memoria de las familias son indispensables para la Causa Malvinas.\n\n"
                    f"Para dedicarle este merecido homenaje: ¿Cuál es el nombre y apellido completo de tu familiar veterano?"
                ),
                "save_now": False,
                "state": s
            }

    # PASO A.3: Nombre del veterano homenajeado (si es familiar)
    if step == "ask_veteran_name":
        raw_v = user_msg.strip()
        cand = extract_veteran_name(raw_v) or parse_name(raw_v) or raw_v
        cand = re.sub(r'^(?:mi\s+(?:papá|papa|padre|abuelo|tío|tio|hermano)\s+)?(?:se\s+llamaba|se\s+llama|era|fue|es|don|el\s+veterano)\s+', '', cand, flags=re.IGNORECASE).strip()
        cand = re.sub(r'^(?:se\s+llamaba|se\s+llama|era|fue|es|don)\s+', '', cand, flags=re.IGNORECASE).strip()
        s["veteran_name"] = cand
        name = s.get("full_name") or s.get("user_name", "")
        s["interview_step"] = "ask_regiment"
        return {
            "reply": (
                f"Perfecto, {name}. Dejamos asentado el homenaje a Don {cand}.\n\n"
                f"¿A qué regimiento, batallón, escuadrilla o unidad militar perteneció Don {cand} en 1982 (por ejemplo, Regimiento 7, Regimiento 25, BIM 5, etc.)?\n"
                f"(Si no recordás la unidad militar exacta, decímelo con total tranquilidad y continuamos)."
            ),
            "save_now": False,
            "state": s
        }

    # PASO B: Regimiento del que formó parte (Regla 2: Si no lo recuerda, no bloquearse ni insistir)
    if step == "ask_regiment":
        name = s.get("full_name") or s.get("user_name", "")
        sujeto = s.get("veteran_name") or name

        if is_dont_remember(msg_norm):
            s["regiment"] = "No lo recuerda / Sin especificar"
            reassurance = f"No te preocupes en lo más mínimo, {name}. Es completamente comprensible no recordar la unidad militar exacta; lo verdaderamente trascendente es el nombre y la entrega de Don {sujeto}.\n\n"
        else:
            cand_unit = extract_explicit_unit(msg_norm)
            s["regiment"] = cand_unit if cand_unit else user_msg.strip()
            reassurance = f"Perfecto, queda registrado: **{s['regiment']}**.\n\n"

        s["interview_step"] = "ask_place"
        sujeto_desc = "te tocó combatir o estar apostado" if s.get("role") == "Veterano de Guerra" else f"combatió o estuvo apostado Don {sujeto}"
        return {
            "reply": (
                f"{reassurance}"
                f"Pasemos a la ubicación en las Islas:\n"
                f"¿En qué lugar de combate o posición en las Islas Malvinas {sujeto_desc} (por ejemplo, Monte Longdon, Darwin / Pradera del Ganso, Puerto Argentino, Dos Hermanas, Bahía Fox u otra ubicación)?"
            ),
            "save_now": False,
            "state": s
        }

    # PASO C: Lugar de combate (Regla 3: Si no lo recuerda, activar asistencia geográfica)
    if step == "ask_place":
        name = s.get("full_name") or s.get("user_name", "")
        sujeto = s.get("veteran_name") or name

        if is_dont_remember(msg_norm):
            s["interview_step"] = "assist_place"
            return {
                "reply": (
                    f"Es completamente comprensible, {name}. En Malvinas las posiciones fueron diversas y muy intensas.\n\n"
                    f"Para ayudarte a identificar o asociar el punto geográfico donde estuvo, te comparto las principales zonas y montes de combate:\n\n"
                    f"{ASSISTANCE_LOCATIONS_TEXT}\n\n"
                    f"¿Te suena o te mencionó alguna de estas posiciones (podés indicarme el nombre o el número), o preferís dejarlo como sin especificar?"
                ),
                "save_now": False,
                "state": s
            }
        else:
            cand_place = extract_explicit_place(msg_norm, is_answering_place=True)
            if cand_place:
                s["combat_place"] = cand_place["display"]
                s["place_data"] = cand_place
                reassurance = f"Anotado con precisión geográfica: **{s['combat_place']}**.\n\n"
            else:
                assisted_p = resolve_assisted_place(user_msg, MALVINAS_TOPONYMY)
                if assisted_p:
                    s["combat_place"] = assisted_p["display"]
                    s["place_data"] = assisted_p
                    reassurance = f"Anotado con precisión geográfica: **{s['combat_place']}**.\n\n"
                else:
                    s["combat_place"] = user_msg.strip()
                    reassurance = f"Anotado: **{s['combat_place']}**.\n\n"

        s["interview_step"] = "ask_arrival_date"
        sujeto_desc = "tu llegada" if s.get("role") == "Veterano de Guerra" else f"la llegada de Don {sujeto}"
        return {
            "reply": (
                f"{reassurance}"
                f"Ahora sobre las fechas en el conflicto:\n"
                f"¿Recordás qué día, mes o fecha aproximada fue {sujeto_desc} a las Islas Malvinas?"
            ),
            "save_now": False,
            "state": s
        }

    # PASO C.2: Asistencia geográfica interactiva (Regla 3)
    if step == "assist_place":
        name = s.get("full_name") or s.get("user_name", "")
        sujeto = s.get("veteran_name") or name

        if is_dont_remember(msg_norm) or any(k in msg_norm for k in ["ningun", "no me suena", "sin especificar", "dejar"]):
            s["combat_place"] = "No lo recuerda / Sin especificar"
            s["place_data"] = None
            reassurance = f"Comprendido perfectamente, {name}. Lo dejamos asentado como sin especificar y continuamos sin problema.\n\n"
        else:
            assisted_p = resolve_assisted_place(user_msg, MALVINAS_TOPONYMY)
            if assisted_p:
                s["combat_place"] = assisted_p["display"]
                s["place_data"] = assisted_p
                reassurance = f"¡Excelente! Vinculamos geográficamente la vivencia a **{s['combat_place']}**.\n\n"
            else:
                cand_place = extract_explicit_place(msg_norm, is_answering_place=True)
                if cand_place:
                    s["combat_place"] = cand_place["display"]
                    s["place_data"] = cand_place
                    reassurance = f"¡Excelente! Vinculamos geográficamente la vivencia a **{s['combat_place']}**.\n\n"
                else:
                    s["combat_place"] = user_msg.strip()
                    reassurance = f"Anotado: **{s['combat_place']}**.\n\n"

        s["interview_step"] = "ask_arrival_date"
        sujeto_desc = "tu llegada" if s.get("role") == "Veterano de Guerra" else f"la llegada de Don {sujeto}"
        return {
            "reply": (
                f"{reassurance}"
                f"Ahora sobre las fechas en el conflicto:\n"
                f"¿Recordás qué día, mes o fecha aproximada fue {sujeto_desc} a las Islas Malvinas?"
            ),
            "save_now": False,
            "state": s
        }

    # PASO D: Día/Fecha de llegada a las Islas (Regla 1: Detección de temporalidad aproximada)
    if step == "ask_arrival_date":
        name = s.get("full_name") or s.get("user_name", "")
        sujeto = s.get("veteran_name") or name

        # Si ya estábamos procesando el seguimiento de la aproximación temporal:
        if s.get("arrival_approx_validated"):
            det = user_msg.strip()
            # Si aporta detalle adicional
            if len(det) > 2 and not any(k in msg_norm for k in ["asi fue", "exacto", "correcto", "si", "tal cual"]):
                s["arrival_date"] = f"{s['arrival_date']} ({det})"
            s["interview_step"] = "ask_return_date"
            sujeto_desc = "tu vuelta" if s.get("role") == "Veterano de Guerra" else f"la vuelta de Don {sujeto}"
            return {
                "reply": (
                    f"Registrado con exactitud: **{s['arrival_date']}**.\n\n"
                    f"¿Y recordás qué día, mes o fecha aproximada fue {sujeto_desc} al continente?"
                ),
                "save_now": False,
                "state": s
            }

        # 1. No lo recuerda
        if is_dont_remember(msg_norm):
            if not s.get("arrival_memory_prompted"):
                s["arrival_memory_prompted"] = True
                s["arrival_date"] = "No lo recuerda"
                return {
                    "reply": (
                        f"Es completamente comprensible, {name}, pasaron muchos años y las condiciones fueron extremas.\n\n"
                        f"Para ayudarte a hacer memoria: ¿Te acordás si fue a principios de abril justo tras el desembarco del 2 de abril, o ya más avanzado abril cuando llegaron los contingentes de refuerzo por aire?\n"
                        f"(Si no recordás con exactitud, decímelo y continuamos sin problema)."
                    ),
                    "save_now": False,
                    "state": s
                }
            else:
                s["arrival_date"] = "No lo recuerda / Sin especificar"
                reassurance = "Entendido, lo dejamos registrado con honestidad como 'No lo recuerda / Sin especificar'.\n\n"
        # 2. Temporalidad aproximada (Regla 1)
        elif is_approximate_date(user_msg):
            s["arrival_approx_validated"] = True
            s["arrival_date"] = user_msg.strip()
            return {
                "reply": (
                    f"Comprendido, registramos esa llegada aproximada: **{s['arrival_date']}**.\n\n"
                    f"Para validar y acompañar ese marco temporal: ¿Recordás si la llegada fue en los primeros traslados de ese período o ya cuando las tropas tomaban sus posiciones asignadas?\n"
                    f"(Si no recordás el día exacto o más detalles, no te preocupes en absoluto: con este marco temporal es suficiente y avanzamos)."
                ),
                "save_now": False,
                "state": s
            }
        # 3. Fecha exacta directa
        else:
            s["arrival_date"] = user_msg.strip()
            reassurance = f"Registrado: fecha de llegada **{s['arrival_date']}**.\n\n"

        s["interview_step"] = "ask_return_date"
        sujeto_desc = "tu vuelta" if s.get("role") == "Veterano de Guerra" else f"la vuelta de Don {sujeto}"
        return {
            "reply": (
                f"{reassurance}"
                f"¿Y recordás qué día, mes o fecha aproximada fue {sujeto_desc} al continente?"
            ),
            "save_now": False,
            "state": s
        }

    # PASO E: Día/Fecha de vuelta al continente (Regla 1: Detección de temporalidad aproximada)
    if step == "ask_return_date":
        name = s.get("full_name") or s.get("user_name", "")
        sujeto = s.get("veteran_name") or name

        # Si ya estábamos procesando el seguimiento de la aproximación temporal:
        if s.get("return_approx_validated"):
            det = user_msg.strip()
            if len(det) > 2 and not any(k in msg_norm for k in ["asi fue", "exacto", "correcto", "si", "tal cual"]):
                s["return_date"] = f"{s['return_date']} ({det})"
            s["interview_step"] = "ask_anecdote"
            sujeto_desc = "te gustaría" if s.get("role") == "Veterano de Guerra" else f"le transmitió Don {sujeto} o te gustaría"
            return {
                "reply": (
                    f"Anotado con respeto: **{s['return_date']}**.\n\n"
                    f"Llegamos a la parte más valiosa y humana de esta recolección histórica:\n\n"
                    f"¿Qué recuerdo, anécdota o vivencia personal {sujeto_desc} compartir sobre lo que tocó vivir en las Islas (un momento con camaradas, una situación que haya marcado para siempre)?"
                ),
                "save_now": False,
                "state": s
            }

        # 1. No lo recuerda
        if is_dont_remember(msg_norm):
            if not s.get("return_memory_prompted"):
                s["return_memory_prompted"] = True
                s["return_date"] = "No lo recuerda"
                return {
                    "reply": (
                        f"Tranquilo, {name}, es totalmente natural que no se recuerde la fecha precisa.\n\n"
                        f"¿Te acordás si el regreso fue a mediados de junio tras el cese de fuego, por ejemplo a bordo del buque hospital Bahía Paraíso o del transatlántico Canberra?\n"
                        f"(Si no lo recordás, avanzamos sin problema)."
                    ),
                    "save_now": False,
                    "state": s
                }
            else:
                s["return_date"] = "No lo recuerda / Sin especificar"
                reassurance = "Perfecto, lo dejamos asentado como 'No lo recuerda / Sin especificar'.\n\n"
        # 2. Temporalidad aproximada (Regla 1)
        elif is_approximate_date(user_msg):
            s["return_approx_validated"] = True
            s["return_date"] = user_msg.strip()
            return {
                "reply": (
                    f"Dejamos registrada esa fecha aproximada de regreso: **{s['return_date']}**.\n\n"
                    f"Para acompañar ese momento: ¿Recordás si la vuelta al continente fue inmediatamente tras el cese de fuego a mediados de junio en buques como el Bahía Paraíso o el Canberra, o permanecieron unos días más antes de la repatriación?\n"
                    f"(Con este período aproximado es muy valioso; si no tenés el día justo, decímelo y pasamos al testimonio humano)."
                ),
                "save_now": False,
                "state": s
            }
        # 3. Fecha exacta directa
        else:
            s["return_date"] = user_msg.strip()
            reassurance = f"Registrado: fecha de vuelta **{s['return_date']}**.\n\n"

        s["interview_step"] = "ask_anecdote"
        sujeto_desc = "te gustaría" if s.get("role") == "Veterano de Guerra" else f"le transmitió Don {sujeto} o te gustaría"
        return {
            "reply": (
                f"{reassurance}"
                f"Llegamos a la parte más valiosa y humana de este registro testimonial:\n\n"
                f"¿Qué recuerdo, vivencia o anécdota personal {sujeto_desc} compartir sobre lo que tocó vivir en las Islas (un momento con camaradas, una situación que haya marcado para siempre)?"
            ),
            "save_now": False,
            "state": s
        }

    # PASO F: Algún recuerdo, anécdota o vivencia que quiera compartir
    if step == "ask_anecdote":
        name = s.get("full_name") or s.get("user_name", "")
        sujeto = s.get("veteran_name") or name

        # Detectar si el usuario indica que terminó de contar su relato
        if is_finished_story_intent(msg_norm):
            if not s.get("anecdote"):
                s["anecdote"] = user_msg.strip()
                s["summary_vivencia"] = user_msg.strip()
        else:
            s["anecdote"] = user_msg.strip()
            s["summary_vivencia"] = user_msg.strip()

        s["interview_step"] = "confirm"
        s["stage"] = "awaiting_confirmation"

        return {
            "reply": build_structured_summary_card(s),
            "save_now": False,
            "state": s
        }

    # PASO G: Confirmación de guardado y revisión / modificación
    if (step == "confirm" or stage == "awaiting_confirmation") and step != "correction":
        name = s.get("full_name") or s.get("user_name", "")
        sujeto = s.get("veteran_name") or name

        # 1. Reinicio si el usuario lo solicita
        if is_restart_intent(msg_norm):
            s.clear()
            return {
                "reply": (
                    "He reiniciado la conversación y limpiado el historial por completo. Es un honor recibirte en este espacio de memoria de Malvinas.\n\n"
                    "Para comenzar una nueva entrevista o consulta histórica, ¿cómo te llamás?"
                ),
                "save_now": False,
                "reset_session": True,
                "state": {}
            }

        # 2. Confirmación afirmativa para guardar
        if is_confirmation(msg_norm):
            s["stage"] = "confirmed_saved"
            s["interview_step"] = "finished"
            place_str = f" en {s.get('combat_place')}" if (s.get('combat_place') and s.get('combat_place') != "No lo recuerda / Sin especificar") else ""
            reply = (
                f"¡Muchísimas gracias, {name}! El testimonio en homenaje a Don {sujeto} y tu aporte como {s.get('role', 'testimoniante')} han sido guardados exitosamente en la base de datos histórica y en la hoja de cálculo oficial de vivencias.{place_str}\n\n"
                "Cada dato y cada palabra que nos compartiste queda custodiada con el más alto honor y gratitud para las futuras generaciones de nuestra Patria.\n\n"
                "¡Las Malvinas fueron, son y serán siempre argentinas!\n\n"
                "*(Podés reiniciar la conversación en cualquier momento haciendo clic en 'Reiniciar chat' o escribiendo 'Reiniciar chat')*"
            )
            return {
                "reply": reply,
                "save_now": True,
                "event_data": s.get("place_data"),
                "state": s
            }

        # 3. Modificación con valor suministrado en la misma frase (inline)
        field_inline, val_inline = extract_inline_modification(user_msg, msg_norm)
        if field_inline and val_inline:
            updated_desc = apply_field_modification(s, field_inline, val_inline)
            s["interview_step"] = "confirm"
            s["stage"] = "awaiting_confirmation"
            return {
                "reply": build_structured_summary_card(s, is_updated=True, updated_field=updated_desc),
                "save_now": False,
                "state": s
            }

        # 4. Intención de modificar o corregir datos (sin el nuevo valor aún)
        if is_correction_intent(msg_norm) or any(k in msg_norm for k in ["modificar", "cambiar", "corregir", "editar"]):
            target_f = detect_target_modification_field(msg_norm)
            s["interview_step"] = "correction"
            s["stage"] = "correction"
            s["field_to_modify"] = target_f

            if target_f == "lugar":
                rep = f"Con mucho gusto, {name}. Por favor indicame el nuevo lugar de combate en las Islas (o el monte o posición):"
            elif target_f == "regimiento":
                rep = f"Con mucho gusto, {name}. Por favor indicame el nuevo regimiento o unidad militar (o decime si preferís dejarlo como 'No lo recuerda / Sin especificar'):"
            elif target_f == "llegada":
                rep = f"Con mucho gusto, {name}. Por favor indicame la nueva fecha o mes aproximado de llegada a Malvinas:"
            elif target_f == "regreso":
                rep = f"Con mucho gusto, {name}. Por favor indicame la nueva fecha o mes aproximado de regreso al continente:"
            elif target_f == "fecha":
                rep = f"Con mucho gusto, {name}. ¿Qué fecha deseás modificar: la de llegada a Malvinas o la de regreso al continente?"
            elif target_f == "veterano":
                rep = f"Con mucho gusto, {name}. Por favor indicame el nombre completo del Veterano de Guerra homenajeado:"
            elif target_f == "nombre":
                rep = f"Con mucho gusto. Por favor indicame tu nombre completo:"
            elif target_f == "relato":
                rep = f"Con mucho gusto, {name}. Por favor escribí a continuación el relato o vivencia que deseás registrar:"
            else:
                rep = f"Entendido, {name}. ¿Qué dato te gustaría modificar (el nombre, el veterano, el regimiento, el lugar, las fechas o el relato)?"

            return {
                "reply": rep,
                "save_now": False,
                "state": s
            }

        # Respuesta si el mensaje no es confirmación ni modificación clara
        return {
            "reply": (
                f"Tenés el resumen estructurado de la entrevista listo para guardar, {name}.\n\n"
                f"¿Deseás **modificar** algún dato (como el lugar, la fecha, el regimiento o el relato) o confirmás con **\"Confirmar\"** para guardarla de forma definitiva?"
            ),
            "save_now": False,
            "state": s
        }

    # PASO DE CORRECCIÓN / MODIFICACIÓN
    if step == "correction":
        name = s.get("full_name") or s.get("user_name", "")
        field_target = s.get("field_to_modify", "")

        # Si el usuario indica un reinicio
        if is_restart_intent(msg_norm):
            s.clear()
            return {
                "reply": (
                    "He reiniciado la conversación y limpiado el historial por completo. Es un honor recibirte en este espacio de memoria de Malvinas.\n\n"
                    "Para comenzar una nueva entrevista o consulta histórica, ¿cómo te llamás?"
                ),
                "save_now": False,
                "reset_session": True,
                "state": {}
            }

        # Aplicar corrección
        if field_target and field_target != "general":
            updated_desc = apply_field_modification(s, field_target, user_msg.strip())
        else:
            inferred_f = detect_target_modification_field(msg_norm)
            updated_desc = apply_field_modification(s, inferred_f, user_msg.strip())

        s.pop("field_to_modify", None)
        s["interview_step"] = "confirm"
        s["stage"] = "awaiting_confirmation"

        return {
            "reply": build_structured_summary_card(s, is_updated=True, updated_field=updated_desc),
            "save_now": False,
            "state": s
        }

    return {
        "reply": "Para continuar con la entrevista con total exactitud, ¿podrías indicarme tu nombre completo?",
        "save_now": False,
        "state": s
    }


def process_agent_message(
    user_message: str,
    session,
    history_records: list,
    messages_payload: Optional[List[Dict[str, str]]] = None
):
    """
    Función principal de procesamiento conversacional del agente:
    1. Distingue entre consultas históricas objetivas y la entrevista guiada testimonial.
    2. En la entrevista guiada, garantiza CERO ALUCINACIONES y avance paso a paso (a, b, c, d, e, f).
    3. Permite invocar modelos LLM si están configurados y activos, o resuelve localmente con máxima fidelidad.
    """
    msg_clean = normalize(user_message).strip()
    system_prompt = get_system_prompt()

    state = {}
    if session and hasattr(session, "summary") and session.summary:
        try:
            state = json.loads(session.summary)
            if not isinstance(state, dict):
                state = {}
        except Exception:
            state = {}

    if session and hasattr(session, "witness") and session.witness:
        w_name = session.witness.name
        if w_name and w_name not in ["Veterano / Testimoniante", "Anónimo", "Por Identificar"]:
            if not state.get("full_name") and not state.get("user_name"):
                state["full_name"] = w_name
                state["user_name"] = w_name

    # Verificar si el usuario solicita reiniciar o limpiar la sesión
    if is_restart_intent(msg_clean):
        turn_res = process_conversational_turn(user_message, {})
        return AgentResponse(
            reply=turn_res["reply"],
            save_now=False,
            state={},
            event_data=None,
            reset_session=True
        )

    # Verificar si es reinicio limpio tras haber guardado
    is_fresh_greeting = msg_clean in ["hola", "buenas", "buen dia", "buenas tardes", "buenas noches"]
    if is_fresh_greeting and state.get("stage") == "confirmed_saved":
        preserved_name = state.get("full_name") or state.get("user_name")
        state.clear()
        if preserved_name:
            state["full_name"] = preserved_name
            state["user_name"] = preserved_name

    if messages_payload is None:
        messages_payload = build_conversation_payload(history_records, user_message)

    # Motor local de entrevista y memoria (CERO ALUCINACIONES GARANTIZADO):
    is_in_interview = bool(state.get("interview_step") and state.get("interview_step") != "finished")
    is_testimony_intent = is_relato_intent(msg_clean) or is_personal_testimony(msg_clean) or any(k in msg_clean for k in [
        "quiero contar mi historia", "vengo a contar", "quiero empezar", "dejar mi vivencia", "contar mi relato",
        "quiero contar", "quiero relatar", "dejar testimonio", "empezar a contar", "empezar mi relato",
        "quiero dejar mi relato", "te cuento mi relato", "dejo mi relato", "te paso mi relato", "relato de malvinas"
    ])

    # A. Consultas históricas objetivas (Permite hacer TODAS las consultas históricas que el usuario desee)
    if is_in_interview:
        # Durante la entrevista activa, solo consultar historia si formula una pregunta explícita con '?' o pregunta factual
        is_user_asking_question = ("?" in user_message or is_factual_question(msg_clean)) and not is_personal_testimony(msg_clean)
        should_check_history = is_user_asking_question and not is_testimony_intent
    else:
        is_user_asking_question = is_factual_question(msg_clean) or is_anaphoric_reference(msg_clean) or any(
            msg_clean.startswith(q) for q in ["¿", "que ", "quien ", "como ", "cuanto ", "cuanta ", "por que ", "donde ", "cuando ", "contame ", "explicame "]
        ) or "?" in user_message
        should_check_history = is_user_asking_question and not is_testimony_intent

    if should_check_history:
        if is_anaphoric_reference(msg_clean):
            contextual_hist = resolve_contextual_historical_query(msg_clean, history_records)
            if contextual_hist:
                hist_reply = contextual_hist + "\n\n*(Podés hacerme todas las preguntas históricas que desees sobre la gesta de 1982. Y cuando gustes continuar con tu testimonio o registrar uno nuevo, solo avisame)*"
                return AgentResponse(reply=hist_reply, state=state)

        direct_hist = answer_historical_query(msg_clean)
        if direct_hist:
            hist_reply = direct_hist + "\n\n*(Podés hacerme todas las consultas históricas que quieras sobre hechos, batallas y protagonistas de 1982. Y cuando desees registrar una vivencia o testimonio, decímelo y comenzamos)*"
            return AgentResponse(reply=hist_reply, state=state)

        # Invocación a LLM únicamente para consultas históricas abiertas teóricas (NUNCA para testimonios ni inventar relatos)
        if is_factual_question(msg_clean) or "malvinas" in msg_clean:
            anthropic_key = os.getenv("ANTHROPIC_API_KEY", "").strip()
            openrouter_key = os.getenv("OPENROUTER_API_KEY", "").strip()
            model_name = os.getenv("CLAUDE_MODEL", "").strip()

            llm_reply = None
            if anthropic_key:
                llm_reply = _call_anthropic_direct(messages_payload, system_prompt, anthropic_key, model_name)
            elif openrouter_key:
                llm_reply = _call_openrouter_claude(messages_payload, system_prompt, openrouter_key, model_name)

            if llm_reply and len(llm_reply.strip()) > 10:
                # Blindaje contra alucinaciones: si el LLM intenta inventar o resumir un relato que el usuario no contó, descartar
                norm_llm = normalize(llm_reply)
                if not any(bad in norm_llm for bad in ["aqui tienes el resumen", "resumen de tu historia", "tu relato en monte", "tu vivencia"]):
                    return AgentResponse(reply=llm_reply.strip(), state=state)

    # B. Flujo de entrevista guiada paso a paso (UNA SOLA PREGUNTA POR TURNO - NUNCA INVENTAR RESÚMENES)
    turn_res = process_conversational_turn(user_message, state)
    return AgentResponse(
        reply=turn_res["reply"],
        save_now=turn_res.get("save_now", False),
        state=turn_res.get("state", state),
        event_data=turn_res.get("event_data"),
        reset_session=turn_res.get("reset_session", False)
    )
