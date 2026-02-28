from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('trainer', 'Trainer'),
        ('learner', 'Learner'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='learner')
    is_premium = models.BooleanField(default=False)
    avatar_url = models.URLField(blank=True, null=True)
    google_id = models.CharField(max_length=100, blank=True, null=True)  # Keep for old users
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.email} - {self.role}"


from django.db import models
from django.contrib.auth.models import User
import uuid

class VoicePanel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    topic = models.CharField(max_length=100, choices=[
        ('ai_tech', 'AI & Technology'),
        ('innovation', 'Innovation'),
        ('spiritual', 'Spiritual & Philosophy'),
        ('skills', 'Skills & Learning'),
        ('general', 'General Discussion'),
    ])
    host = models.ForeignKey(User, on_delete=models.CASCADE, related_name='hosted_panels')
    peer_id = models.CharField(max_length=100, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    max_members = models.IntegerField(default=4)

    def __str__(self):
        return f"{self.title} - {self.host.username}"

class PanelMember(models.Model):
    ROLE_CHOICES = [
        ('host', 'Host'),
        ('co_host', 'Co-Host'),
        ('speaker', 'Speaker'),
        ('listener', 'Listener'),
    ]
    
    panel = models.ForeignKey(VoicePanel, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='listener')
    joined_at = models.DateTimeField(auto_now_add=True)
    is_muted = models.BooleanField(default=False)
    is_hand_raised = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ['panel', 'user']
    
    def __str__(self):
        return f"{self.user.username} - {self.panel.title}"

class HandRaiseRequest(models.Model):
    panel = models.ForeignKey(VoicePanel, on_delete=models.CASCADE, related_name='hand_raises')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    raised_at = models.DateTimeField(auto_now_add=True)
    is_addressed = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ['panel', 'user']