from pathlib import Path
import json
import os
import re
from datetime import datetime

BASE_DIR = Path(__file__).resolve().parent.parent
STORAGE = BASE_DIR / "files_storage"
CLAUDE_MD = BASE_DIR / "claude.md"

def ensure_storage():
    """Garantiza la existencia del directorio files_storage y archivos base."""
    STORAGE.mkdir(parents=True, exist_ok=True)
    index_file = STORAGE / "INDEX.md"
    memory_file = STORAGE / "MEMORY.md"
    history_file = STORAGE / "CHAT_HISTORY.json"

    if not index_file.exists():
        index_file.write_text(
            "# Archivo Maestro de Memoria Histórica de Malvinas\n\n"
            "| Archivo / Registro | Última Actualización | Propósito |\n"
            "|---|---|---|\n"
            "| `MEMORY.md` | " + datetime.now().strftime("%Y-%m-%d %H:%M") + " | Directivas éticas y memoria contextual de testimonios |\n"
            "| `CHAT_HISTORY.json` | " + datetime.now().strftime("%Y-%m-%d %H:%M") + " | Registro persistente de conversaciones |\n",
            encoding="utf-8"
        )

    if not memory_file.exists():
        memory_file.write_text(
            "# Memoria Persistente - Agente Testimonial Malvinas\n\n"
            "## Directivas Activas\n"
            "- Trato respetuoso y solemne con 'Usted'.\n"
            "- Pacing paciente: no apresurar al veterano ni hacer cuestionarios seguidos.\n"
            "- Extracción fiel de toponimia malvinense con coordenadas WGS84.\n"
            "- Registro y sincronización en tiempo real con Google Sheets.\n",
            encoding="utf-8"
        )

    if not history_file.exists():
        history_file.write_text("[]", encoding="utf-8")

    return STORAGE

def get_system_prompt():
    """Retorna las directivas maestras del agente desde claude.md o un fallback seguro."""
    if CLAUDE_MD.exists():
        return CLAUDE_MD.read_text(encoding="utf-8")
    return (
        "Eres el Agente Virtual Testimonial de la Plataforma de Memoria Histórica de Malvinas. "
        "Escucha con el más profundo respeto, empatía y solemnidad a los veteranos y familiares. "
        "Permite que relaten a su propio ritmo sin interrogar."
    )

def load_file_history():
    """Carga el historial global desde CHAT_HISTORY.json."""
    ensure_storage()
    path = STORAGE / "CHAT_HISTORY.json"
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return []

def append_file_history(role, content, meta=None):
    """Agrega un mensaje al historial en disco."""
    ensure_storage()
    history = load_file_history()
    entry = {
        "timestamp": datetime.now().isoformat(),
        "role": role,
        "content": content,
    }
    if meta:
        entry["meta"] = meta
    history.append(entry)
    (STORAGE / "CHAT_HISTORY.json").write_text(
        json.dumps(history, indent=2, ensure_ascii=False),
        encoding="utf-8"
    )
