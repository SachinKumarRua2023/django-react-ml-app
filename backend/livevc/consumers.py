import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

class VoicePanelConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.panel_id = self.scope['url_route']['kwargs']['panel_id']
        self.room_group_name = f'panel_{self.panel_id}'
        self.user = self.scope.get("user")
        
        print(f"WebSocket connect attempt - User: {getattr(self.user, 'id', 'None')}, Auth: {getattr(self.user, 'is_authenticated', False)}")
        
        # Check authentication
        if not self.user or not getattr(self.user, 'is_authenticated', False):
            print("Authentication failed - closing connection")
            await self.close(code=4001)
            return
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        print(f"WebSocket accepted for user {self.user.id} in panel {self.panel_id}")
        
        # Notify others (excluding self)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_joined',
                'user_id': self.user.id,
                'username': self.user.username,
                'exclude_channel': self.channel_name,  # Don't send back to sender
            }
        )

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        
        if hasattr(self, 'user') and self.user and getattr(self.user, 'is_authenticated', False):
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_left',
                    'user_id': self.user.id,
                    'username': self.user.username,
                }
            )
            print(f"User {self.user.id} disconnected from panel {self.panel_id}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            print("Invalid JSON received")
            return
            
        msg_type = data.get('type')
        print(f"Received {msg_type} from user {self.user.id}")
        
        if msg_type == 'offer':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'webrtc_offer',
                    'offer': data['offer'],
                    'from_user': self.user.id,
                    'to_user': data['to_user'],
                    'from_username': self.user.username,
                }
            )
        elif msg_type == 'answer':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'webrtc_answer',
                    'answer': data['answer'],
                    'from_user': self.user.id,
                    'to_user': data['to_user'],
                }
            )
        elif msg_type == 'ice_candidate':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'webrtc_ice',
                    'candidate': data['candidate'],
                    'from_user': self.user.id,
                    'to_user': data['to_user'],
                }
            )

    async def user_joined(self, event):
        # Don't send if this is the excluded channel (the joiner themselves)
        if event.get('exclude_channel') == self.channel_name:
            return
            
        await self.send(text_data=json.dumps({
            'type': 'user_joined',
            'user_id': event['user_id'],
            'username': event['username'],
        }))

    async def user_left(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_left',
            'user_id': event['user_id'],
            'username': event['username'],
        }))

    async def webrtc_offer(self, event):
        if str(self.user.id) == str(event['to_user']):
            await self.send(text_data=json.dumps({
                'type': 'offer',
                'offer': event['offer'],
                'from_user': event['from_user'],
                'from_username': event.get('from_username', ''),
            }))

    async def webrtc_answer(self, event):
        if str(self.user.id) == str(event['to_user']):
            await self.send(text_data=json.dumps({
                'type': 'answer',
                'answer': event['answer'],
                'from_user': event['from_user'],
            }))

    async def webrtc_ice(self, event):
        if str(self.user.id) == str(event['to_user']):
            await self.send(text_data=json.dumps({
                'type': 'ice_candidate',
                'candidate': event['candidate'],
                'from_user': event['from_user'],
            }))