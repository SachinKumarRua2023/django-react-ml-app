from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from .models import UserProfile
from django.core.exceptions import ValidationError
import re

def validate_password(password):
    """Validate password strength"""
    if len(password) < 8:
        raise ValidationError("Password must be at least 8 characters long")
    if not re.search(r"[A-Z]", password):
        raise ValidationError("Password must contain at least one uppercase letter")
    if not re.search(r"[a-z]", password):
        raise ValidationError("Password must contain at least one lowercase letter")
    if not re.search(r"\d", password):
        raise ValidationError("Password must contain at least one digit")
    return True

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Custom registration with email/password
    """
    data = request.data
    email = data.get('email', '').lower().strip()
    password = data.get('password')
    confirm_password = data.get('confirm_password')
    first_name = data.get('first_name', '').strip()
    last_name = data.get('last_name', '').strip()
    role = data.get('role', 'learner')  # 'trainer' or 'learner'
    
    # Validation
    if not email or not password:
        return Response({'error': 'Email and password are required'}, status=400)
    
    if password != confirm_password:
        return Response({'error': 'Passwords do not match'}, status=400)
    
    try:
        validate_password(password)
    except ValidationError as e:
        return Response({'error': str(e)}, status=400)
    
    if User.objects.filter(email=email).exists():
        return Response({'error': 'User with this email already exists'}, status=400)
    
    # Create username from email
    username = email.split('@')[0]
    base_username = username
    counter = 1
    while User.objects.filter(username=username).exists():
        username = f"{base_username}{counter}"
        counter += 1
    
    # Create user
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name
    )
    
    # Create profile
    profile = UserProfile.objects.create(
        user=user,
        role=role if role in ['trainer', 'learner'] else 'learner'
    )
    
    # Create token
    token, _ = Token.objects.get_or_create(user=user)
    
    return Response({
        'token': token.key,
        'user': {
            'id': user.id,
            'email': user.email,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'profile': {
                'role': profile.role,
                'is_premium': profile.is_premium,
                'avatar_url': profile.avatar_url if hasattr(profile, 'avatar_url') else None,
            }
        },
        'message': 'Registration successful'
    }, status=201)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Custom login with email/password
    """
    data = request.data
    email = data.get('email', '').lower().strip()
    password = data.get('password')
    
    if not email or not password:
        return Response({'error': 'Email and password are required'}, status=400)
    
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'error': 'Invalid email or password'}, status=401)
    
    # Authenticate with username (Django default uses username)
    user = authenticate(username=user.username, password=password)
    
    if user is None:
        return Response({'error': 'Invalid email or password'}, status=401)
    
    # Get or create token
    token, _ = Token.objects.get_or_create(user=user)
    
    profile = user.profile
    
    return Response({
        'token': token.key,
        'user': {
            'id': user.id,
            'email': user.email,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'profile': {
                'role': profile.role,
                'is_premium': profile.is_premium,
                'avatar_url': profile.avatar_url if hasattr(profile, 'avatar_url') else None,
            }
        }
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    """
    Logout - delete auth token
    """
    try:
        request.user.auth_token.delete()
        return Response({'status': 'logged out successfully'})
    except:
        return Response({'status': 'logged out'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    """
    Get current user profile
    """
    user = request.user
    profile = user.profile
    
    return Response({
        'id': user.id,
        'email': user.email,
        'username': user.username,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'profile': {
            'role': profile.role,
            'is_premium': profile.is_premium,
            'avatar_url': profile.avatar_url if hasattr(profile, 'avatar_url') else None,
        }
    })

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """
    Update user profile
    """
    user = request.user
    profile = user.profile
    data = request.data
    
    # Update user fields
    if 'first_name' in data:
        user.first_name = data['first_name']
    if 'last_name' in data:
        user.last_name = data['last_name']
    user.save()
    
    # Update profile fields
    if 'role' in data and data['role'] in ['trainer', 'learner']:
        profile.role = data['role']
    profile.save()
    
    return Response({
        'id': user.id,
        'email': user.email,
        'username': user.username,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'profile': {
            'role': profile.role,
            'is_premium': profile.is_premium,
            'avatar_url': profile.avatar_url if hasattr(profile, 'avatar_url') else None,
        }
    })

# Keep old google_auth for backward compatibility (returns error)
@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    """
    Deprecated - Google Auth replaced with custom auth
    Use /api/register/ or /api/login/ instead
    """
    return Response({
        'error': 'Google Auth is disabled. Please use email/password login.',
        'login_url': '/api/login/',
        'register_url': '/api/register/'
    }, status=400)


from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import VoicePanel, PanelMember
from .serializers import VoicePanelSerializer, PanelMemberSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_panel(request):
    """Only trainers can create panels"""
    user = request.user
    profile = user.profile
    
    if profile.role != 'trainer':
        return Response({'error': 'Only trainers can create panels'}, status=403)
    
    # Check if trainer already has 10 active panels
    active_panels = VoicePanel.objects.filter(host=user, is_active=True).count()
    if active_panels >= 10:
        return Response({'error': 'Maximum 10 active panels allowed'}, status=400)
    
    data = request.data
    panel = VoicePanel.objects.create(
        title=data.get('title'),
        topic=data.get('topic', 'general'),
        host=user,
        max_members=data.get('max_members', 4)
    )
    
    # Add host as co-host
    PanelMember.objects.create(
        panel=panel,
        user=user,
        role='co_host'
    )
    
    return Response({
        'id': str(panel.id),
        'title': panel.title,
        'topic': panel.topic,
        'host': panel.host.username,
        'max_members': panel.max_members,
        'message': 'Panel created successfully'
    }, status=201)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_panels(request):
    """List all active panels"""
    panels = VoicePanel.objects.filter(is_active=True).select_related('host')
    data = []
    for panel in panels:
        member_count = panel.members.count()
        data.append({
            'id': str(panel.id),
            'title': panel.title,
            'topic': panel.topic,
            'host': panel.host.username,
            'host_id': panel.host.id,
            'member_count': member_count,
            'max_members': panel.max_members,
            'created_at': panel.created_at,
        })
    return Response(data)
# ── 4. backend/livevc/views.py — fix join_panel to return host_peer_id ────────
# Find your existing join_panel view and make sure the return includes peer_id:
#
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_panel(request, panel_id):
    panel = get_object_or_404(VoicePanel, id=panel_id, is_active=True)
    user = request.user

    if PanelMember.objects.filter(panel=panel, user=user).exists():
        return Response({'error': 'Already a member'}, status=400)
    if panel.members.count() >= panel.max_members:
        return Response({'error': 'Panel is full'}, status=400)

    PanelMember.objects.create(panel=panel, user=user, role='listener')

    return Response({
        'panel_id':     str(panel.id),
        'title':        panel.title,
        'host_peer_id': panel.peer_id,    #← THIS LINE IS CRITICAL
        'host_name':    panel.host.username,
    })

# Make sure panel.peer_id is returned as host_peer_id.
# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def join_panel(request, panel_id):
#     """Join a voice panel"""
#     panel = get_object_or_404(VoicePanel, id=panel_id, is_active=True)
#     user = request.user
    
#     # Check if already member
#     if PanelMember.objects.filter(panel=panel, user=user).exists():
#         return Response({'error': 'Already a member of this panel'}, status=400)
    
#     # Check if panel is full
#     if panel.members.count() >= panel.max_members:
#         return Response({'error': 'Panel is full'}, status=400)
    
#     # Add as listener initially
#     member = PanelMember.objects.create(
#         panel=panel,
#         user=user,
#         role='listener'
#     )
    
#     return Response({
#         'message': 'Joined panel successfully',
#         'panel_id': str(panel.id),
#         'role': 'listener'
#     })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def leave_panel(request, panel_id):
    """Leave a voice panel"""
    panel = get_object_or_404(VoicePanel, id=panel_id)
    user = request.user
    
    PanelMember.objects.filter(panel=panel, user=user).delete()
    
    # If host leaves, close the panel
    if panel.host == user:
        panel.is_active = False
        panel.save()
        return Response({'message': 'Panel closed as host left'})
    
    return Response({'message': 'Left panel successfully'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_panel_members(request, panel_id):
    """Get all members of a panel"""
    panel = get_object_or_404(VoicePanel, id=panel_id)
    members = panel.members.select_related('user').all()
    
    data = []
    for member in members:
        data.append({
            'id': member.user.id,
            'username': member.user.username,
            'first_name': member.user.first_name,
            'last_name': member.user.last_name,
            'role': member.role,
            'is_muted': member.is_muted,
            'is_hand_raised': member.is_hand_raised,
        })
    
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def raise_hand(request, panel_id):
    """Raise hand to speak"""
    panel = get_object_or_404(VoicePanel, id=panel_id)
    user = request.user
    
    member = get_object_or_404(PanelMember, panel=panel, user=user)
    member.is_hand_raised = True
    member.save()
    
    return Response({'message': 'Hand raised'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def lower_hand(request, panel_id):
    """Lower hand"""
    panel = get_object_or_404(VoicePanel, id=panel_id)
    user = request.user
    
    member = get_object_or_404(PanelMember, panel=panel, user=user)
    member.is_hand_raised = False
    member.save()
    
    return Response({'message': 'Hand lowered'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mute_all(request, panel_id):
    """Host/Co-host can mute all"""
    panel = get_object_or_404(VoicePanel, id=panel_id)
    user = request.user
    
    member = get_object_or_404(PanelMember, panel=panel, user=user)
    if member.role not in ['host', 'co_host']:
        return Response({'error': 'Only hosts can mute all'}, status=403)
    
    PanelMember.objects.filter(panel=panel).exclude(user=user).update(is_muted=True)
    
    return Response({'message': 'All users muted'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def promote_member(request, panel_id, user_id):
    """Promote listener to speaker"""
    panel = get_object_or_404(VoicePanel, id=panel_id)
    host = request.user
    
    host_member = get_object_or_404(PanelMember, panel=panel, user=host)
    if host_member.role not in ['host', 'co_host']:
        return Response({'error': 'Only hosts can promote members'}, status=403)
    
    target_member = get_object_or_404(PanelMember, panel=panel, user_id=user_id)
    target_member.role = 'speaker'
    target_member.is_hand_raised = False
    target_member.save()
    
    return Response({'message': 'Member promoted to speaker'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def kick_member(request, panel_id, user_id):
    """Kick a member from panel"""
    panel = get_object_or_404(VoicePanel, id=panel_id)
    host = request.user
    
    host_member = get_object_or_404(PanelMember, panel=panel, user=host)
    if host_member.role not in ['host', 'co_host']:
        return Response({'error': 'Only hosts can kick members'}, status=403)
    
    PanelMember.objects.filter(panel=panel, user_id=user_id).delete()
    
    return Response({'message': 'Member kicked from panel'})

# Add these placeholder views for URL compatibility
@api_view(['GET'])
def voice_rooms(request):
    return Response({'message': 'Use /api/panels/ for voice panels'})

@api_view(['POST'])
def join_room(request, room_id):
    return Response({'message': 'Use /api/panels/<id>/join/ instead'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_panel_peer(request, panel_id):
    # \"\"\"
    # Called by host immediately after PeerJS connection opens.
    # Stores the host's PeerJS peer_id so joining users can connect.
    # \"\"\"
    try:
        panel = VoicePanel.objects.get(id=panel_id, host=request.user)
    except VoicePanel.DoesNotExist:
        return Response({'error': 'Panel not found or not host'}, status=404)

    peer_id = request.data.get('peer_id', '')
    if peer_id:
        panel.peer_id = peer_id
        panel.save(update_fields=['peer_id'])

    return Response({'status': 'ok', 'peer_id': panel.peer_id})
