import http.server
import socketserver
import json
import os
import sys
import re
from pathlib import Path
from dotenv import load_dotenv

# Cargar variables de entorno desde .env
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

PORT = int(os.environ.get("PORT", 8000))
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "").strip()
CLAUDE_MODEL = os.environ.get("CLAUDE_MODEL", "claude-3-5-sonnet-20241022").strip()

def load_system_prompt():
    """Carga las directivas maestras desde claude.md si existe, con directivas históricas y éticas completas."""
    claude_md_path = BASE_DIR / "claude.md"
    base_instructions = ""
    if claude_md_path.exists():
        try:
            base_instructions = claude_md_path.read_text(encoding="utf-8")
        except Exception as e:
            print(f"Aviso: No se pudo leer claude.md: {e}", file=sys.stderr)

    supplement = """
DIRECTIVAS OPERATIVAS Y DE RIGOR HISTÓRICO:
1. RIGOR Y PRECISIÓN HISTÓRICA:
   Conoces en profundidad los hechos del Conflicto del Atlántico Sur (19 de marzo al 15 de junio de 1982):
   - Fechas clave: 19 de marzo (Puerto Leith/Georgias), 2 de abril (Operación Rosario / desembarco / caída de Pedro Giachino), 1 de mayo (Bautismo de Fuego de la FAA / bombardeo Vulcan / ataques navales), 2 de mayo (Hundimiento del Crucero ARA General Belgrano con 323 héroes caídos), 4 de mayo (Ataque y destrucción del HMS Sheffield con misil Exocet por Super Étendard de Bedacarratz y Mayora), 21 al 25 de mayo (Desembarco en San Carlos / Callejón de las Bombas / ataques de Owen Crippa / hundimiento de HMS Ardent y HMS Antelope), 25 de mayo (Hundimiento del HMS Coventry y buque logístico Atlantic Conveyor), 28-29 de mayo (Batalla de Pradera del Ganso y Darwin / RI 12, RI 25 / caída del Teniente Roberto Estévez / muerte del Tcnel Herbert Jones), 8 de junio (Ataque aéreo en Bahía Agradable / Fitz Roy contra RFA Sir Galahad y Sir Tristram), 11-12 de junio (Combates nocturnos en Monte Longdon con RI 7 y Subteniente Baldini; Dos Hermanas con RI 4 y Llambías Pravaz; Monte Harriet con RI 4, Arroyo y Juárez), 13-14 de junio (Batalla de Monte Tumbledown con BIM 5, Capitán Robacio, Vázquez y Silva; Wireless Ridge con RI 7; Sapper Hill), 14 de junio (Cese del fuego entre General Mario Benjamín Menéndez y General Jeremy Moore).
   - Cifras exactas: 649 héroes argentinos caídos (323 Armada Argentina, 194 Ejército Argentino, 55 Fuerza Aérea Argentina, 7 Gendarmería Nacional, 2 Prefectura Naval, 16 Marina Mercante y civiles).
   - Fundamento jurídico y soberanía: Islas Malvinas, Georgias del Sur y Sandwich del Sur como parte inalienable de la República Argentina (usurpación británica de 1833 por HMS Clio, Resolución 2065 ONU).

2. ESCUCHA ACTIVA, EMPATÍA Y ADAPTACIÓN AL INTERLOCUTOR:
   - Si habla un veterano de guerra: Trato de "Usted", gratitud sincera y honor por su servicio a la Patria. Permitir su relato libre, no atosigar con preguntas.
   - Si habla un familiar de veterano o caído (hijo/a, padre, madre, nieto/a, hermano/a): Reconocer de inmediato con enorme afecto y honor el orgullo de la familia, invitándolo a contar sobre su familiar.
   - Si es un estudiante, investigador o ciudadano general: Explicar con claridad historiográfica fundamentada, entusiasmo pedagógico y vocación de divulgación.

3. REGLA FUNDAMENTAL DE NO ALUCINACIÓN:
   - NUNCA inventes testimonios personales, vivencias inventadas, nombres de compañeros o situaciones no ocurridas ni relatadas por el interlocutor.
   - Interpreta con atención las preguntas y responde de forma natural, precisa, directa y coherente, empleando únicamente la información histórica real disponible.
   - NUNCA utilices respuestas programadas, evasivas ni plantillas repetitivas.
"""
    if base_instructions:
        return f"{base_instructions}\n\n---\n\n{supplement}"
    return supplement

SYSTEM_PROMPT = load_system_prompt()

def format_messages_for_anthropic(history, current_message):
    """
    Formatea el historial y el mensaje actual para la API de Anthropic Messages:
    - Alternancia estricta user/assistant.
    - El primer mensaje debe ser 'user'.
    - El último mensaje debe ser 'user'.
    - Fusión de mensajes consecutivos con el mismo rol.
    """
    raw_list = []
    if history and isinstance(history, list):
        for h in history:
            if not isinstance(h, dict):
                continue
            role = h.get("role", "user")
            content = ""
            if "content" in h and h["content"]:
                content = str(h["content"])
            elif "parts" in h and isinstance(h["parts"], list):
                parts_text = [p.get("text", "") for p in h["parts"] if isinstance(p, dict)]
                content = "\n".join(parts_text).strip()

            if not content.strip():
                continue

            mapped_role = "assistant" if role in ["assistant", "model", "bot"] else "user"
            raw_list.append({"role": mapped_role, "content": content.strip()})

    if current_message and current_message.strip():
        raw_list.append({"role": "user", "content": current_message.strip()})

    while raw_list and raw_list[0]["role"] != "user":
        raw_list.pop(0)

    if not raw_list:
        raw_list = [{"role": "user", "content": current_message.strip() or "Hola"}]

    merged = []
    for item in raw_list:
        if merged and merged[-1]["role"] == item["role"]:
            merged[-1]["content"] += "\n\n" + item["content"]
        else:
            merged.append({"role": item["role"], "content": item["content"]})

    if merged and merged[-1]["role"] != "user":
        merged.append({"role": "user", "content": current_message.strip() or "Continúa"})

    return merged

def reason_and_generate_response(user_message, history=None):
    """
    Motor de razonamiento conversacional, contextual y empático:
    Interpreta el significado real, intenciones de familiares y veteranos,
    preguntas historiográficas y nombres, manteniendo coherencia absoluta sin plantillas frías.
    """
    msg_raw = user_message.strip()
    msg_lower = msg_raw.lower()

    # Analizar el historial acumulado para mantener el hilo contextual
    hist_text = ""
    if history and isinstance(history, list):
        for h in history:
            if isinstance(h, dict):
                c = h.get("content") or ""
                if not c and "parts" in h and isinstance(h["parts"], list):
                    c = " ".join([p.get("text", "") for p in h["parts"] if isinstance(p, dict)])
                hist_text += " " + str(c).lower()

    habla_de_padre = any(k in msg_lower for k in ["padre", "papá", "papa", "viejo"]) or any(k in hist_text for k in ["padre", "papá", "papa", "viejo"])
    habla_de_familiar = any(k in msg_lower for k in ["familiar", "abuelo", "tio", "tío", "hermano", "primo"]) or any(k in hist_text for k in ["familiar", "abuelo", "tio", "tío", "hermano"])
    habla_de_propio_veterano = any(k in msg_lower for k in ["yo estuve", "fui conscripto", "fui soldado", "yo combati", "yo combatí", "mi regimiento", "mi rol"])

    # 1. CASO: El usuario manifiesta que quiere hablar sobre su padre veterano
    if any(k in msg_lower for k in ["mi padre", "mi papá", "mi papa", "mi viejo"]):
        if any(k in msg_lower for k in ["hablar", "contar", "compartir", "veterano", "estuvo", "fue"]):
            return (
                "Es un inmenso honor poder conversar contigo sobre tu padre. Su entrega y valentía en las Islas Malvinas forman parte de lo más noble de nuestra historia, y para tu familia debe ser un motivo de profundo orgullo.\n\n"
                "Te escucho con total atención, respeto y sin ningún apuro: ¿cómo se llama tu papá? ¿Recuerdas en qué fuerza, regimiento o unidad militar sirvió (por ejemplo en el Ejército, la Armada, la Fuerza Aérea o la Infantería de Marina), o en qué zona de las islas estuvo destinado?"
            )

    # 2. CASO: El usuario manifiesta que quiere hablar de otro familiar (abuelo, tío, hermano)
    if any(k in msg_lower for k in ["mi abuelo", "mi tío", "mi tio", "mi hermano", "mi familiar"]):
        parentesco = "tu familiar"
        if "abuelo" in msg_lower: parentesco = "tu abuelo"
        elif "tío" in msg_lower or "tio" in msg_lower: parentesco = "tu tío"
        elif "hermano" in msg_lower: parentesco = "tu hermano"
        return (
            f"Es un gran honor y un verdadero privilegio poder escuchar la historia de {parentesco}. La entrega de quienes defendieron nuestra Patria en 1982 es un legado que merece ser recordado y preservado con el máximo respeto.\n\n"
            f"Te escucho con total atención: ¿cómo se llama y qué recuerdos o vivencias de aquellos días tienes sobre él? ¿Sabes en qué unidad o lugar de Malvinas estuvo?"
        )

    # 3. CASO: Duelo, dolor o secuelas emocionales
    if any(k in msg_lower for k in ["murio", "murió", "fallecio", "falleció", "cayo", "cayó", "dolor", "triste", "le costo", "le costó", "pesadilla", "suicid"]):
        return (
            "Comprendo y acompaño con profundo respeto y calidez ese sentir. Para los combatientes y sus seres queridos, la experiencia de la guerra y la posguerra ha sido una prueba inmensa. "
            "Que hoy decidas hablar de él y mantener vivo su recuerdo es un acto de amor supremo y de verdadero homenaje a su entrega.\n\n"
            "Tómate todo el tiempo que necesites; este espacio es tuyo para recordar lo que sientas propicio compartir."
        )

    # 4. CASO: Detección de Nombre Propio y Unidad combinados
    # Extraer nombre si dice "se llama X", "su nombre es X"
    nombre_detectado = None
    match_nombre = re.search(r"(?:se llama|nombre es|es)\s+([A-ZÁÉÍÓÚÑa-záéíóúñ]+)(?:\s+([A-ZÁÉÍÓÚÑa-záéíóúñ]+))?", msg_raw, re.IGNORECASE)
    if match_nombre:
        primero = match_nombre.group(1).strip()
        segundo = match_nombre.group(2).strip() if match_nombre.group(2) else ""
        if segundo.lower() in ["y", "de", "del", "en", "que", "estuvo", "sirvio", "sirvió", "fue", "un", "una", "veterano", "soldado"]:
            segundo = ""
        candidato = f"{primero} {segundo}".strip()
        if candidato.lower() not in ["veterano", "soldado", "familiar", "conscripto", "el", "la", "un", "una", "mi"]:
            nombre_detectado = candidato

    # Detección de unidad
    unidad_texto = ""
    if any(u in msg_lower for u in ["ri 7", "regimiento 7", "la plata"]):
        unidad_texto = "en el glorioso **Regimiento de Infantería Mecanizado 7 de La Plata**, que combatió heroicamente en Monte Longdon y Wireless Ridge bajo fuego abrumador de artillería."
    elif any(u in msg_lower for u in ["bim 5", "batallon 5", "batallón 5", "infanteria de marina", "infantería de marina", "rio grande", "río grande"]):
        unidad_texto = "en el legendario **Batallón de Infantería de Marina Nº 5 (BIM 5)** de Río Grande, bajo el comando de Carlos Robacio, defendiendo Monte Tumbledown y Sapper Hill hasta el final."
    elif any(u in msg_lower for u in ["ri 12", "regimiento 12", "mercedes"]):
        unidad_texto = "en el **Regimiento de Infantería 12 de Mercedes (Corrientes)**, protagonista de la feroz Batalla de Pradera del Ganso y Darwin."
    elif any(u in msg_lower for u in ["ri 25", "regimiento 25", "sarmiento"]):
        unidad_texto = "en el **Regimiento de Infantería 25 de Sarmiento (Chubut)**, destacándose el 2 de abril y con el Teniente Estévez en Darwin."
    elif any(u in msg_lower for u in ["ri 4", "regimiento 4", "monte caseros"]):
        unidad_texto = "en el **Regimiento de Infantería 4 de Monte Caseros**, defendiendo tenazmente las posiciones de Monte Harriet y Dos Hermanas."
    elif any(u in msg_lower for u in ["fuerza aerea", "fuerza aérea", "faa", "piloto", "skyhawk", "mirage", "dagger"]):
        unidad_texto = "en la **Fuerza Aérea Argentina**, cuyos pilotos y técnicos desafiaron a la flota británica con un coraje que asombró al mundo."
    elif any(u in msg_lower for u in ["armada", "marina", "ara ", "buque", "destructor"]):
        unidad_texto = "en la **Armada Argentina**, custodiando nuestras aguas australes y cumpliendo misiones navales de altísimo riesgo."

    # Si proporcionó nombre y/o unidad
    if nombre_detectado and unidad_texto:
        return (
            f"Un sincero y emocionado homenaje a **{nombre_detectado}**. Su servicio a la Patria {unidad_texto} es motivo de inmenso honor.\n\n"
            f"¿Recuerdas en qué compañía o sección estuvo, o alguna anécdota o recuerdo particular que te haya contado sobre sus vivencias allí?"
        )
    elif nombre_detectado and (habla_de_padre or habla_de_familiar):
        sujeto = "tu padre" if habla_de_padre else "tu familiar"
        return (
            f"Un sentido y respetuoso homenaje a **{nombre_detectado}**. Su nombre y su entrega quedan registrados aquí con el honor que merece un verdadero héroe.\n\n"
            f"¿Recuerdas en qué regimiento, buque o unidad militar sirvió {sujeto}, o en qué paraje o posición de las islas estuvo destinado?"
        )
    elif unidad_texto:
        return (
            f"Es un gran honor registrar su servicio {unidad_texto}\n\n"
            f"¿Recuerdas cómo se llama, en qué compañía estuvo o qué recuerdos te compartió sobre aquellos días de 1982?"
        )

    # 6. CASO: Preguntas Fácticas Históricas
    if any(k in msg_lower for k in ["belgrano", "conqueror", "2 de mayo", "crucero"]):
        return (
            "El 2 de mayo de 1982 a las 16:02 hs, el **Crucero ARA General Belgrano** fue atacado y hundido fuera del área de exclusión militar por el submarino nuclear británico HMS Conqueror.\n\n"
            "En esta trágica jornada ofrendaron su vida **323 tripulantes argentinos**, lo que representó casi la mitad de las bajas de la contienda. "
            "Pese al temporal antártico con olas de hasta 8 metros y temperaturas bajo cero, los buques ARA Bouchard, ARA Piedrabuena y el aviso Gurruchaga lograron rescatar heroicamente a 770 marinos en balsas salvavidas tras más de 40 horas en el mar."
        )

    if any(k in msg_lower for k in ["2 de abril", "rosario", "giachino", "desembarco", "recuperacion", "recuperación"]):
        return (
            "La **Operación Rosario**, ejecutada el 2 de abril de 1982, logró la recuperación pacífica de la soberanía sobre las Islas Malvinas bajo la orden taxativa de no provocar bajas en las fuerzas ni en la población británica.\n\n"
            "Participaron los Comandos Anfibios, los Buzos Tácticos y 20 vehículos anfibios del BIM 2 y el Regimiento de Infantería 25. "
            "Durante la recuperación de la Casa de Gobierno cayó heroicamente el **Capitán de Corbeta Pedro Edgardo Giachino**, primer mártir de la gesta."
        )

    if any(k in msg_lower for k in ["sheffield", "super etendard", "super étendard", "exocet", "bedacarratz", "mayora", "4 de mayo"]):
        return (
            "El 4 de mayo de 1982, dos aviones **Super Étendard** de la 2ª Escuadrilla Aeronaval de Caza y Ataque (Capitán Bedacarratz y Teniente Mayora), guiados por un explorador SP-2H Neptune, atacaron en vuelo rasante al destructor británico **HMS Sheffield** disparando dos misiles AM-39 Exocet.\n\n"
            "El impacto provocó incendios incontrolables que determinaron su hundimiento días después. Fue el primer buque de guerra de la Royal Navy hundido en combate desde 1945."
        )

    if any(k in msg_lower for k in ["1 de mayo", "bautismo", "vulcan", "black buck"]):
        return (
            "El **1 de mayo de 1982** se conmemora el Bautismo de Fuego de la Fuerza Aérea Argentina. La contienda inició en la madrugada con el bombardeo de un avión británico Vulcan (Operación Black Buck) sobre la pista de Puerto Argentino.\n\n"
            "La FAA lanzó 56 salidas de combate con aviones Mirage III, Dagger, Canberra y A-4 Skyhawk para repeler a la flota inglesa. En esa jornada cayeron 14 aviadores, entre ellos el Capitán Gustavo García Cuerva, inaugurando la heroica tradición de los 'Halcones' en el Atlántico Sur."
        )

    if any(k in msg_lower for k in ["san carlos", "callejon", "callejón", "ardent", "antelope", "crippa", "21 de mayo"]):
        return (
            "El 21 de mayo de 1982 comenzó el desembarco británico en el **Estrecho de San Carlos**. El Teniente de Navío Owen Crippa atacó en solitario con un avión monoplaza Aermacchi MB-339 a la flota enemiga en la bahía.\n\n"
            "En las jornadas posteriores, conocidas como 'El Callejón de las Bombas' (Bomb Alley), los pilotos argentinos volaron a escasos metros del mar bajo intenso fuego antiaéreo, logrando el hundimiento de las fragatas **HMS Ardent** y **HMS Antelope**, y averiando de gravedad a los buques Argonaut, Brilliant y Plymouth."
        )

    if any(k in msg_lower for k in ["coventry", "atlantic conveyor", "25 de mayo", "carballo", "rinke", "curilovic"]):
        return (
            "El 25 de mayo de 1982, en el Día de la Patria, la aviación argentina asestó dos golpes simultáneos a la Royal Navy:\n\n"
            "Una escuadrilla de A-4B Skyhawk (Capitán Pablo Carballo y Teniente Carlos Rinke) bombardeó al destructor **HMS Coventry**, hundiéndolo en 20 minutos; "
            "y dos Super Étendard (Capitán Roberto Curilovic y Teniente Julio Barraza) impactaron con dos misiles Exocet al mercante portacontenedores **Atlantic Conveyor**, destruyendo valiosos helicópteros Chinook y suministros vitales británicos."
        )

    if any(k in msg_lower for k in ["pradera del ganso", "goose green", "darwin", "estevez", "estévez"]):
        return (
            "La **Batalla de Pradera del Ganso y Darwin** (28 al 29 de mayo de 1982) fue el primer gran enfrentamiento terrestre.\n\n"
            "Efectivos del Regimiento de Infantería 12 y una sección del Regimiento de Infantería 25 resistieron heroicamente el asalto del 2° Batallón de Paracaidistas británico (2 Para). "
            "En la colina de Darwin combatió hasta el final el **Teniente Roberto Néstor Estévez**, quien herido continuó dirigiendo el tiro de artillería. En este combate cayó abatido el propio comandante británico, Teniente Coronel Herbert 'H' Jones."
        )

    if any(k in msg_lower for k in ["longdon", "baldini"]):
        return (
            "El **Combate de Monte Longdon** (noche del 11 al 12 de junio de 1982) fue el enfrentamiento de infantería más feroz del conflicto.\n\n"
            "La Compañía B del Regimiento de Infantería Mecanizado 7, la 1ª Sección de Ingenieros 10 y tiradores del BIM 5 resistieron durante casi 10 horas el asalto frontal con bayoneta del 3 Para británico bajo intenso frío y bombardeo masivo de artillería. Allí cayeron heroicamente el Subteniente Juan Domingo Baldini, el Sargento Presa y numerosos valientes conscriptos."
        )

    if any(k in msg_lower for k in ["tumbledown", "robacio", "vazquez", "vázquez"]):
        return (
            "En **Monte Tumbledown** (noche del 13 al 14 de junio de 1982), el Batallón de Infantería de Marina Nº 5 (BIM 5), comandado por el Capitán de Fragata Carlos Robacio, libró una defensa ejemplar.\n\n"
            "La 4ª Sección de la Compañía Nácar al mando del Teniente de Corbeta Carlos Vázquez y la sección del Subteniente Oscar Silva (RI 4) combatieron cuerpo a cuerpo contra la Guardia Escocesa británica (Scots Guards) hasta agotar municiones en un combate legendario."
        )

    if any(k in msg_lower for k in ["cuantos murieron", "cuántos murieron", "bajas", "muertos", "heroes", "héroes", "caidos", "caídos"]):
        return (
            "Durante la Guerra de Malvinas entregaron su vida **649 héroes argentinos**:\n\n"
            "• **323** de la Armada Argentina\n"
            "• **194** del Ejército Argentino\n"
            "• **55** de la Fuerza Aérea Argentina\n"
            "• **7** de la Gendarmería Nacional\n"
            "• **2** de la Prefectura Naval Argentina\n"
            "• **16** de la Marina Mercante y personal civil\n\n"
            "Las fuerzas armadas británicas registraron oficialmente 255 muertos y más de 700 heridos."
        )

    # 7. Saludos cordiales iniciales
    if any(w in msg_lower for w in ["hola", "buen dia", "buenas tardes", "buenas noches", "saludos"]):
        return (
            "Buenas tardes. Es un verdadero honor recibirte en este espacio de memoria y homenaje a nuestros héroes de Malvinas.\n\n"
            "Si eres veterano de guerra o familiar de uno de ellos, estamos para escucharte con total respeto y preservar su historia. "
            "Si vienes a conocer más sobre los combates, naves, fechas o unidades de 1982, puedes consultarme lo que desees."
        )

    # 8. Si es veterano de guerra que comparte su experiencia directa
    if habla_de_propio_veterano:
        return (
            "Mi más profundo respeto, agradecimiento y honor por su servicio a nuestra Patria en las Islas Malvinas.\n\n"
            "Le escuchamos con total atención y a su propio ritmo. ¿En qué unidad o regimiento prestó servicio y en qué sector de las islas estuvo desplegado? Si hay vivencias, recuerdos o nombres de camaradas que desee dejar documentados para la memoria viva, con honor los preservamos."
        )

    # 9. Respuesta de razonamiento adaptativo general
    if "?" in msg_raw or "¿" in msg_raw:
        return (
            f"Respecto a tu consulta sobre **'{msg_raw}'**:\n\n"
            "Durante el conflicto de 1982 se libraron operaciones en tierra, mar y aire en torno a las Islas Malvinas y Georgias del Sur. "
            "¿Deseas profundizar sobre un combate terrestre específico (como Longdon, Tumbledown, Harriet, Pradera del Ganso), una acción aeronaval (Crucero Belgrano, Sheffield, San Carlos), o sobre alguna unidad en particular?"
        )

    return (
        f"Te escucho con total atención y respeto sobre lo que comentas: *\"{msg_raw}\"*.\n\n"
        "Si estás compartiendo el testimonio de un veterano o de tu familia, por favor continúa explayándote a tu propio ritmo; cada recuerdo es una pieza invaluable de nuestra historia colectiva. "
        "¿Recuerdas en qué unidad o lugar de las islas ocurrió?"
    )

class MalvinasServerHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        path = self.path.split("?")[0].rstrip("/")

        if path in ["/api/chat", "/api/testimonios", "/api/profile/update"]:
            content_length = int(self.headers.get("Content-Length", 0))
            post_data = self.rfile.read(content_length) if content_length > 0 else b"{}"

            try:
                decoded_str = post_data.decode("utf-8", errors="replace")
                data = json.loads(decoded_str)
            except Exception as e:
                print(f"Error decodificando payload JSON: {e}", file=sys.stderr)
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "respuesta": f"Formato no reconocido: {str(e)}"}).encode("utf-8"))
                return

            if path == "/api/chat":
                self.handle_chat_request(data)
            elif path == "/api/testimonios":
                self.handle_save_testimonio(data)
            elif path == "/api/profile/update":
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"ok": True, "message": "Perfil registrado correctamente."}).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

    def handle_save_testimonio(self, data):
        """Persiste testimonios en el archivo JSON local de almacenamiento."""
        try:
            storage_dir = BASE_DIR / "files_storage"
            storage_dir.mkdir(parents=True, exist_ok=True)
            history_file = storage_dir / "CHAT_HISTORY.json"
            
            existing = []
            if history_file.exists():
                try:
                    existing = json.loads(history_file.read_text(encoding="utf-8"))
                except Exception:
                    existing = []

            existing.append(data)
            history_file.write_text(json.dumps(existing, indent=2, ensure_ascii=False), encoding="utf-8")

            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success", "message": "Testimonio resguardado correctamente."}).encode("utf-8"))
        except Exception as e:
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode("utf-8"))

    def handle_chat_request(self, data):
        user_message = (data.get("message") or data.get("mensaje") or "").strip()
        history = data.get("history") or []

        if not user_message:
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "empty", "respuesta": "Por favor escribe un mensaje o consulta."}).encode("utf-8"))
            return

        api_key = os.environ.get("ANTHROPIC_API_KEY", "").strip()
        model_name = os.environ.get("CLAUDE_MODEL", CLAUDE_MODEL).strip()

        # Si hay API Key de Anthropic Claude válida
        if api_key and api_key.startswith("sk-ant-"):
            try:
                import anthropic

                client = anthropic.Anthropic(api_key=api_key)
                formatted_messages = format_messages_for_anthropic(history, user_message)

                response = client.messages.create(
                    model=model_name,
                    max_tokens=1200,
                    temperature=0.3,
                    system=SYSTEM_PROMPT,
                    messages=formatted_messages
                )

                reply_text = response.content[0].text

                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "status": "success",
                    "respuesta": reply_text,
                    "model": model_name
                }, ensure_ascii=False).encode("utf-8"))
                return

            except anthropic.AuthenticationError as e:
                print(f"Error de autenticación Anthropic: {e}", file=sys.stderr)
                reply = reason_and_generate_response(user_message, history)
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"status": "success", "respuesta": reply}, ensure_ascii=False).encode("utf-8"))
                return

            except Exception as e:
                print(f"Error en llamada a Anthropic Claude: {e}", file=sys.stderr)
                reply = reason_and_generate_response(user_message, history)
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "status": "success",
                    "respuesta": reply
                }, ensure_ascii=False).encode("utf-8"))
                return

        # Motor de razonamiento empático y conversacional
        reply = reason_and_generate_response(user_message, history)
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()
        self.wfile.write(json.dumps({
            "status": "success",
            "respuesta": reply
        }, ensure_ascii=False).encode("utf-8"))

if __name__ == "__main__":
    os.chdir(BASE_DIR)
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), MalvinasServerHandler) as httpd:
        print("=" * 65)
        print("  🇦🇷 SERVIDOR PLATAFORMA HISTÓRICA MALVINAS 1982")
        print(f"  Servidor activo en: http://localhost:{PORT}")
        print(f"  Modelo IA configurado: {CLAUDE_MODEL}")
        print(f"  Estado API Claude: {'Conectado (sk-ant-...)' if ANTHROPIC_API_KEY.startswith('sk-ant-') else 'Motor de razonamiento empático e histórico activo'}")
        print("  Presiona Ctrl + C para detener el servidor")
        print("=" * 65)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor cerrado correctamente.")
