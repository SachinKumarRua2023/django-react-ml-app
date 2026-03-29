import requests
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.db.models import Max, Avg
from django.utils import timezone

from .models import Employee, User, MemoryGameScore, Achievement
from .serializers import (
    EmployeeSerializer, UserSerializer, MemoryGameScoreSerializer,
    AchievementSerializer, GoogleAuthSerializer, ScoreSubmitSerializer
)


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [AllowAny]


@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    """
    Handle Google OAuth authentication
    """
    serializer = GoogleAuthSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data
    token = data['token']
    email = data['email']
    name = data['name']
    google_id = data['google_id']
    picture = data.get('picture', '')

    # Verify token with Google (optional but recommended)
    try:
        response = requests.get(
            f'https://oauth2.googleapis.com/tokeninfo?id_token={token}',
            timeout=5
        )
        if response.status_code != 200:
            return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
        
        token_info = response.json()
        if token_info.get('email') != email:
            return Response({'error': 'Email mismatch'}, status=status.HTTP_401_UNAUTHORIZED)
    except requests.RequestException:
        # If Google verification fails, we'll still proceed with the provided data
        # In production, you might want to handle this differently
        pass

    # Get or create user
    try:
        user = User.objects.get(google_id=google_id)
        # Update last login
        user.last_login_at = timezone.now()
        user.save()
    except User.DoesNotExist:
        try:
            # Check if user exists with this email
            user = User.objects.get(email=email)
            user.google_id = google_id
            user.is_google_user = True
            user.profile_picture = picture
            user.last_login_at = timezone.now()
            user.save()
        except User.DoesNotExist:
            # Create new user
            username = email.split('@')[0]
            base_username = username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            
            user = User.objects.create(
                username=username,
                email=email,
                first_name=name.split()[0] if name else '',
                last_name=' '.join(name.split()[1:]) if len(name.split()) > 1 else '',
                google_id=google_id,
                profile_picture=picture,
                is_google_user=True,
                last_login_at=timezone.now()
            )

    # Get or create token
    token, _ = Token.objects.get_or_create(user=user)

    return Response({
        'token': token.key,
        'user': UserSerializer(user).data,
        'message': 'Login successful'
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_score(request):
    """
    Submit a memory game score
    """
    serializer = ScoreSubmitSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data
    user = request.user

    # Check if this is a personal best for this difficulty
    previous_best = MemoryGameScore.objects.filter(
        user=user,
        difficulty=data['difficulty']
    ).aggregate(Max('score'))['score__max'] or 0

    is_personal_best = data['score'] > previous_best

    # Save the score
    score = MemoryGameScore.objects.create(
        user=user,
        difficulty=data['difficulty'],
        score=data['score'],
        total_items=data['total_items'],
        time_taken=data['time_taken'],
        accuracy=data['accuracy'],
        is_personal_best=is_personal_best
    )

    # Check for achievements
    new_achievements = check_and_award_achievements(user, data['difficulty'], data['score'], is_personal_best)

    return Response({
        'score': MemoryGameScoreSerializer(score).data,
        'is_personal_best': is_personal_best,
        'new_achievements': AchievementSerializer(new_achievements, many=True).data,
        'previous_best': previous_best
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_scores(request):
    """
    Get all scores for the current user
    """
    user = request.user
    scores = MemoryGameScore.objects.filter(user=user)
    
    # Get best scores for each difficulty
    best_scores = {}
    for diff in ['20x', '50x', '100x', '200x']:
        best = scores.filter(difficulty=diff).order_by('-score', 'time_taken').first()
        if best:
            best_scores[diff] = MemoryGameScoreSerializer(best).data

    return Response({
        'all_scores': MemoryGameScoreSerializer(scores.order_by('-played_at')[:50], many=True).data,
        'personal_bests': best_scores,
        'total_games_played': scores.count()
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def get_leaderboard(request):
    """
    Get global leaderboard
    """
    difficulty = request.query_params.get('difficulty', None)
    limit = int(request.query_params.get('limit', 10))

    scores = MemoryGameScore.objects.all()
    
    if difficulty:
        scores = scores.filter(difficulty=difficulty)
    
    # Get best score per user per difficulty
    scores = scores.order_by('-score', 'time_taken')[:limit]

    return Response({
        'leaderboard': MemoryGameScoreSerializer(scores, many=True).data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_achievements(request):
    """
    Get all achievements for the current user
    """
    user = request.user
    achievements = Achievement.objects.filter(user=user)
    return Response({
        'achievements': AchievementSerializer(achievements, many=True).data,
        'total_achievements': achievements.count()
    })


def check_and_award_achievements(user, difficulty, score, is_personal_best):
    """
    Check and award achievements based on score
    """
    new_achievements = []

    # Achievement definitions
    achievement_criteria = {
        'beginner': {'difficulty': '20x', 'min_score': 15},
        'intermediate': {'difficulty': '50x', 'min_score': 40},
        'advanced': {'difficulty': '100x', 'min_score': 80},
        'expert': {'difficulty': '200x', 'min_score': 150},
    }

    for achievement_type, criteria in achievement_criteria.items():
        if difficulty == criteria['difficulty'] and score >= criteria['min_score']:
            achievement, created = Achievement.objects.get_or_create(
                user=user,
                achievement_type=achievement_type,
                defaults={
                    'title': f'{achievement_type.capitalize()} Master',
                    'description': f'Completed {criteria["difficulty"]} mode with {score} items!'
                }
            )
            if created:
                new_achievements.append(achievement)
                # Send achievement email
                send_achievement_email(user, achievement)

    # Master achievement - complete all difficulties with high scores
    if difficulty == '200x' and score >= 180:
        master_achievement, created = Achievement.objects.get_or_create(
            user=user,
            achievement_type='master',
            defaults={
                'title': 'Memory Master',
                'description': 'Incredible! You achieved 180+ items in Expert mode!'
            }
        )
        if created:
            new_achievements.append(master_achievement)
            send_achievement_email(user, master_achievement)

    return new_achievements


def send_achievement_email(user, achievement):
    """
    Send achievement notification email
    """
    if not settings.EMAIL_HOST_USER:
        return

    subject = f"Congratulations! You've unlocked: {achievement.title}"
    
    html_message = f"""
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #7c3aed; margin: 0;">SeekhoWithRua</h1>
                <p style="color: #666; margin: 5px 0;">Memory Training Achievement</p>
            </div>
            
            <div style="text-align: center; background: linear-gradient(135deg, #7c3aed, #00d4ff); padding: 30px; border-radius: 10px; color: white; margin-bottom: 30px;">
                <div style="font-size: 60px; margin-bottom: 10px;">🏆</div>
                <h2 style="margin: 0; font-size: 28px;">{achievement.title}</h2>
                <p style="margin: 10px 0; font-size: 16px;">Unlocked on {achievement.unlocked_at.strftime('%B %d, %Y')}</p>
            </div>
            
            <div style="margin-bottom: 30px;">
                <p style="font-size: 16px; color: #333; line-height: 1.6;">
                    Hi <strong>{user.first_name or user.username}</strong>,
                </p>
                <p style="font-size: 16px; color: #333; line-height: 1.6;">
                    {achievement.description}
                </p>
                <p style="font-size: 16px; color: #333; line-height: 1.6;">
                    Keep training your brain and unlocking more achievements!
                </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <a href="https://gaming.seekhowithrua.com" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #00d4ff); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                    Continue Training
                </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px;">
                <p>You're receiving this because you achieved a milestone in Memory Training Game.</p>
                <p>© 2026 SeekhoWithRua. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    plain_message = strip_tags(html_message)
    
    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=True
        )
        achievement.email_sent = True
        achievement.save()
    except Exception as e:
        print(f"Failed to send achievement email: {e}")


@api_view(['POST'])
@permission_classes([AllowAny])
def send_test_email(request):
    """
    Test email configuration
    """
    if not settings.EMAIL_HOST_USER:
        return Response({'error': 'Email not configured'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    try:
        send_mail(
            subject='Test Email from SeekhoWithRua',
            message='This is a test email to verify the email configuration is working.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[request.data.get('email', settings.EMAIL_HOST_USER)],
            fail_silently=False
        )
        return Response({'message': 'Test email sent successfully'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
