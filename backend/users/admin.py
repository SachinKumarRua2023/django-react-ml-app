from django.contrib import admin
from .models import Employee, User, MemoryGameScore, Achievement

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ['name', 'age', 'department', 'salary']
    search_fields = ['name', 'department']

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'username', 'google_id', 'is_google_user', 'created_at']
    search_fields = ['email', 'username', 'google_id']
    list_filter = ['is_google_user', 'created_at']

@admin.register(MemoryGameScore)
class MemoryGameScoreAdmin(admin.ModelAdmin):
    list_display = ['user', 'difficulty', 'score', 'total_items', 'accuracy', 'played_at', 'is_personal_best']
    list_filter = ['difficulty', 'is_personal_best', 'played_at']
    search_fields = ['user__email', 'user__username']
    ordering = ['-played_at']

@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ['user', 'achievement_type', 'title', 'unlocked_at', 'email_sent']
    list_filter = ['achievement_type', 'unlocked_at', 'email_sent']
    search_fields = ['user__email', 'title']
