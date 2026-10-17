import uuid
from django.db import models
from django.utils import timezone

class WitnessProfile(models.Model):
    """Perfil del testimoniante (Veterano, familiar o civil)"""
    ROLE_CHOICES = [
        ("Veterano de Guerra", "Veterano de Guerra de Malvinas"),
        ("Familiar Directo", "Familiar Directo"),
        ("Personal Sanitario", "Personal Sanitario / Cuadros de Apoyo"),
        ("Otro", "Otro Testimonio Histórico"),
    ]
    PRIVACY_CHOICES = [
        ("Nombre Público", "Nombre Público"),
        ("Solo Iniciales", "Solo Iniciales"),
        ("Anónimo", "Anónimo"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, default="Anónimo", verbose_name="Nombre Completo")
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default="Veterano de Guerra", verbose_name="Rol")
    unit = models.CharField(max_length=200, blank=True, default="", verbose_name="Fuerza o Unidad Militar")
    privacy_level = models.CharField(max_length=50, choices=PRIVACY_CHOICES, default="Nombre Público", verbose_name="Nivel de Privacidad")
    consent_given = models.BooleanField(default=True, verbose_name="Consentimiento Informado Otorgado")
    created_at = models.DateTimeField(default=timezone.now, verbose_name="Fecha de Registro")

    class Meta:
        verbose_name = "Perfil de Testimoniante"
        verbose_name_plural = "Perfiles de Testimoniantes"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.role})"


class ChatSession(models.Model):
    """Sesión de conversación mantenida con el Agente"""
    STATUS_CHOICES = [
        ("En Curso", "En Curso"),
        ("Pausada", "Pausada"),
        ("Completada", "Completada"),
        ("Abandonada", "Abandonada"),
    ]

    session_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    witness = models.ForeignKey(WitnessProfile, on_delete=models.CASCADE, related_name="sessions")
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default="En Curso", verbose_name="Estado de Sesión")
    started_at = models.DateTimeField(default=timezone.now, verbose_name="Inicio")
    ended_at = models.DateTimeField(null=True, blank=True, verbose_name="Finalización")
    message_count = models.IntegerField(default=0, verbose_name="Cantidad de Mensajes")
    summary = models.TextField(blank=True, default="", verbose_name="Resumen del Relato")
    full_transcript = models.TextField(blank=True, default="", verbose_name="Transcripción Completa")
    synced_to_sheets = models.BooleanField(default=False, verbose_name="Sincronizado en Google Sheets")
    sheets_row_index = models.IntegerField(null=True, blank=True, verbose_name="Fila en Google Sheets")

    class Meta:
        verbose_name = "Sesión de Conversación"
        verbose_name_plural = "Sesiones de Conversación"
        ordering = ["-started_at"]

    def __str__(self):
        return f"Sesión {str(self.session_id)[:8]} - {self.witness.name} ({self.status})"


class ChatMessage(models.Model):
    """Mensajes individuales intercambiados en la sesión"""
    ROLE_CHOICES = [
        ("user", "Usuario (Veterano / Familiar)"),
        ("assistant", "Agente Virtual Testimonial"),
        ("system", "Sistema"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name="messages")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    content = models.TextField()
    timestamp = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name = "Mensaje de Chat"
        verbose_name_plural = "Mensajes de Chat"
        ordering = ["timestamp"]

    def __str__(self):
        return f"[{self.role}] {self.content[:40]}..."


class HistoricalEvent(models.Model):
    """Hito o acontecimiento histórico georreferenciado extraído del testimonio"""
    LOCATION_SOURCE_CHOICES = [
        ("Toponimia", "Detectado en el diccionario toponímico"),
        ("Usuario", "Marcado por el testimoniante en el mapa"),
    ]
    VALIDATION_CHOICES = [
        ("Borrador IA", "Borrador Extraído por IA"),
        ("Pendiente de Revision", "Pendiente de Revisión por Curador"),
        ("Aprobado Web", "Aprobado para Web Matriz"),
        ("Descartado", "Descartado"),
    ]

    event_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name="events")
    registered_at = models.DateTimeField(default=timezone.now, verbose_name="Fecha de Registro")
    title = models.CharField(max_length=250, verbose_name="Título del Suceso")
    toponymy = models.CharField(max_length=150, verbose_name="Toponimia en Malvinas")
    latitude = models.FloatField(null=True, blank=True, verbose_name="Latitud (WGS84)")
    longitude = models.FloatField(null=True, blank=True, verbose_name="Longitud (WGS84)")
    zoom_level = models.IntegerField(default=11, verbose_name="Zoom de Visualización (Leaflet)")
    location_source = models.CharField(max_length=20, choices=LOCATION_SOURCE_CHOICES, default="Toponimia", verbose_name="Origen de la Ubicación")
    event_date = models.CharField(max_length=100, blank=True, default="", verbose_name="Fecha o Período del Hecho")
    units_involved = models.CharField(max_length=250, blank=True, default="", verbose_name="Unidades Involucradas")
    description = models.TextField(verbose_name="Descripción del Acontecimiento")
    quote = models.TextField(blank=True, default="", verbose_name="Cita Textual del Testimonio")
    confidence = models.FloatField(default=0.90, verbose_name="Nivel de Confianza (0 a 1)")
    validation_status = models.CharField(max_length=50, choices=VALIDATION_CHOICES, default="Pendiente de Revision", verbose_name="Estado de Validación")
    curator_notes = models.TextField(blank=True, default="", verbose_name="Notas del Curador")
    synced_to_sheets = models.BooleanField(default=False, verbose_name="Sincronizado en Google Sheets")
    sheets_row_index = models.IntegerField(null=True, blank=True, verbose_name="Fila en Google Sheets")

    class Meta:
        verbose_name = "Evento Histórico Georreferenciado"
        verbose_name_plural = "Eventos Históricos Georreferenciados"
        ordering = ["-registered_at"]

    def __str__(self):
        return f"{self.title} - {self.toponymy} ({self.event_date})"
