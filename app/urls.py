from django.urls import path
from . import views

urlpatterns = [
    path("", views.portal, name="portal"),
    path("agente/", views.index, name="index"),
    path("api/chat/", views.chat_api, name="chat_api"),
    path("api/session/", views.session_api, name="session_api"),
    path("api/profile/update/", views.update_profile_api, name="update_profile_api"),
    path("api/session/reset/", views.reset_session_api, name="reset_session_api"),
    path("api/events/", views.events_api, name="events_api"),
    path("api/sheets/status/", views.sheets_status_api, name="sheets_status_api"),
    path("api/sheets/sync-all/", views.sheets_sync_all_api, name="sheets_sync_all_api"),
]
