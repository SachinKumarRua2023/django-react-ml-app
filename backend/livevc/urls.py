# from django.urls import path
# from . import views

# urlpatterns = [
#     # AUTH endpoints (NEW - for login/signup/logout)
#     path('register/', views.register, name='register'),
#     path('login/', views.login, name='login'),
#     path('logout/', views.logout_user, name='logout'),
#     path('profile/', views.get_profile, name='profile'),
#     path('profile/update/', views.update_profile, name='update_profile'),
#     path('auth/google/', views.google_auth, name='google_auth'),
    
#     # VOICE endpoints (your existing voice routes)
#     # path('voice/rooms/', views.voice_rooms, name='voice_rooms'),
#     # path('voice/join/<str:room_id>/', views.join_room, name='join_room'),
#     # ... other voice routes
# ]
from django.urls import path
from . import views

urlpatterns = [
    # AUTH endpoints (keep existing)
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout_user, name='logout'),
    path('profile/', views.get_profile, name='profile'),
    path('profile/update/', views.update_profile, name='update_profile'),
    path('auth/google/', views.google_auth, name='google_auth'),
    
    # VOICE PANEL endpoints (NEW)
    path('panels/', views.list_panels, name='list_panels'),
    path('panels/create/', views.create_panel, name='create_panel'),
    path('panels/<uuid:panel_id>/join/', views.join_panel, name='join_panel'),
    path('panels/<uuid:panel_id>/leave/', views.leave_panel, name='leave_panel'),
    path('panels/<uuid:panel_id>/members/', views.get_panel_members, name='get_panel_members'),
    path('panels/<uuid:panel_id>/raise-hand/', views.raise_hand, name='raise_hand'),
    path('panels/<uuid:panel_id>/lower-hand/', views.lower_hand, name='lower_hand'),
    path('panels/<uuid:panel_id>/mute-all/', views.mute_all, name='mute_all'),
    path('panels/<uuid:panel_id>/promote/<int:user_id>/', views.promote_member, name='promote_member'),
    path('panels/<uuid:panel_id>/kick/<int:user_id>/', views.kick_member, name='kick_member'),
    
    # Legacy endpoints
    path('voice/rooms/', views.voice_rooms, name='voice_rooms'),
    path('voice/join/<str:room_id>/', views.join_room, name='join_room'),
    path('panels/<uuid:panel_id>/update-peer/', views.update_panel_peer, name='update_panel_peer'),
#
]