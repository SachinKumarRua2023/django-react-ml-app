from rest_framework import serializers
from .models import Employee, User, MemoryGameScore, Achievement, GamingScore, QuizResult, VCRSession, CourseProgress, StudentAnalytics


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


class GamingScoreSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = GamingScore
        fields = ['id', 'user', 'user_email', 'username', 'game_name', 'game_subtype', 'score', 'level', 'time_taken', 'accuracy', 'played_at', 'metadata', 'is_personal_best']
        read_only_fields = ['id', 'played_at', 'user', 'is_personal_best']


class QuizResultSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = QuizResult
        fields = ['id', 'user', 'user_email', 'username', 'quiz_name', 'course_name', 'score', 'total_questions', 'correct_answers', 'time_taken', 'completed_at', 'answers', 'passed']
        read_only_fields = ['id', 'completed_at', 'user']


class VCRSessionSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = VCRSession
        fields = ['id', 'user', 'user_email', 'username', 'room_name', 'room_id', 'joined_at', 'left_at', 'duration', 'role', 'messages_sent']
        read_only_fields = ['id', 'user']


class CourseProgressSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = CourseProgress
        fields = ['id', 'user', 'user_email', 'username', 'course_name', 'course_id', 'video_id', 'watch_time', 'completion_percentage', 'completed', 'started_at', 'completed_at', 'last_watched']
        read_only_fields = ['id', 'started_at', 'last_watched', 'user']


class StudentAnalyticsSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = StudentAnalytics
        fields = ['id', 'user', 'user_email', 'username', 'total_games_played', 'total_gaming_time', 'highest_game_score', 
                  'courses_enrolled', 'courses_completed', 'total_learning_time', 'total_vcr_time',
                  'quizzes_taken', 'quizzes_passed', 'average_quiz_score',
                  'global_rank', 'weekly_rank', 'total_points', 'weekly_points', 'updated_at']
        read_only_fields = ['id', 'user', 'updated_at']


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


class GamingScoreSubmitSerializer(serializers.Serializer):
    """Serializer for submitting gaming scores"""
    game_name = serializers.ChoiceField(choices=['memory', 'quiz', 'puzzle', 'adventure', 'strategy'])
    game_subtype = serializers.CharField(required=False, allow_blank=True)
    score = serializers.IntegerField(min_value=0)
    level = serializers.IntegerField(default=1)
    time_taken = serializers.FloatField(min_value=0)
    accuracy = serializers.FloatField(min_value=0, max_value=100)
    metadata = serializers.JSONField(required=False, default=dict)


class QuizSubmitSerializer(serializers.Serializer):
    """Serializer for submitting quiz results"""
    quiz_name = serializers.CharField(max_length=200)
    course_name = serializers.CharField(max_length=200, required=False, allow_blank=True)
    score = serializers.FloatField(min_value=0, max_value=100)
    total_questions = serializers.IntegerField(min_value=1)
    correct_answers = serializers.IntegerField(min_value=0)
    time_taken = serializers.FloatField(min_value=0)
    answers = serializers.ListField(child=serializers.JSONField())
    passed = serializers.BooleanField()


class LeaderboardSerializer(serializers.Serializer):
    """Serializer for leaderboard data"""
    difficulty = serializers.ChoiceField(choices=['20x', '50x', '100x', '200x'], required=False)
    limit = serializers.IntegerField(default=10, min_value=1, max_value=100)
