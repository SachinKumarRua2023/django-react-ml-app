from django.urls import path
from . import views

urlpatterns = [
    path('follow/<int:user_id>/', views.follow_user,      name='vcr_follow'),
    path('upvote/',               views.upvote_speaker,   name='vcr_upvote'),
    path('leaderboard/',          views.leaderboard,      name='vcr_leaderboard'),
    path('onboarding/',           views.save_onboarding,  name='vcr_onboarding'),
    path('profile/',              views.get_vcr_profile,  name='vcr_profile'),
]