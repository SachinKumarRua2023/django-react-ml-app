from rest_framework import serializers
from .models import VoicePanel, PanelMember

class VoicePanelSerializer(serializers.ModelSerializer):
    host_username = serializers.CharField(source='host.username', read_only=True)
    member_count = serializers.SerializerMethodField()
    
    class Meta:
        model = VoicePanel
        fields = ['id', 'title', 'topic', 'host_username', 'max_members', 'member_count', 'created_at', 'is_active']
    
    def get_member_count(self, obj):
        return obj.members.count()

class PanelMemberSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = PanelMember
        fields = ['id', 'username', 'role', 'is_muted', 'is_hand_raised', 'joined_at']