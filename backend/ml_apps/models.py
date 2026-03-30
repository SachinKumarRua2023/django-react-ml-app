from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Course(models.Model):
    """Course model for syllabus management"""
    id = models.CharField(max_length=50, primary_key=True)  # e.g., 'python', 'mysql', 'react'
    title = models.CharField(max_length=200)
    icon = models.CharField(max_length=10, default='📚')
    color = models.CharField(max_length=7, default='#00d9ff')
    description = models.TextField(blank=True)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'title']

    def __str__(self):
        return self.title


class Module(models.Model):
    """Module within a course"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=200)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['course', 'order', 'title']

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class Topic(models.Model):
    """Topic within a module"""
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='topics')
    title = models.CharField(max_length=200)
    order = models.IntegerField(default=0)
    content = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['module', 'order', 'title']

    def __str__(self):
        return f"{self.module.title} - {self.title}"

    def get_default_content(self):
        """Return default content structure if none exists"""
        return {
            'title': self.title,
            'description': f'Master {self.title} with hands-on examples and real-world projects.',
            'sections': [
                {'heading': 'Overview', 'text': f'This topic covers fundamental concepts of {self.title}.'},
                {'heading': 'Key Concepts', 'text': 'Understanding core principles and best practices.'},
                {'heading': 'Practical Application', 'text': 'Real-world usage patterns and performance considerations.'},
                {'heading': 'Practice Exercise', 'text': 'Apply what you\'ve learned with hands-on challenges.'}
            ]
        }

    def get_content(self):
        """Get content or return default"""
        if not self.content:
            return self.get_default_content()
        return self.content

