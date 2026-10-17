# AGENTE VIRTUAL TESTIMONIAL - MALVINAS

Sistema de diálogo empático con Veteranos de la Guerra de Malvinas y sus familiares para la recolección, estructuración territorial y georreferenciación de acontecimientos históricos, desarrollado sobre **Django**, contenerizado con **Docker** y sincronizado en tiempo real con una **Hoja de Cálculo de Google (Google Sheets)**.

Inspirado en la arquitectura modular y desacoplada del proyecto **UMSA IA Turnos**.

---

## 🌟 CARACTERÍSTICAS PRINCIPALES

1. **Perfil Ético y Escucha Activa:**
   - Tono solemne, cálido y de respeto absoluto hacia el veterano y su familia.
   - Pacing paciente: no realiza cuestionarios agobiantes; permite el relato libre y solo formula preguntas puntuales cuando es oportuno.
   - Directivas y prompts desacoplados en `claude.md`.
2. **Motor Híbrido de Inteligencia Artificial:**
   - Conexión directa con **Anthropic Claude** (si se configura `ANTHROPIC_API_KEY`).
   - Asistente empático local determinístico integrado para pruebas inmediatas sin necesidad obligatoria de claves de API activas.
3. **Extracción Territorial Automática:**
   - Detección en tiempo real de lugares históricos de Malvinas (Monte Longdon, Two Sisters, Monte Harriet, Tumbledown, Pradera del Ganso, Bahía San Carlos, BAM Malvinas, etc.).
   - Asignación de coordenadas geográficas decimales oficiales (WGS84) para graficación directa en mapas web (Leaflet, Mapbox, Google Maps).
   - Identificación de fechas, unidades militares (RI 7, BIM 5, RI 4, etc.) y citas textuales representativas.
4. **Sincronización en Tiempo Real con Google Sheets:**
   - Se anexa cada acontecimiento y sesión a una **Única Hoja de Cálculo de Google** dividida en pestañas estandarizadas:
     - `Testimonios_Generales`
     - `Eventos_Georreferenciados`
   - Formato normalizado a prueba de futuro (ISO 8601, Float WGS84, UUID).
   - Respaldo dual automático en `files_storage/testimonios_backup.csv` y `files_storage/eventos_backup.csv` en caso de que falten credenciales o se interrumpa la conexión con Google.

---

## 🚀 PUESTA EN MARCHA RÁPIDA

### Opción A: Con Docker (Recomendado para el Equipo)
```bash
# 1. Clonar o ubicarse en la carpeta del proyecto
cd MALVINAS

# 2. Levantar el contenedor con Docker Compose
docker compose up --build
```
La aplicación quedará disponible de inmediato en `http://localhost:8000`.

---

### Opción B: Ejecución Local en Python
```bash
# 1. Instalar requerimientos
pip install -r requirements.txt

# 2. Aplicar migraciones
python manage.py migrate

# 3. Iniciar servidor de desarrollo
python manage.py runserver 0.0.0.0:8000
```

---

## 📋 CONFIGURACIÓN DE VARIABLES DE ENTORNO (`.env`)

Copia `.env.example` a `.env` y ajusta según las necesidades:

```ini
# Django
DJANGO_SECRET_KEY=tu-clave-secreta
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,web,0.0.0.0

# IA LLM Engine (Opcional - si no se coloca, opera el asistente empático local)
ANTHROPIC_API_KEY=sk-ant-api03-...
CLAUDE_MODEL=claude-3-5-sonnet-20241022

# Integración con Google Sheets
GOOGLE_SHEETS_SPREADSHEET_ID=1xYz...tu_spreadsheet_id_aqui
GOOGLE_SERVICE_ACCOUNT_FILE=credentials.json

SHEETS_TAB_TESTIMONIOS=Testimonios_Generales
SHEETS_TAB_EVENTOS=Eventos_Georreferenciados
```

---

## 📊 INTEGRACIÓN CON GOOGLE SHEETS

Para que el sistema sincronice en vivo con la hoja compartida creada por tu compañero:
1. Tu compañero debe crear la hoja de cálculo en su proyecto junto con las pestañas `Testimonios_Generales` y `Eventos_Georreferenciados` (con sus cabeceras en la Fila 1).
2. Compartir la hoja con el correo de la **Cuenta de Servicio** (indicado en el archivo `credentials.json`, ej: `agente-malvinas@...iam.gserviceaccount.com`) con permisos de **Editor**.
3. Colocar el archivo `credentials.json` en la raíz del proyecto (basado en `credentials.json.example`).
4. Pegar el ID de la hoja en `GOOGLE_SHEETS_SPREADSHEET_ID` en el archivo `.env`.

> **⚠️ Regla de Persistencia:** El agente virtual **NO crea automáticamente la hoja de cálculo ni sus pestañas**, respetando que han sido creadas previamente por el compañero. El agente se limita a anexar (`append_row`) las nuevas filas generadas en tiempo real.
> *Nota:* Mientras no se configure Google Sheets, el sistema resguarda automáticamente cada fila en formato idéntico dentro de `files_storage/`.

---

## 🔌 ENDPOINTS DE LA API (PARA LA WEB MATRIZ)

| Método | Endpoint | Descripción |
| :---: | :--- | :--- |
| `GET` | `/` | Interfaz web del chat testimonial y monitor de eventos en tiempo real. |
| `POST` | `/api/chat/` | Envía mensaje del veterano y devuelve la respuesta empática junto con los hitos territoriales extraídos. |
| `GET` | `/api/events/` | Devuelve el listado JSON de acontecimientos históricos y coordenadas para alimentar el mapa de la web. |
| `GET` | `/api/session/` | Información de la sesión y datos del testimoniante. |
| `POST` | `/api/profile/update/` | Actualiza nombre, rol, unidad y nivel de privacidad del entrevistado. |
| `POST` | `/api/session/reset/` | Inicializa una nueva entrevista testimonial limpia. |
| `GET` | `/api/sheets/status/` | Diagnóstico en tiempo real de la conexión con Google Sheets. |
| `POST` | `/api/sheets/sync-all/` | Fuerza la sincronización de todos los datos hacia Google Sheets. |

---

## 🏛️ PANEL DE CURADURÍA Y ADMINISTRACIÓN
Accede a `http://localhost:8000/admin/` para revisar, aprobar o moderar testimonios y acontecimientos territoriales antes de su exposición general.
