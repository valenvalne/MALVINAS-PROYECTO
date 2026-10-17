import csv
import json
import logging
import os
from datetime import datetime
from pathlib import Path
from django.conf import settings

logger = logging.getLogger(__name__)

STORAGE = Path(settings.MEDIA_ROOT)
STORAGE.mkdir(parents=True, exist_ok=True)

CSV_TESTIMONIOS = STORAGE / "testimonios_backup.csv"
CSV_EVENTOS = STORAGE / "eventos_backup.csv"

# Cabeceras exactas especificadas en PLAN DE TRABAJO.MD
HEADER_TESTIMONIOS = [
    "session_id", "timestamp_inicio", "timestamp_fin", "nombre_completo",
    "rol_participante", "fuerza_o_unidad", "consentimiento_web",
    "nivel_privacidad", "cantidad_mensajes", "resumen_relato",
    "estado_sesion", "transcripcion_completa"
]

HEADER_EVENTOS = [
    "event_id", "session_id", "fecha_registro", "titulo_suceso",
    "toponimia_malvinas", "latitud", "longitud", "fecha_acontecimiento",
    "unidades_involucradas", "descripcion_detalle", "cita_textual",
    "confianza_extraccion", "estado_validacion", "notas_curador"
]

def ensure_local_csv_headers():
    """Garantiza que existan los archivos CSV locales de respaldo con sus cabeceras."""
    if not CSV_TESTIMONIOS.exists():
        with open(CSV_TESTIMONIOS, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(HEADER_TESTIMONIOS)

    if not CSV_EVENTOS.exists():
        with open(CSV_EVENTOS, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(HEADER_EVENTOS)

def get_gspread_client():
    """Intenta inicializar el cliente gspread con la cuenta de servicio de Google."""
    cred_file = os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE", "credentials.json")
    cred_path = Path(settings.BASE_DIR) / cred_file

    if not cred_path.exists():
        return None, f"Archivo de credenciales no encontrado ({cred_file})"

    try:
        import gspread
        from google.oauth2.service_account import Credentials
        scopes = [
            "https://www.googleapis.com/auth/spreadsheets",
            "https://www.googleapis.com/auth/drive"
        ]
        credentials = Credentials.from_service_account_file(str(cred_path), scopes=scopes)
        client = gspread.authorize(credentials)
        return client, "OK"
    except ImportError:
        return None, "Librería gspread o google-auth no instalada"
    except Exception as e:
        return None, f"Error de autenticación Google: {str(e)}"

def get_sheets_connection_status():
    """Retorna el estado de conexión con Google Sheets y la hoja activa."""
    spreadsheet_id = os.getenv("GOOGLE_SHEETS_SPREADSHEET_ID", "").strip()
    client, message = get_gspread_client()

    status_data = {
        "spreadsheet_id": spreadsheet_id if spreadsheet_id else "No configurado en .env",
        "has_credentials_file": (Path(settings.BASE_DIR) / os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE", "credentials.json")).exists(),
        "is_connected": False,
        "mode": "Respaldo Local CSV Activo",
        "message": message,
        "tab_testimonios": os.getenv("SHEETS_TAB_TESTIMONIOS", "Testimonios_Generales"),
        "tab_eventos": os.getenv("SHEETS_TAB_EVENTOS", "Eventos_Georreferenciados"),
        "csv_backup_testimonios": str(CSV_TESTIMONIOS),
        "csv_backup_eventos": str(CSV_EVENTOS),
    }

    if client and spreadsheet_id:
        try:
            sh = client.open_by_key(spreadsheet_id)
            status_data["is_connected"] = True
            status_data["mode"] = "Conectado a Google Sheets en Vivo"
            status_data["sheet_title"] = sh.title
            status_data["message"] = f"Conexión exitosa con '{sh.title}'"
        except Exception as e:
            status_data["message"] = f"Error al abrir la hoja con ID {spreadsheet_id}: {str(e)}"

    return status_data

def sync_session_to_sheets(session):
    """
    Sincroniza una sesión testimonial en la pestaña Testimonios_Generales
    o en el respaldo CSV local.
    """
    ensure_local_csv_headers()
    witness = session.witness

    row_data = [
        str(session.session_id),
        session.started_at.strftime("%Y-%m-%d %H:%M:%S") if session.started_at else "",
        session.ended_at.strftime("%Y-%m-%d %H:%M:%S") if session.ended_at else "",
        witness.name,
        witness.role,
        witness.unit,
        "SI" if witness.consent_given else "NO",
        witness.privacy_level,
        session.message_count,
        session.summary,
        session.status,
        session.full_transcript[:1500]  # Resguardo de longitud en celda
    ]

    # 1. Respaldo local CSV
    try:
        with open(CSV_TESTIMONIOS, "a", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(row_data)
    except Exception as e:
        logger.error(f"Error escribiendo respaldo CSV de testimonios: {e}")

    # 2. Sincronización en vivo con Google Sheets
    spreadsheet_id = os.getenv("GOOGLE_SHEETS_SPREADSHEET_ID", "").strip()
    client, _ = get_gspread_client()

    if client and spreadsheet_id:
        try:
            sh = client.open_by_key(spreadsheet_id)
            tab_name = os.getenv("SHEETS_TAB_TESTIMONIOS", "Testimonios_Generales")
            try:
                worksheet = sh.worksheet(tab_name)
            except Exception:
                msg = f"La pestaña '{tab_name}' no existe en la hoja compartida. Debe ser creada por el compañero en su proyecto."
                logger.warning(msg)
                return False, msg
            worksheet.append_row(row_data)
            session.synced_to_sheets = True
            session.save(update_fields=["synced_to_sheets"])
            return True, "Sincronizado en Google Sheets"
        except Exception as e:
            logger.warning(f"Fallo sincronización Google Sheets (Testimonio): {e}")
            return False, f"Almacenado localmente. Error Sheets: {e}"

    return True, "Almacenado en respaldo local CSV"

def sync_event_to_sheets(event):
    """
    Sincroniza un evento georreferenciado en la pestaña Eventos_Georreferenciados
    o en el respaldo CSV local.
    """
    ensure_local_csv_headers()

    row_data = [
        str(event.event_id),
        str(event.session.session_id),
        event.registered_at.strftime("%Y-%m-%d %H:%M:%S") if event.registered_at else "",
        event.title,
        event.toponymy,
        event.latitude if event.latitude is not None else "",
        event.longitude if event.longitude is not None else "",
        event.event_date,
        event.units_involved,
        event.description,
        event.quote,
        event.confidence,
        event.validation_status,
        event.curator_notes
    ]

    # 1. Respaldo local CSV
    try:
        with open(CSV_EVENTOS, "a", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(row_data)
    except Exception as e:
        logger.error(f"Error escribiendo respaldo CSV de eventos: {e}")

    # 2. Sincronización en vivo con Google Sheets
    spreadsheet_id = os.getenv("GOOGLE_SHEETS_SPREADSHEET_ID", "").strip()
    client, _ = get_gspread_client()

    if client and spreadsheet_id:
        try:
            sh = client.open_by_key(spreadsheet_id)
            tab_name = os.getenv("SHEETS_TAB_EVENTOS", "Eventos_Georreferenciados")
            try:
                worksheet = sh.worksheet(tab_name)
            except Exception:
                msg = f"La pestaña '{tab_name}' no existe en la hoja compartida. Debe ser creada por el compañero en su proyecto."
                logger.warning(msg)
                return False, msg
            worksheet.append_row(row_data)
            event.synced_to_sheets = True
            event.save(update_fields=["synced_to_sheets"])
            return True, "Evento sincronizado en Google Sheets"
        except Exception as e:
            logger.warning(f"Fallo sincronización Google Sheets (Evento): {e}")
            return False, f"Evento guardado localmente. Error Sheets: {e}"

    return True, "Evento guardado en respaldo local CSV"
