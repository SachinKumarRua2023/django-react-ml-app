from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class VoiceRoomProfile(models.Model):
    """
    SeekhoWithRua-specific fields for VCR ranking.
    Separate from your existing UserProfile in livevc — no conflict.
    """
    user           = models.OneToOneField(User, on_delete=models.CASCADE, related_name='vcr_profile')
    college        = models.CharField(max_length=200, blank=True)
    current_course = models.CharField(max_length=60, blank=True)
    # e.g. "data-science-course", "ai-course" — matches SEO slug
    interests      = models.JSONField(default=list)
    # e.g. ["it_tech", "spiritual", "debate", "school_college"]
    skill_tags     = models.JSONField(default=list)
    onboarded      = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} — VCR Profile"


class PanelSession(models.Model):
    """
    Records every user's time in every VoicePanel.
    Hooks into your existing VoicePanel via panel_id (UUID stored as string).
    Does NOT modify VoicePanel model.
    """
    user             = models.ForeignKey(User, on_delete=models.CASCADE, related_name='panel_sessions')
    panel_id         = models.CharField(max_length=100)  # stores VoicePanel UUID
    panel_title      = models.CharField(max_length=200)
    role             = models.CharField(max_length=20)   # host / speaker / listener
    joined_at        = models.DateTimeField(auto_now_add=True)
    left_at          = models.DateTimeField(null=True, blank=True)
    duration_minutes = models.FloatField(default=0)

    def close_session(self):
        self.left_at          = timezone.now()
        self.duration_minutes = (self.left_at - self.joined_at).total_seconds() / 60
        self.save()
        # Recalculate user rank score
        score_obj, _ = UserRankScore.objects.get_or_create(user=self.user)
        score_obj.recalculate()

    def __str__(self):
        return f"{self.user.username} in {self.panel_title} — {self.duration_minutes:.1f} min"


class UserPanelHistory(models.Model):
    """
    Which panels each user has ever joined.
    Used for co-occurrence recommendation (YouTube signal).
    """
    user      = models.ForeignKey(User, on_delete=models.CASCADE, related_name='panel_history')
    panel_id  = models.CharField(max_length=100)  # VoicePanel UUID
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'panel_id')

    def __str__(self):
        return f"{self.user.username} visited panel {self.panel_id}"


class PanelCoOccurrence(models.Model):
    """
    User joins Panel A then Panel B → co_join_count(A,B) += 1.
    Powers "others who joined this also joined..." recommendations.
    """
    panel_a_id    = models.CharField(max_length=100)
    panel_b_id    = models.CharField(max_length=100)
    co_join_count = models.IntegerField(default=1)
    updated_at    = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('panel_a_id', 'panel_b_id')

    @classmethod
    def record_join(cls, user, new_panel_id):
        previous = UserPanelHistory.objects.filter(user=user).exclude(panel_id=new_panel_id)
        for ph in previous:
            a, b = sorted([str(ph.panel_id), str(new_panel_id)])
            obj, created = cls.objects.get_or_create(panel_a_id=a, panel_b_id=b)
            if not created:
                obj.co_join_count += 1
                obj.save()

    def __str__(self):
        return f"Panel {self.panel_a_id} ↔ {self.panel_b_id} — {self.co_join_count} co-joins"


class Follow(models.Model):
    """
    User A follows User B inside voice rooms.
    """
    from_user  = models.ForeignKey(User, related_name='vcr_following', on_delete=models.CASCADE)
    to_user    = models.ForeignKey(User, related_name='vcr_followers', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('from_user', 'to_user')

    def __str__(self):
        return f"{self.from_user.username} → {self.to_user.username}"


class Upvote(models.Model):
    """
    Listener upvotes a speaker inside a panel.
    One upvote per user per panel — prevents spam.
    """
    from_user  = models.ForeignKey(User, related_name='upvotes_given', on_delete=models.CASCADE)
    to_user    = models.ForeignKey(User, related_name='upvotes_received', on_delete=models.CASCADE)
    panel_id   = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('from_user', 'to_user', 'panel_id')

    def __str__(self):
        return f"{self.from_user.username} upvoted {self.to_user.username}"


class UserRankScore(models.Model):
    """
    Formula: (total_time × 1) + (upvotes × 3) + (followers × 2)
    Recalculated every time a user leaves a panel.
    """
    user           = models.OneToOneField(User, on_delete=models.CASCADE, related_name='rank_score')
    total_time     = models.FloatField(default=0)
    upvote_count   = models.IntegerField(default=0)
    follower_count = models.IntegerField(default=0)
    score          = models.FloatField(default=0)
    last_updated   = models.DateTimeField(auto_now=True)

    def recalculate(self):
        self.total_time     = sum(s.duration_minutes for s in self.user.panel_sessions.all())
        self.upvote_count   = self.user.upvotes_received.count()
        self.follower_count = self.user.vcr_followers.count()
        self.score = (self.total_time * 1) + (self.upvote_count * 3) + (self.follower_count * 2)
        self.save()

    def __str__(self):
        return f"{self.user.username} — score: {self.score}"