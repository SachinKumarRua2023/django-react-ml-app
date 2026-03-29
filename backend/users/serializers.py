from rest_framework import serializers
from .models import Employee, User, MemoryGameScore, Achievement


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'google_id', 'profile_picture', 'is_google_user', 'created_at', 'last_login_at']
        read_only_fields = ['id', 'created_at']


class MemoryGameScoreSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = MemoryGameScore
        fields = ['id', 'user', 'user_email', 'username', 'difficulty', 'score', 'total_items', 'time_taken', 'accuracy', 'played_at', 'is_personal_best']
        read_only_fields = ['id', 'played_at', 'user']


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ['id', 'achievement_type', 'title', 'description', 'unlocked_at', 'email_sent']
        read_only_fields = ['id', 'unlocked_at']


class GoogleAuthSerializer(serializers.Serializer):
    """Serializer for Google OAuth token verification"""
    token = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    name = serializers.CharField(required=True)
    google_id = serializers.CharField(required=True)
    picture = serializers.URLField(required=False, allow_blank=True)


class ScoreSubmitSerializer(serializers.Serializer):
    """Serializer for submitting memory game scores"""
    difficulty = serializers.ChoiceField(choices=['20x', '50x', '100x', '200x'])
    score = serializers.IntegerField(min_value=0)
    total_items = serializers.IntegerField(min_value=1)
    time_taken = serializers.FloatField(min_value=0)
    accuracy = serializers.FloatField(min_value=0, max_value=100)


class LeaderboardSerializer(serializers.Serializer):
    """Serializer for leaderboard data"""
    difficulty = serializers.ChoiceField(choices=['20x', '50x', '100x', '200x'], required=False)
    limit = serializers.IntegerField(default=10, min_value=1, max_value=100)
