from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import (
    Follow, Upvote, UserRankScore,
    VoiceRoomProfile, PanelSession, UserPanelHistory
)
from livevc.models import VoicePanel

User = get_user_model()


# ─── 1. FOLLOW A USER ────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def follow_user(request, user_id):
    """
    Follow another user.
    - Increments their follower count in UserRankScore
    - Sends popup notification if they are currently hosting a live panel
    """
    if request.user.id == user_id:
        return Response({'error': 'You cannot follow yourself'}, status=400)

    target = get_object_or_404(User, id=user_id)

    follow, created = Follow.objects.get_or_create(
        from_user=request.user,
        to_user=target
    )

    if not created:
        # Already following — unfollow
        follow.delete()
        # Recalculate target rank score
        score, _ = UserRankScore.objects.get_or_create(user=target)
        score.recalculate()
        return Response({
            'status': 'unfollowed',
            'username': target.username,
            'followers': target.vcr_followers.count()
        })

    # Recalculate target rank score immediately
    score, _ = UserRankScore.objects.get_or_create(user=target)
    score.recalculate()

    # Check if target is currently hosting a live panel
    live_panel = VoicePanel.objects.filter(
        host=target,
        is_active=True
    ).first()

    notification_data = None
    if live_panel:
        # Send real-time notification via Django Channels
        channel_layer = get_channel_layer()
        notification_data = {
            'type': 'followed_host_live',
            'message': f'{target.username} is live right now!',
            'panel_id': str(live_panel.id),
            'panel_title': live_panel.title,
            'panel_topic': live_panel.topic,
            'host': target.username,
        }
        async_to_sync(channel_layer.group_send)(
            f'notifications_{request.user.id}',
            {
                'type': 'send_notification',
                'data': notification_data,
            }
        )

    return Response({
        'status': 'followed',
        'username': target.username,
        'followers': target.vcr_followers.count(),
        'is_live': live_panel is not None,
        'live_panel': notification_data,
    })


# ─── 2. UPVOTE A SPEAKER ─────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upvote_speaker(request):
    """
    Upvote a speaker inside a panel.
    One upvote per listener per panel — prevents spam.
    Immediately recalculates speaker's rank score.
    """
    to_user_id = request.data.get('to_user_id')
    panel_id   = request.data.get('panel_id')

    if not to_user_id or not panel_id:
        return Response({'error': 'to_user_id and panel_id are required'}, status=400)

    if request.user.id == int(to_user_id):
        return Response({'error': 'You cannot upvote yourself'}, status=400)

    target = get_object_or_404(User, id=to_user_id)

    upvote, created = Upvote.objects.get_or_create(
        from_user=request.user,
        to_user=target,
        panel_id=str(panel_id)
    )

    if not created:
        return Response({'status': 'already_upvoted'}, status=400)

    # Recalculate rank score immediately
    score, _ = UserRankScore.objects.get_or_create(user=target)
    score.recalculate()

    return Response({
        'status': 'upvoted',
        'username': target.username,
        'new_score': round(score.score, 1),
        'total_upvotes': target.upvotes_received.count(),
    })


# ─── 3. LEADERBOARD ──────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def leaderboard(request):
    """
    GET /api/vcr/leaderboard/
    GET /api/vcr/leaderboard/?type=college&college=IIT+Delhi

    Returns top 50 users ranked by score.
    Formula: (total_time × 1) + (upvotes × 3) + (followers × 2)
    """
    leaderboard_type = request.GET.get('type', 'overall')
    college          = request.GET.get('college', '').strip()

    qs = UserRankScore.objects.select_related(
        'user', 'user__vcr_profile'
    ).order_by('-score')

    if leaderboard_type == 'college' and college:
        qs = qs.filter(user__vcr_profile__college__iexact=college)

    data = []
    for i, row in enumerate(qs[:50]):
        try:
            college_name = row.user.vcr_profile.college
            course       = row.user.vcr_profile.current_course
        except Exception:
            college_name = ''
            course       = ''

        # Check if this is the requesting user
        is_me = row.user.id == request.user.id

        data.append({
            'rank':        i + 1,
            'user_id':     row.user.id,
            'username':    row.user.username,
            'first_name':  row.user.first_name,
            'score':       round(row.score, 1),
            'total_time':  round(row.total_time, 1),
            'upvotes':     row.upvote_count,
            'followers':   row.follower_count,
            'college':     college_name,
            'course':      course,
            'is_me':       is_me,
        })

    # Also return requesting user's own rank if not in top 50
    my_rank = None
    try:
        my_score = UserRankScore.objects.get(user=request.user)
        my_position = UserRankScore.objects.filter(
            score__gt=my_score.score
        ).count() + 1
        my_rank = {
            'rank':       my_position,
            'user_id':    request.user.id,
            'username':   request.user.username,
            'score':      round(my_score.score, 1),
            'total_time': round(my_score.total_time, 1),
            'upvotes':    my_score.upvote_count,
            'followers':  my_score.follower_count,
        }
    except UserRankScore.DoesNotExist:
        pass

    return Response({
        'leaderboard': data,
        'my_rank':     my_rank,
        'type':        leaderboard_type,
        'college':     college,
    })


# ─── 4. SAVE ONBOARDING ──────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_onboarding(request):
    """
    POST /api/vcr/onboarding/
    Saves course, interests, college, skill_tags after first login.
    Sets onboarded=True so screen never shows again.
    """
    profile, _ = VoiceRoomProfile.objects.get_or_create(user=request.user)

    profile.current_course = request.data.get('current_course', '')
    profile.interests      = request.data.get('interests', [])
    profile.skill_tags     = request.data.get('skill_tags', [])
    profile.college        = request.data.get('college', '')
    profile.onboarded      = True
    profile.save()

    # Initialize rank score entry for this user
    UserRankScore.objects.get_or_create(user=request.user)

    return Response({
        'status':         'saved',
        'current_course': profile.current_course,
        'interests':      profile.interests,
        'college':        profile.college,
        'onboarded':      True,
    })


# ─── 5. GET MY VCR PROFILE ───────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_vcr_profile(request):
    """
    GET /api/vcr/profile/
    Returns VCR-specific profile data for the logged-in user.
    """
    try:
        profile = request.user.vcr_profile
        onboarded = profile.onboarded
    except VoiceRoomProfile.DoesNotExist:
        onboarded = False
        profile   = None

    try:
        rank = request.user.rank_score
        score_data = {
            'score':       round(rank.score, 1),
            'total_time':  round(rank.total_time, 1),
            'upvotes':     rank.upvote_count,
            'followers':   rank.follower_count,
        }
    except Exception:
        score_data = {'score': 0, 'total_time': 0, 'upvotes': 0, 'followers': 0}

    return Response({
        'user_id':       request.user.id,
        'username':      request.user.username,
        'onboarded':     onboarded,
        'current_course': profile.current_course if profile else '',
        'interests':     profile.interests if profile else [],
        'college':       profile.college if profile else '',
        'skill_tags':    profile.skill_tags if profile else [],
        'rank':          score_data,
        'following_count': request.user.vcr_following.count(),
        'follower_count':  request.user.vcr_followers.count(),
    })