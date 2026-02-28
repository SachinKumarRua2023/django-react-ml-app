from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/voice/panel/(?P<panel_id>[^/]+)/?$', consumers.VoicePanelConsumer.as_asgi()),
]