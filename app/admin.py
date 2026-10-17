from django.contrib import admin
from .models import WitnessProfile, ChatSession, ChatMessage, HistoricalEvent

@admin.register(WitnessProfile)
class WitnessProfileAdmin(admin.ModelAdmin):
    list_display = ("name", "role", "unit", "privacy_level", "consent_given", "created_at")
    list_filter = ("role", "privacy_level", "consent_given")
    search_fields = ("name", "unit")

@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ("session_id", "witness", "status", "started_at", "message_count", "synced_to_sheets")
    list_filter = ("status", "synced_to_sheets")
    search_fields = ("witness__name", "session_id")
    readonly_fields = ("session_id", "started_at", "full_transcript")

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ("session", "role", "timestamp", "short_content")
    list_filter = ("role", "timestamp")
    search_fields = ("content",)

    def short_content(self, obj):
        return obj.content[:60] + "..." if len(obj.content) > 60 else obj.content
    short_content.short_description = "Mensaje"

@admin.register(HistoricalEvent)
class HistoricalEventAdmin(admin.ModelAdmin):
    list_display = ("title", "toponymy", "event_date", "units_involved", "zoom_level", "location_source", "validation_status", "synced_to_sheets", "registered_at")
    list_filter = ("toponymy", "validation_status", "location_source", "synced_to_sheets")
    search_fields = ("title", "toponymy", "units_involved", "description", "quote")
    list_editable = ("validation_status",)
