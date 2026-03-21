"""
ASGI config for backend project.
"""

import os
import sys

# MUST be first — before any Django imports
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import django
django.setup()

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.db import database_sync_to_async
import livevc.routing


@database_sync_to_async
def get_token_user(token_key):
    from rest_framework.authtoken.models import Token
    from django.contrib.auth.models import AnonymousUser
    try:
        token = Token.objects.select_related('user').get(key=token_key)
        return token.user
    except Token.DoesNotExist:
        return AnonymousUser()
    except Exception:
        return AnonymousUser()


class TokenAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        from urllib.parse import parse_qs
        from django.contrib.auth.models import AnonymousUser

        query_string = scope.get('query_string', b'').decode()
        query_params = parse_qs(query_string)
        token_key    = query_params.get('token', [None])[0]

        if token_key:
            try:
                scope['user'] = await get_token_user(token_key)
            except Exception as e:
                print(f"Token auth error: {e}")
                scope['user'] = AnonymousUser()
        else:
            scope['user'] = AnonymousUser()

        return await self.inner(scope, receive, send)


application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": TokenAuthMiddleware(
        URLRouter(livevc.routing.websocket_urlpatterns)
    ),
})