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
