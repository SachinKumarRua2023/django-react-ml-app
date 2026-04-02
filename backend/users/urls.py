from django.urls import path
from .views import (
    google_auth, submit_score, get_user_scores, get_leaderboard,
    get_user_achievements, send_test_email,
    submit_gaming_score, get_gaming_scores,
    submit_quiz_result, get_quiz_results,
    get_student_analytics, get_trainer_dashboard, get_student_report,
    request_password_reset, verify_otp_and_reset_password, update_profile,
    user_login, user_register, user_logout
)

urlpatterns = [
    # Authentication
    path('login/', user_login, name='login'),
    path('register/', user_register, name='register'),
    path('logout/', user_logout, name='logout'),
    
    # Google Authentication
    path('auth/google/', google_auth, name='google-auth'),
    
    # Password Reset with OTP
    path('password-reset/request/', request_password_reset, name='password-reset-request'),
    path('password-reset/verify/', verify_otp_and_reset_password, name='password-reset-verify'),
    
    # Profile Management
    path('profile/update/', update_profile, name='profile-update'),
    
    # Memory Game Scores
    path('scores/submit/', submit_score, name='submit-score'),
    path('scores/', get_user_scores, name='user-scores'),
    path('scores/leaderboard/', get_leaderboard, name='leaderboard'),
    
    # Gaming Scores (Universal)
    path('gaming/submit/', submit_gaming_score, name='submit-gaming-score'),
    path('gaming/scores/', get_gaming_scores, name='gaming-scores'),
    
    # Quiz Results
    path('quiz/submit/', submit_quiz_result, name='submit-quiz'),
    path('quiz/results/', get_quiz_results, name='quiz-results'),
    
    # Analytics & Reports
    path('analytics/', get_student_analytics, name='student-analytics'),
    path('trainer/dashboard/', get_trainer_dashboard, name='trainer-dashboard'),
    path('trainer/student/<int:student_id>/', get_student_report, name='student-report'),
    
    # Achievements
    path('achievements/', get_user_achievements, name='user-achievements'),
    
    # Test Email
    path('test-email/', send_test_email, name='test-email'),
]
