"""
SeekhoWithRua — Notification Consumer
Handles real-time notifications via Django Channels WebSocket.

Connects at: ws://your-backend/ws/notifications/<user_id>/

Events handled:
- followed_host_live: someone you follow just went live
- new_follower: someone followed you
- panel_created: a host you follow created a new panel
"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User


class NotificationConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        """
        Called when frontend opens WebSocket connection.
        Adds this connection to user's personal notification group.
        """
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.group_name = f'notifications_{self.user_id}'

        # Verify user exists
        user_exists = await self.get_user(self.user_id)
        if not user_exists:
            await self.close()
            return

        # Join personal notification group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

        # Send connection confirmation
        await self.send(text_data=json.dumps({
            'type': 'connected',
            'message': 'Notification channel connected',
            'user_id': self.user_id,
        }))

    async def disconnect(self, close_code):
        """Leave notification group on disconnect."""
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        """
        Handle messages from frontend.
        Currently used for ping/keepalive only.
        """
        try:
            data = json.loads(text_data)
            if data.get('type') == 'ping':
                await self.send(text_data=json.dumps({'type': 'pong'}))
        except Exception:
            pass

    # ── Group message handlers ────────────────────────────────────────────────
    # These are called by Django views via channel_layer.group_send()

    async def send_notification(self, event):
        """
        Receives notification from Django view and forwards to frontend.
        Called when: follow_user view sends to notifications_<user_id> group.
        """
        await self.send(text_data=json.dumps({
            'type':  'notification',
            'data':  event['data'],
        }))

    async def panel_created(self, event):
        """
        Called when a followed host creates a new panel.
        Sent from livevc/views.py create_panel hook.
        """
        await self.send(text_data=json.dumps({
            'type': 'panel_created',
            'data': event['data'],
        }))

    async def new_follower(self, event):
        """
        Called when someone follows this user.
        Sent from voice_rooms/views.py follow_user.
        """
        await self.send(text_data=json.dumps({
            'type': 'new_follower',
            'data': event['data'],
        }))

    # ── Database helpers ──────────────────────────────────────────────────────

    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None