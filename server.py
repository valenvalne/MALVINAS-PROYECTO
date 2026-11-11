import http.server
import socketserver
import json
import urllib.request
import urllib.error
import os
import sys

PORT = 8000
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL = "gemini-2.5-flash"

SYSTEM_INSTRUCTION = """Eres un asistente virtual interactivo especializado en la Guerra de Malvinas (1982), historiográfico y con profunda empatía hacia los veteranos de guerra y sus familiares.
Tus directivas maestras son:
1. RIGOR HISTÓRICO Y TOPONIMIA: Conoces en profundidad todos los hechos del conflicto (19 de marzo al 15 de junio de 1982), fechas, montes (Longdon, Tumbledown, Harriet, Dos Hermanas), buques (Crucero General Belgrano, Sheffield, Coventry, etc.), aviación (A-4 Skyhawk, Super Étendard, Dagger, Mirage, Hércules C-130), y unidades militares reales de todo el país (por ejemplo, el Regimiento de Infantería 12 de Mercedes, Corrientes en Pradera del Ganso y Darwin, el BIM 5 de Río Grande en Tumbledown, el RI 7 de La Plata en Longdon, el RI 25 de Sarmiento en Darwin y San Carlos, etc.).
2. INTERACCIÓN NATURAL Y ESCUCHA ACTIVA: Eres una IA conversacional libre y dinámica. NUNCA respondas con plantillas fijas, cuestionarios repetitivos ni frases acartonadas. Responde directamente y con calidez a lo que el usuario te escribe.
3. EMPATÍA Y SOLEMNIDAD: Si un usuario te comparte el testimonio de su padre, familiar o su propia experiencia como veterano, acógelo con honor, respeto y gratitud por su servicio a la Patria, comentando con precisión y respeto la unidad o hecho al que se refiere.
4. FORMATO: Mantén un lenguaje formal, solemne, patriótico y fluido en español."""

class MalvinasServerHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-goog-api-key")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        if self.path.startswith("/api/chat"):
            content_length = int(self.headers.get("Content-Length", 0))
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode("utf-8"))
                user_message = data.get("message", "").strip()
                history = data.get("history", [])

                if not user_message:
                    self.send_response(400)
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Mensaje vacío"}).encode("utf-8"))
                    return

                # Estructurar historial de mensajes para Gemini
                contents = []
                for h in history:
                    if isinstance(h, dict) and "role" in h and "parts" in h:
                        contents.append(h)

                contents.append({
                    "role": "user",
                    "parts": [{"text": user_message}]
                })

                payload = {
                    "system_instruction": {
                        "parts": [{"text": SYSTEM_INSTRUCTION}]
                    },
                    "contents": contents,
                    "generationConfig": {
                        "temperature": 0.7,
                        "maxOutputTokens": 1000
                    }
                }

                endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
                req = urllib.request.Request(
                    endpoint,
                    data=json.dumps(payload).encode("utf-8"),
                    headers={
                        "Content-Type": "application/json",
                        "x-goog-api-key": GEMINI_API_KEY
                    },
                    method="POST"
                )

                with urllib.request.urlopen(req, timeout=30) as response:
                    res_body = response.read().decode("utf-8")
                    gemini_data = json.loads(res_body)

                reply_text = ""
                try:
                    parts = gemini_data["candidates"][0]["content"]["parts"]
                    text_parts = [p["text"] for p in parts if "text" in p and not p.get("thought", False)]
                    if not text_parts:
                        text_parts = [p["text"] for p in parts if "text" in p]
                    reply_text = "\n\n".join(text_parts)
                except (KeyError, IndexError):
                    reply_text = "Disculpa, no pude procesar la respuesta en este momento."

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "status": "success",
                    "respuesta": reply_text
                }).encode("utf-8"))

            except urllib.error.HTTPError as e:
                err_content = e.read().decode("utf-8", errors="ignore")
                print(f"Error HTTP de Google Gemini ({e.code}): {err_content}", file=sys.stderr)
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "status": "error",
                    "respuesta": f"Hubo un inconveniente momentáneo con la API de Gemini (Código {e.code}). Por favor intenta nuevamente."
                }).encode("utf-8"))
            except Exception as e:
                print(f"Error procesando petición: {e}", file=sys.stderr)
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "status": "error",
                    "respuesta": f"Error de servidor: {str(e)}"
                }).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(current_dir)
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), MalvinasServerHandler) as httpd:
        print("=" * 60)
        print("  SERVIDOR PUENTE MALVINAS 1982 CONECTADO CON GEMINI IA")
        print(f"  Frontend y API activos en: http://localhost:{PORT}")
        print(f"  Endpoint libre de CORS: http://localhost:{PORT}/api/chat")
        print("  Presiona Ctrl + C para detener el servidor")
        print("=" * 60)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor cerrado correctamente.")

