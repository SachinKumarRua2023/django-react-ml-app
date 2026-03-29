from django.urls import path
from .views import (
    google_auth, submit_score, get_user_scores, get_leaderboard,
    get_user_achievements, send_test_email
)

urlpatterns = [
    # Google Authentication
    path('auth/google/', google_auth, name='google-auth'),
    
    # Memory Game Scores
    path('scores/submit/', submit_score, name='submit-score'),
    path('scores/', get_user_scores, name='user-scores'),
    path('scores/leaderboard/', get_leaderboard, name='leaderboard'),
    
    # Achievements
    path('achievements/', get_user_achievements, name='user-achievements'),
    
    # Test Email
    path('test-email/', send_test_email, name='test-email'),
]
