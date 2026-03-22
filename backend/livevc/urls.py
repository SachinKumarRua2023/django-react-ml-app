# backend/livevc/urls.py
# ─────────────────────────────────────────────────────────────────────────────
# BUGS FIXED vs submitted version:
#   [CRIT] Duplicate path: 'auth/google/verify/' appeared twice → Django
#          raises ImproperlyConfigured on startup. Second copy removed.
#   [CRIT] Duplicate name: 'google_login' appeared twice → same crash.
#          Second copy removed.
#   [INFO] VCR routes (follow/upvote/leaderboard/onboarding/profile) are
#          NOT here — they belong in voice_rooms/urls.py (see note below).
# ─────────────────────────────────────────────────────────────────────────────

from django.urls import path
from . import views

urlpatterns = [

    # ── AUTH ─────────────────────────────────────────────────────────────────
    path('register/',           views.register,           name='register'),
    path('login/',              views.login,              name='login'),
    path('logout/',             views.logout_user,        name='logout'),
    path('profile/',            views.get_profile,        name='profile'),
    path('profile/update/',     views.update_profile,     name='update_profile'),
    path('auth/google/',        views.google_auth,        name='google_auth'),         # deprecated → 400
    path('auth/google/verify/', views.google_login,       name='google_login'),        # real endpoint
    path('upgrade-to-trainer/', views.upgrade_to_trainer, name='upgrade_to_trainer'),

    # ── TURN CREDENTIALS (WebRTC ICE config) ─────────────────────────────────
    path('turn-credentials/',   views.turn_credentials,   name='turn_credentials'),

    # ── PANELS ───────────────────────────────────────────────────────────────
    # NOTE: panels/create/ MUST come before panels/<uuid:...>/ so Django
    # doesn't try to cast the string "create" as a UUID.
    path('panels/',                                       views.list_panels,       name='list_panels'),
    path('panels/create/',                                views.create_panel,      name='create_panel'),
    path('panels/<uuid:panel_id>/join/',                  views.join_panel,        name='join_panel'),
    path('panels/<uuid:panel_id>/leave/',                 views.leave_panel,       name='leave_panel'),
    path('panels/<uuid:panel_id>/members/',               views.get_panel_members, name='get_panel_members'),
    path('panels/<uuid:panel_id>/raise-hand/',            views.raise_hand,        name='raise_hand'),
    path('panels/<uuid:panel_id>/lower-hand/',            views.lower_hand,        name='lower_hand'),
    path('panels/<uuid:panel_id>/mute-all/',              views.mute_all,          name='mute_all'),
    path('panels/<uuid:panel_id>/promote/<int:user_id>/', views.promote_member,    name='promote_member'),
    path('panels/<uuid:panel_id>/kick/<int:user_id>/',    views.kick_member,       name='kick_member'),
    path('panels/<uuid:panel_id>/update-peer/',           views.update_panel_peer, name='update_panel_peer'),
    path('panels/<uuid:panel_id>/delete/',                views.delete_panel,      name='delete_panel'),

    # ── LEGACY COMPAT ────────────────────────────────────────────────────────
    path('voice/rooms/',              views.voice_rooms, name='voice_rooms'),
    path('voice/join/<str:room_id>/', views.join_room,   name='join_room'),
]

# ─────────────────────────────────────────────────────────────────────────────
# IMPORTANT — backend/backend/urls.py MUST include BOTH apps:
#
#   from django.urls import path, include
#   urlpatterns = [
#       path('api/', include('livevc.urls')),        ← this file
#       path('api/vcr/', include('voice_rooms.urls')),  ← follow/upvote/leaderboard
#       path('admin/', admin.site.urls),
#   ]
#
# voice_rooms/urls.py handles:
#   vcr/follow/<id>/
#   vcr/upvote/
#   vcr/leaderboard/
#   vcr/onboarding/
#   vcr/profile/
#   ws/notifications/<user_id>/  (via routing.py)
# ─────────────────────────────────────────────────────────────────────────────