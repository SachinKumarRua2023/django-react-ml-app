from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


class Employee(models.Model):
    name = models.CharField(max_length=100)
    age = models.IntegerField()
    department = models.CharField(max_length=100)
    salary = models.FloatField()

    class Meta:
        db_table = "employees"
        managed = True  # Django can handle migrations now

    def __str__(self):
        return self.name


class User(AbstractUser):
    """Custom user model with Google OAuth support"""
    email = models.EmailField(unique=True)
    google_id = models.CharField(max_length=255, blank=True, null=True, unique=True)
    profile_picture = models.URLField(blank=True, null=True)
    is_google_user = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    last_login_at = models.DateTimeField(blank=True, null=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.email


class MemoryGameScore(models.Model):
    """Stores memory game scores for users"""
    DIFFICULTY_CHOICES = [
        ('20x', '20 Items - Beginner'),
        ('50x', '50 Items - Intermediate'),
        ('100x', '100 Items - Advanced'),
        ('200x', '200 Items - Expert'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='memory_scores')
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)
    score = models.IntegerField()  # Number of items correctly remembered
    total_items = models.IntegerField()  # Total items in the round
    time_taken = models.FloatField()  # Time taken in seconds
    accuracy = models.FloatField()  # Accuracy percentage
    played_at = models.DateTimeField(default=timezone.now)
    is_personal_best = models.BooleanField(default=False)

    class Meta:
        ordering = ['-score', 'time_taken']
        db_table = 'memory_game_scores'

    def __str__(self):
        return f"{self.user.email} - {self.difficulty}: {self.score}/{self.total_items}"


class Achievement(models.Model):
    """Achievements that users can unlock"""
    ACHIEVEMENT_TYPES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert'),
        ('master', 'Memory Master'),
        ('streak', 'Streak Holder'),
        ('course_complete', 'Course Completer'),
        ('quiz_master', 'Quiz Master'),
        ('gaming_pro', 'Gaming Pro'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    achievement_type = models.CharField(max_length=20, choices=ACHIEVEMENT_TYPES)
    title = models.CharField(max_length=100)
    description = models.TextField()
    unlocked_at = models.DateTimeField(default=timezone.now)
    email_sent = models.BooleanField(default=False)

    class Meta:
        unique_together = ['user', 'achievement_type']
        db_table = 'achievements'

    def __str__(self):
        return f"{self.user.email} - {self.title}"


class GamingScore(models.Model):
    """Universal gaming score tracking for all games"""
    GAME_TYPES = [
        ('memory', 'Memory Game'),
        ('quiz', 'Quiz Game'),
        ('puzzle', 'Puzzle Game'),
        ('adventure', 'Adventure Game'),
        ('strategy', 'Strategy Game'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='gaming_scores')
    game_name = models.CharField(max_length=100, choices=GAME_TYPES)
    game_subtype = models.CharField(max_length=100, blank=True)  # e.g., "20x", "50x"
    score = models.IntegerField()
    level = models.IntegerField(default=1)
    time_taken = models.FloatField()  # in seconds
    accuracy = models.FloatField(default=0)  # percentage
    played_at = models.DateTimeField(default=timezone.now)
    metadata = models.JSONField(default=dict)  # Additional game-specific data
    is_personal_best = models.BooleanField(default=False)

    class Meta:
        ordering = ['-played_at']
        db_table = 'gaming_scores'

    def __str__(self):
        return f"{self.user.email} - {self.game_name}: {self.score}"


class QuizResult(models.Model):
    """Quiz results tracking"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_results')
    quiz_name = models.CharField(max_length=200)
    course_name = models.CharField(max_length=200, blank=True)
    score = models.FloatField()
    total_questions = models.IntegerField()
    correct_answers = models.IntegerField()
    time_taken = models.FloatField()  # in seconds
    completed_at = models.DateTimeField(default=timezone.now)
    answers = models.JSONField(default=list)  # Store question-wise answers
    passed = models.BooleanField(default=False)

    class Meta:
        ordering = ['-completed_at']
        db_table = 'quiz_results'

    def __str__(self):
        return f"{self.user.email} - {self.quiz_name}: {self.score}%"


class VCRSession(models.Model):
    """Voice Chat Room session tracking"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='vcr_sessions')
    room_name = models.CharField(max_length=100)
    room_id = models.CharField(max_length=100)
    joined_at = models.DateTimeField()
    left_at = models.DateTimeField(null=True, blank=True)
    duration = models.DurationField(null=True, blank=True)
    role = models.CharField(max_length=20, choices=[('host', 'Host'), ('participant', 'Participant')])
    messages_sent = models.IntegerField(default=0)

    class Meta:
        ordering = ['-joined_at']
        db_table = 'vcr_sessions'

    def __str__(self):
        return f"{self.user.email} - {self.room_name} ({self.duration})"


class CourseProgress(models.Model):
    """Course progress and time tracking"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='course_progress')
    course_name = models.CharField(max_length=200)
    course_id = models.CharField(max_length=100)
    video_id = models.CharField(max_length=100, blank=True)
    watch_time = models.FloatField(default=0)  # in seconds
    completion_percentage = models.FloatField(default=0)
    completed = models.BooleanField(default=False)
    started_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(null=True, blank=True)
    last_watched = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-last_watched']
        db_table = 'course_progress'

    def __str__(self):
        return f"{self.user.email} - {self.course_name}: {self.completion_percentage}%"


class StudentAnalytics(models.Model):
    """Aggregated student analytics for quick dashboard queries"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='analytics')
    
    # Gaming stats
    total_games_played = models.IntegerField(default=0)
    total_gaming_time = models.FloatField(default=0)  # in seconds
    highest_game_score = models.IntegerField(default=0)
    
    # Learning stats
    courses_enrolled = models.IntegerField(default=0)
    courses_completed = models.IntegerField(default=0)
    total_learning_time = models.FloatField(default=0)  # in seconds
    total_vcr_time = models.FloatField(default=0)  # in seconds
    
    # Quiz stats
    quizzes_taken = models.IntegerField(default=0)
    quizzes_passed = models.IntegerField(default=0)
    average_quiz_score = models.FloatField(default=0)
    
    # Rank
    global_rank = models.IntegerField(default=0)
    weekly_rank = models.IntegerField(default=0)
    
    # Points (for gamification)
    total_points = models.IntegerField(default=0)
    weekly_points = models.IntegerField(default=0)
    
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'student_analytics'

    def __str__(self):
        return f"{self.user.email} - Rank: {self.global_rank}, Points: {self.total_points}"
