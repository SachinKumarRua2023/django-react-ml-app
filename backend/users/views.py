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

from .models import Employee, User, MemoryGameScore, Achievement, GamingScore, QuizResult, VCRSession, CourseProgress, StudentAnalytics
from .serializers import (
    EmployeeSerializer, UserSerializer, MemoryGameScoreSerializer,
    AchievementSerializer, GoogleAuthSerializer, ScoreSubmitSerializer,
    GamingScoreSerializer, GamingScoreSubmitSerializer,
    QuizResultSerializer, QuizSubmitSerializer,
    VCRSessionSerializer, CourseProgressSerializer, StudentAnalyticsSerializer
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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_gaming_score(request):
    """
    Submit gaming score for any game type
    """
    serializer = GamingScoreSubmitSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data
    user = request.user

    # Check if this is a personal best for this game
    previous_best = GamingScore.objects.filter(
        user=user,
        game_name=data['game_name'],
        game_subtype=data.get('game_subtype', '')
    ).aggregate(Max('score'))['score__max'] or 0

    is_personal_best = data['score'] > previous_best

    # Save the score
    score = GamingScore.objects.create(
        user=user,
        game_name=data['game_name'],
        game_subtype=data.get('game_subtype', ''),
        score=data['score'],
        level=data['level'],
        time_taken=data['time_taken'],
        accuracy=data['accuracy'],
        metadata=data.get('metadata', {}),
        is_personal_best=is_personal_best
    )

    # Update student analytics
    update_student_analytics(user)

    return Response({
        'score': GamingScoreSerializer(score).data,
        'is_personal_best': is_personal_best,
        'previous_best': previous_best
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_gaming_scores(request):
    """
    Get user's gaming scores
    """
    user = request.user
    game_name = request.query_params.get('game_name', None)
    
    scores = GamingScore.objects.filter(user=user)
    if game_name:
        scores = scores.filter(game_name=game_name)
    
    return Response({
        'scores': GamingScoreSerializer(scores.order_by('-played_at')[:50], many=True).data,
        'total_games_played': scores.count()
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_quiz_result(request):
    """
    Submit quiz result
    """
    serializer = QuizSubmitSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data
    user = request.user

    # Save quiz result
    result = QuizResult.objects.create(
        user=user,
        quiz_name=data['quiz_name'],
        course_name=data.get('course_name', ''),
        score=data['score'],
        total_questions=data['total_questions'],
        correct_answers=data['correct_answers'],
        time_taken=data['time_taken'],
        answers=data['answers'],
        passed=data['passed']
    )

    # Update student analytics
    update_student_analytics(user)

    return Response({
        'result': QuizResultSerializer(result).data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_quiz_results(request):
    """
    Get user's quiz results
    """
    user = request.user
    results = QuizResult.objects.filter(user=user).order_by('-completed_at')
    
    return Response({
        'results': QuizResultSerializer(results[:50], many=True).data,
        'total_quizzes': results.count(),
        'passed_quizzes': results.filter(passed=True).count()
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_student_analytics(request):
    """
    Get student's own analytics
    """
    user = request.user
    
    # Get or create analytics
    analytics, created = StudentAnalytics.objects.get_or_create(
        user=user,
        defaults={
            'total_games_played': 0,
            'total_gaming_time': 0,
            'courses_enrolled': 0,
            'courses_completed': 0,
            'quizzes_taken': 0,
            'quizzes_passed': 0,
            'average_quiz_score': 0,
            'total_points': 0
        }
    )
    
    # Recalculate latest stats
    update_student_analytics(user)
    analytics.refresh_from_db()
    
    return Response({
        'analytics': StudentAnalyticsSerializer(analytics).data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_trainer_dashboard(request):
    """
    Get trainer dashboard data - all students' progress
    """
    user = request.user
    
    # Check if user is trainer
    if not hasattr(user, 'profile') or user.profile.role != 'trainer':
        return Response({'error': 'Only trainers can access this endpoint'}, status=status.HTTP_403_FORBIDDEN)
    
    # Get all students
    all_students = StudentAnalytics.objects.select_related('user').all()
    
    # Aggregate stats
    total_students = User.objects.count()
    total_courses = CourseProgress.objects.values('course_id').distinct().count()
    avg_completion = all_students.aggregate(Avg('courses_completed'))['courses_completed__avg'] or 0
    
    return Response({
        'total_students': total_students,
        'total_courses': total_courses,
        'average_completion': round(avg_completion, 2),
        'students': StudentAnalyticsSerializer(all_students, many=True).data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_student_report(request, student_id):
    """
    Get detailed report for a specific student (trainer only)
    """
    user = request.user
    
    # Check if user is trainer
    if not hasattr(user, 'profile') or user.profile.role != 'trainer':
        return Response({'error': 'Only trainers can access this endpoint'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        student = User.objects.get(id=student_id)
    except User.DoesNotExist:
        return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Get all data for this student
    gaming_scores = GamingScore.objects.filter(user=student).order_by('-played_at')[:20]
    quiz_results = QuizResult.objects.filter(user=student).order_by('-completed_at')[:20]
    course_progress = CourseProgress.objects.filter(user=student).order_by('-last_watched')[:20]
    
    # Update and get analytics
    update_student_analytics(student)
    analytics = StudentAnalytics.objects.get(user=student)
    
    return Response({
        'student': UserSerializer(student).data,
        'analytics': StudentAnalyticsSerializer(analytics).data,
        'gaming_scores': GamingScoreSerializer(gaming_scores, many=True).data,
        'quiz_results': QuizResultSerializer(quiz_results, many=True).data,
        'course_progress': CourseProgressSerializer(course_progress, many=True).data
    })


def update_student_analytics(user):
    """
    Update student analytics aggregations
    """
    analytics, created = StudentAnalytics.objects.get_or_create(user=user)
    
    # Gaming stats
    gaming_scores = GamingScore.objects.filter(user=user)
    analytics.total_games_played = gaming_scores.count()
    analytics.total_gaming_time = gaming_scores.aggregate(total_time=models.Sum('time_taken'))['total_time__sum'] or 0
    analytics.highest_game_score = gaming_scores.aggregate(max_score=Max('score'))['max_score__max'] or 0
    
    # Course stats
    course_progress = CourseProgress.objects.filter(user=user)
    analytics.courses_enrolled = course_progress.count()
    analytics.courses_completed = course_progress.filter(completed=True).count()
    analytics.total_learning_time = course_progress.aggregate(total_time=models.Sum('watch_time'))['total_time__sum'] or 0
    
    # Quiz stats
    quiz_results = QuizResult.objects.filter(user=user)
    analytics.quizzes_taken = quiz_results.count()
    analytics.quizzes_passed = quiz_results.filter(passed=True).count()
    avg_score = quiz_results.aggregate(avg=Avg('score'))['avg__avg']
    analytics.average_quiz_score = round(avg_score, 2) if avg_score else 0
    
    # Calculate total points
    analytics.total_points = (
        analytics.total_games_played * 10 +
        analytics.courses_completed * 100 +
        analytics.quizzes_passed * 50 +
        analytics.highest_game_score
    )
    
    analytics.save()



def check_and_award_achievements(user, difficulty=None, score=None, is_personal_best=False, game_name=None):
    """
    Check and award achievements based on various criteria
    """
    new_achievements = []
    
    # Achievement definitions with criteria
    achievement_definitions = {
        'beginner': {'title': '🎮 Beginner Gamer', 'description': 'Play your first game', 'points': 10},
        'intermediate': {'title': '🏆 Intermediate Player', 'description': 'Score 50+ points in any game', 'points': 25},
        'advanced': {'title': '🌟 Advanced Player', 'description': 'Score 100+ points in any game', 'points': 50},
        'expert': {'title': '👑 Expert Player', 'description': 'Score 200+ points in any game', 'points': 100},
        'memory_master': {'title': '🧠 Memory Master', 'description': 'Complete memory game on hardest difficulty', 'points': 75},
        'streak_holder': {'title': '🔥 Streak Holder', 'description': 'Get 10+ correct answers in a row', 'points': 30},
        'quiz_master': {'title': '📝 Quiz Master', 'description': 'Score 100% on any quiz', 'points': 50},
        'course_complete': {'title': '📚 Course Completer', 'description': 'Complete your first course', 'points': 100},
        'gaming_pro': {'title': '🎮 Gaming Pro', 'description': 'Play 50+ games', 'points': 200},
    }
    
    # Check gaming achievements
    total_games = GamingScore.objects.filter(user=user).count()
    
    # First game achievement
    if total_games >= 1:
        achievement, created = Achievement.objects.get_or_create(
            user=user,
            achievement_type='beginner',
            defaults={
                'title': achievement_definitions['beginner']['title'],
                'description': achievement_definitions['beginner']['description']
            }
        )
        if created:
            new_achievements.append(achievement)
    
    # Score-based achievements
    if score:
        if score >= 50:
            achievement, created = Achievement.objects.get_or_create(
                user=user,
                achievement_type='intermediate',
                defaults={
                    'title': achievement_definitions['intermediate']['title'],
                    'description': achievement_definitions['intermediate']['description']
                }
            )
            if created:
                new_achievements.append(achievement)
        
        if score >= 100:
            achievement, created = Achievement.objects.get_or_create(
                user=user,
                achievement_type='advanced',
                defaults={
                    'title': achievement_definitions['advanced']['title'],
                    'description': achievement_definitions['advanced']['description']
                }
            )
            if created:
                new_achievements.append(achievement)
        
        if score >= 200:
            achievement, created = Achievement.objects.get_or_create(
                user=user,
                achievement_type='expert',
                defaults={
                    'title': achievement_definitions['expert']['title'],
                    'description': achievement_definitions['expert']['description']
                }
            )
            if created:
                new_achievements.append(achievement)
    
    # 50+ games achievement
    if total_games >= 50:
        achievement, created = Achievement.objects.get_or_create(
            user=user,
            achievement_type='gaming_pro',
            defaults={
                'title': achievement_definitions['gaming_pro']['title'],
                'description': achievement_definitions['gaming_pro']['description']
            }
        )
        if created:
            new_achievements.append(achievement)
    
    # Send email notifications for new achievements
    for achievement in new_achievements:
        send_achievement_email(user, achievement)
    
    return new_achievements


def send_achievement_email(user, achievement):
    """
    Send email notification for unlocked achievement
    """
    try:
        subject = f"🏆 Achievement Unlocked: {achievement.title}"
        
        # HTML email template
        html_message = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #fff;">
            <div style="text-align: center; padding: 30px;">
                <h1 style="color: #ffd700; font-size: 2em; margin-bottom: 10px;">🏆 Achievement Unlocked!</h1>
                <p style="color: #a0a0a0; font-size: 1.1em;">Congratulations on your amazing progress!</p>
            </div>
            
            <div style="background: rgba(255,255,255,0.1); border-radius: 15px; padding: 30px; margin: 20px 0; border: 1px solid rgba(255,215,0,0.3);">
                <h2 style="color: #ffd700; font-size: 1.8em; margin: 0 0 15px 0; text-align: center;">{achievement.title}</h2>
                <p style="font-size: 1.2em; text-align: center; color: #e0e0e0; margin: 0;">{achievement.description}</p>
                <p style="text-align: center; color: #888; font-size: 0.9em; margin-top: 15px;">
                    Unlocked on {achievement.unlocked_at.strftime('%B %d, %Y at %I:%M %p')}
                </p>
            </div>
            
            <div style="text-align: center; padding: 20px;">
                <p style="color: #a0a0a0; margin-bottom: 20px;">Keep up the great work and unlock more achievements!</p>
                <a href="https://lms.seekhowithrua.com" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 25px; 
                          font-weight: bold; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                    Continue Learning →
                </a>
            </div>
            
            <div style="text-align: center; padding-top: 30px; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 30px;">
                <p style="color: #666; font-size: 0.85em;">© 2026 SeekhoWithRua. Built by Master Rua.</p>
            </div>
        </div>
        """
        
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        
        # Mark email as sent
        achievement.email_sent = True
        achievement.save()
        
        return True
    except Exception as e:
        print(f"Failed to send achievement email: {e}")
        return False
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


# In-memory OTP storage (use Redis in production)
_password_reset_otps = {}


@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset(request):
    """
    Send OTP to user's email for password reset
    """
    email = request.data.get('email', '').lower().strip()
    
    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        # Don't reveal if email exists or not (security)
        return Response({'message': 'If the email exists, an OTP has been sent'})
    
    # Generate 6-digit OTP
    import random
    otp = str(random.randint(100000, 999999))
    
    # Store OTP with expiry (10 minutes)
    _password_reset_otps[email] = {
        'otp': otp,
        'expires_at': timezone.now() + timezone.timedelta(minutes=10),
        'attempts': 0
    }
    
    # Send OTP email
    try:
        html_message = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
            <div style="background: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h2 style="color: #7c3aed; margin-bottom: 20px;">Password Reset Request</h2>
                <p style="color: #333; font-size: 16px;">Hello {user.first_name or user.username},</p>
                <p style="color: #555; font-size: 14px; line-height: 1.6;">
                    You requested to reset your password. Use the OTP below to proceed:
                </p>
                <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                    <span style="font-size: 32px; font-weight: bold; color: #7c3aed; letter-spacing: 8px;">{otp}</span>
                </div>
                <p style="color: #888; font-size: 12px;">
                    This OTP will expire in 10 minutes.<br>
                    If you didn't request this, please ignore this email.
                </p>
            </div>
        </div>
        """
        
        send_mail(
            subject='Password Reset OTP - SeekhoWithRua',
            message=f'Your OTP for password reset is: {otp}. Valid for 10 minutes.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            html_message=html_message,
            fail_silently=False
        )
        
        return Response({'message': 'OTP sent to your email'})
        
    except Exception as e:
        # Remove OTP if email fails
        _password_reset_otps.pop(email, None)
        return Response({'error': 'Failed to send email. Please try again.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp_and_reset_password(request):
    """
    Verify OTP and reset password
    """
    email = request.data.get('email', '').lower().strip()
    otp = request.data.get('otp', '').strip()
    new_password = request.data.get('new_password', '')
    
    if not email or not otp or not new_password:
        return Response({'error': 'Email, OTP and new password are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    if len(new_password) < 8:
        return Response({'error': 'Password must be at least 8 characters'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check OTP
    otp_data = _password_reset_otps.get(email)
    
    if not otp_data:
        return Response({'error': 'OTP expired or invalid. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check expiry
    if timezone.now() > otp_data['expires_at']:
        _password_reset_otps.pop(email, None)
        return Response({'error': 'OTP expired. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check attempts
    if otp_data['attempts'] >= 3:
        _password_reset_otps.pop(email, None)
        return Response({'error': 'Too many failed attempts. Please request a new OTP.'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Verify OTP
    if otp != otp_data['otp']:
        otp_data['attempts'] += 1
        remaining = 3 - otp_data['attempts']
        return Response({'error': f'Invalid OTP. {remaining} attempts remaining.'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Reset password
    try:
        user = User.objects.get(email=email)
        user.set_password(new_password)
        user.save()
        
        # Clear OTP
        _password_reset_otps.pop(email, None)
        
        # Generate new token
        token, _ = Token.objects.get_or_create(user=user)
        
        return Response({
            'message': 'Password reset successful',
            'token': token.key,
            'user': UserSerializer(user).data
        })
        
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([AllowAny])
def user_login(request):
    """
    Login with email and password
    """
    email = request.data.get('email', '').lower().strip()
    password = request.data.get('password', '')
    
    if not email or not password:
        return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Authenticate user
    user = authenticate(request, username=email, password=password)
    
    if not user:
        # Try to find user by email and check password manually
        try:
            user = User.objects.get(email=email)
            if not user.check_password(password):
                return Response({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)
    
    # Generate token
    token, _ = Token.objects.get_or_create(user=user)
    
    return Response({
        'token': token.key,
        'user': UserSerializer(user).data,
        'message': 'Login successful'
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def user_register(request):
    """
    Register new user with email and password
    """
    email = request.data.get('email', '').lower().strip()
    password = request.data.get('password', '')
    confirm_password = request.data.get('confirm_password', '')
    first_name = request.data.get('first_name', '').strip()
    last_name = request.data.get('last_name', '').strip()
    role = request.data.get('role', 'learner')
    
    # Validation
    if not email or not password:
        return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    if password != confirm_password:
        return Response({'error': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)
    
    if len(password) < 8:
        return Response({'error': 'Password must be at least 8 characters'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if email already exists
    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)
    
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
    
    # Set role in profile if exists
    if hasattr(user, 'profile'):
        user.profile.role = role
        user.profile.save()
    
    # Generate token
    token, _ = Token.objects.get_or_create(user=user)
    
    return Response({
        'token': token.key,
        'user': UserSerializer(user).data,
        'message': 'Registration successful'
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def user_logout(request):
    """
    Logout user and delete auth token
    """
    try:
        # Delete the user's token
        Token.objects.filter(user=request.user).delete()
        return Response({'message': 'Logout successful'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """
    Update user profile (name, password, profile picture)
    """
    user = request.user
    data = request.data
    
    # Update name fields
    if 'first_name' in data:
        user.first_name = data['first_name'].strip()
    if 'last_name' in data:
        user.last_name = data['last_name'].strip()
    
    # Update password if provided
    if 'password' in data and data['password']:
        if len(data['password']) < 8:
            return Response({'error': 'Password must be at least 8 characters'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(data['password'])
    
    # Update profile picture if provided
    if 'profile_picture' in data:
        user.profile_picture = data['profile_picture']
    
    # Update role if provided (admin only)
    if 'role' in data and user.is_staff:
        if hasattr(user, 'profile'):
            user.profile.role = data['role']
            user.profile.save()
    
    user.save()
    
    return Response({
        'message': 'Profile updated successfully',
        'user': UserSerializer(user).data
    })
