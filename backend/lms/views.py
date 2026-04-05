"""
LMS API Views
"""

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Count, Sum, Q
from django.core.mail import send_mail, EmailMultiAlternatives
from datetime import timedelta, datetime

from .models import (
    Student, Course, ClassSession, Attendance,
    Test, TestResult, Payment, ReferralTracking,
    EmailLog, StudentEnrollment, Quiz, QuizQuestion,
    QuizAttempt, EmailVerification
)
from .serializers import (
    StudentSerializer, StudentCreateSerializer, CourseSerializer,
    ClassSessionSerializer, AttendanceSerializer, TestSerializer,
    TestResultSerializer, PaymentSerializer, PaymentCreateSerializer,
    ReferralTrackingSerializer, ReferralStatsSerializer, EmailLogSerializer,
    StudentEnrollmentSerializer, StudentDashboardSerializer, AdminDashboardSerializer,
    QuizSerializer, QuizQuestionAdminSerializer, QuizAttemptSerializer, 
    QuizSubmitSerializer, EmailVerificationSerializer, EnrollmentRequestSerializer
)
from .email_service import (
    send_welcome_email, send_payment_receipt_email,
    send_test_result_email, send_quiz_result_email,
    send_verification_email
)


class IsAdminUser(permissions.BasePermission):
    """Custom permission to only allow admin users"""
    def has_permission(self, request, view):
        return request.user and request.user.is_staff


class StudentViewSet(viewsets.ModelViewSet):
    """API endpoint for managing students"""
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    
    def get_permissions(self):
        if self.action in ['create']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return StudentCreateSerializer
        return StudentSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Student.objects.all()
        # Students can only see their own profile
        return Student.objects.filter(user=user)
    
    def perform_create(self, serializer):
        student = serializer.save()
        # Send welcome email
        send_welcome_email(student)
        return student
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current student's profile"""
        try:
            student = request.user.lms_student
            serializer = self.get_serializer(student)
            return Response(serializer.data)
        except Student.DoesNotExist:
            return Response(
                {'error': 'Student profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def by_referral_code(self, request):
        """Get student by referral code"""
        code = request.query_params.get('code')
        if not code:
            return Response(
                {'error': 'Referral code required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            student = Student.objects.get(referral_code=code)
            return Response({
                'code': code,
                'name': student.user.get_full_name(),
                'is_valid': True
            })
        except Student.DoesNotExist:
            return Response({
                'code': code,
                'is_valid': False
            })


class CourseViewSet(viewsets.ModelViewSet):
    """API endpoint for managing courses"""
    queryset = Course.objects.filter(is_active=True)
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdminUser()]
    
    @action(detail=True, methods=['post'])
    def enroll(self, request, pk=None):
        """Enroll current student in course"""
        course = self.get_object()
        
        try:
            student = request.user.lms_student
        except Student.DoesNotExist:
            return Response(
                {'error': 'Student profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if already enrolled
        if StudentEnrollment.objects.filter(student=student, course=course).exists():
            return Response(
                {'error': 'Already enrolled in this course'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        enrollment = StudentEnrollment.objects.create(
            student=student,
            course=course
        )
        
        return Response({
            'message': 'Successfully enrolled',
            'enrollment_id': enrollment.id
        })
    
    @action(detail=True, methods=['get'])
    def sessions(self, request, pk=None):
        """Get all class sessions for this course"""
        course = self.get_object()
        sessions = course.sessions.all()
        serializer = ClassSessionSerializer(
            sessions, 
            many=True, 
            context={'request': request}
        )
        return Response(serializer.data)


class ClassSessionViewSet(viewsets.ModelViewSet):
    """API endpoint for managing class sessions"""
    queryset = ClassSession.objects.all()
    serializer_class = ClassSessionSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsAdminUser()]
    
    def get_queryset(self):
        queryset = ClassSession.objects.all()
        
        # Filter by course
        course_id = self.request.query_params.get('course')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        
        # Filter upcoming sessions
        upcoming = self.request.query_params.get('upcoming')
        if upcoming:
            today = timezone.now().date()
            queryset = queryset.filter(date__gte=today)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def mark_attendance(self, request, pk=None):
        """Mark attendance for current student"""
        session = self.get_object()
        
        try:
            student = request.user.lms_student
        except Student.DoesNotExist:
            return Response(
                {'error': 'Student profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        status_value = request.data.get('status', 'present')
        
        attendance, created = Attendance.objects.update_or_create(
            student=student,
            class_session=session,
            date=session.date,
            defaults={
                'status': status_value,
                'marked_by': request.user
            }
        )
        
        return Response({
            'message': 'Attendance marked',
            'status': attendance.status,
            'created': created
        })
    
    @action(detail=True, methods=['get'])
    def video_url(self, request, pk=None):
        """Get YouTube video URL (checks enrollment)"""
        session = self.get_object()
        
        try:
            student = request.user.lms_student
        except Student.DoesNotExist:
            return Response(
                {'error': 'Student profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if student is enrolled
        is_enrolled = StudentEnrollment.objects.filter(
            student=student,
            course=session.course,
            is_active=True
        ).exists()
        
        if not is_enrolled and not request.user.is_staff:
            return Response(
                {'error': 'Not enrolled in this course'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if not session.youtube_video_id:
            return Response(
                {'error': 'Video not available'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        return Response({
            'video_id': session.youtube_video_id,
            'embed_url': f'https://www.youtube.com/embed/{session.youtube_video_id}',
            'title': session.title,
            'course': session.course.title
        })


class AttendanceViewSet(viewsets.ModelViewSet):
    """API endpoint for managing attendance"""
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        queryset = Attendance.objects.all()
        
        # Filter by student
        student_id = self.request.query_params.get('student')
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        
        # Filter by date
        date = self.request.query_params.get('date')
        if date:
            queryset = queryset.filter(date=date)
        
        # Filter by session
        session_id = self.request.query_params.get('session')
        if session_id:
            queryset = queryset.filter(class_session_id=session_id)
        
        return queryset
    
    @action(detail=False, methods=['post'])
    def bulk_mark(self, request):
        """Mark attendance for multiple students"""
        session_id = request.data.get('session_id')
        attendance_data = request.data.get('attendance', [])  # List of {student_id, status}
        
        if not session_id or not attendance_data:
            return Response(
                {'error': 'session_id and attendance data required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            session = ClassSession.objects.get(id=session_id)
        except ClassSession.DoesNotExist:
            return Response(
                {'error': 'Session not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        created_count = 0
        for item in attendance_data:
            Attendance.objects.update_or_create(
                student_id=item['student_id'],
                class_session=session,
                date=session.date,
                defaults={
                    'status': item['status'],
                    'marked_by': request.user
                }
            )
            created_count += 1
        
        return Response({
            'message': f'Attendance marked for {created_count} students'
        })


class TestViewSet(viewsets.ModelViewSet):
    """API endpoint for managing tests"""
    queryset = Test.objects.all()
    serializer_class = TestSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsAdminUser()]
    
    @action(detail=True, methods=['get'])
    def results(self, request, pk=None):
        """Get all results for this test"""
        test = self.get_object()
        results = test.results.all()
        serializer = TestResultSerializer(results, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def submit_marks(self, request, pk=None):
        """Submit marks for students (admin only)"""
        test = self.get_object()
        marks_data = request.data.get('marks', [])  # List of {student_id, marks, remarks}
        
        created_results = []
        for item in marks_data:
            result, created = TestResult.objects.update_or_create(
                test=test,
                student_id=item['student_id'],
                defaults={
                    'marks_obtained': item['marks'],
                    'remarks': item.get('remarks', '')
                }
            )
            created_results.append({
                'student_id': item['student_id'],
                'marks': item['marks'],
                'created': created
            })
            
            # Send email notification
            send_test_result_email(result)
        
        # Calculate ranks
        self._calculate_ranks(test)
        
        return Response({
            'message': f'Marks submitted for {len(created_results)} students',
            'results': created_results
        })
    
    def _calculate_ranks(self, test):
        """Calculate ranks for all results of a test"""
        results = TestResult.objects.filter(test=test).order_by('-marks_obtained')
        for rank, result in enumerate(results, 1):
            result.rank = rank
            result.save(update_fields=['rank'])


class PaymentViewSet(viewsets.ModelViewSet):
    """API endpoint for managing payments"""
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    
    def get_permissions(self):
        if self.action in ['create']:
            return [permissions.IsAuthenticated()]
        elif self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsAdminUser()]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return PaymentCreateSerializer
        return PaymentSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Payment.objects.all()
        # Students can only see their own payments
        return Payment.objects.filter(student__user=user)
    
    def perform_create(self, serializer):
        payment = serializer.save()
        # Set due date same as for_month for monthly fees
        if payment.payment_type == 'monthly_fee':
            payment.due_date = payment.for_month
            payment.save()
        return payment
    
    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """Verify payment (admin only)"""
        payment = self.get_object()
        
        if payment.status == 'completed':
            return Response(
                {'error': 'Payment already verified'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        payment.verify(request.user)
        
        # Send receipt email
        send_payment_receipt_email(payment)
        
        return Response({
            'message': 'Payment verified successfully',
            'receipt_number': payment.receipt_number
        })
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get all pending payments (admin only)"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        pending = Payment.objects.filter(status='pending')
        serializer = self.get_serializer(pending, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_payments(self, request):
        """Get current student's payments"""
        try:
            student = request.user.lms_student
        except Student.DoesNotExist:
            return Response(
                {'error': 'Student profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        payments = Payment.objects.filter(student=student).order_by('-payment_date')
        serializer = self.get_serializer(payments, many=True)
        return Response(serializer.data)


class ReferralViewSet(viewsets.ViewSet):
    """API endpoint for referral management"""
    permission_classes = [permissions.IsAuthenticated]
    
    def list(self, request):
        """Get current student's referrals"""
        try:
            student = request.user.lms_student
        except Student.DoesNotExist:
            return Response(
                {'error': 'Student profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        referrals = ReferralTracking.objects.filter(referrer=student)
        serializer = ReferralTrackingSerializer(referrals, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get referral statistics"""
        try:
            student = request.user.lms_student
        except Student.DoesNotExist:
            return Response(
                {'error': 'Student profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        total_referrals = ReferralTracking.objects.filter(referrer=student).count()
        active_referrals = ReferralTracking.objects.filter(
            referrer=student, 
            status='paid'
        ).count()
        pending_referrals = ReferralTracking.objects.filter(
            referrer=student, 
            status='pending'
        ).count()
        
        # Calculate next milestone
        if active_referrals < 5:
            next_milestone = 5
            referrals_to_next = 5 - active_referrals
        elif active_referrals < 10:
            next_milestone = 10
            referrals_to_next = 10 - active_referrals
        else:
            next_milestone = active_referrals + 5
            referrals_to_next = 5
        
        data = {
            'total_referrals': total_referrals,
            'active_referrals': active_referrals,
            'pending_referrals': pending_referrals,
            'current_fee': student.current_monthly_fee,
            'total_discount': student.total_referral_discount,
            'total_earnings': student.total_earnings,
            'next_milestone': next_milestone,
            'referrals_to_next_milestone': referrals_to_next,
        }
        
        serializer = ReferralStatsSerializer(data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def apply_code(self, request):
        """Apply referral code during registration"""
        code = request.data.get('referral_code')
        
        if not code:
            return Response(
                {'error': 'Referral code required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            referrer = Student.objects.get(referral_code=code)
            return Response({
                'valid': True,
                'referrer_name': referrer.user.get_full_name(),
                'message': 'Referral code applied! You will be connected after registration.'
            })
        except Student.DoesNotExist:
            return Response(
                {'valid': False, 'error': 'Invalid referral code'},
                status=status.HTTP_400_BAD_REQUEST
            )


class DashboardViewSet(viewsets.ViewSet):
    """Dashboard API endpoints"""
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def student(self, request):
        """Student dashboard data"""
        try:
            student = request.user.lms_student
        except Student.DoesNotExist:
            return Response(
                {'error': 'Student profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get enrolled courses
        enrollments = StudentEnrollment.objects.filter(
            student=student,
            is_active=True
        )
        courses = [e.course for e in enrollments]
        
        # Get upcoming classes
        today = timezone.now().date()
        upcoming = ClassSession.objects.filter(
            course__in=courses,
            date__gte=today
        ).order_by('date', 'start_time')[:5]
        
        # Get recent payments
        payments = Payment.objects.filter(
            student=student
        ).order_by('-payment_date')[:5]
        
        # Get attendance stats
        attendance_stats = {
            'total_classes': Attendance.objects.filter(student=student).count(),
            'present': Attendance.objects.filter(student=student, status='present').count(),
            'absent': Attendance.objects.filter(student=student, status='absent').count(),
            'leave': Attendance.objects.filter(student=student, status='leave').count(),
        }
        
        # Get test results
        test_results = TestResult.objects.filter(
            student=student
        ).order_by('-created_at')[:5]
        
        # Get referral stats
        total_referrals = ReferralTracking.objects.filter(referrer=student).count()
        active_referrals = ReferralTracking.objects.filter(
            referrer=student, 
            status='paid'
        ).count()
        
        next_milestone = 5 if active_referrals < 5 else (10 if active_referrals < 10 else active_referrals + 5)
        referrals_to_next = next_milestone - active_referrals
        
        referral_stats = {
            'total_referrals': total_referrals,
            'active_referrals': active_referrals,
            'pending_referrals': total_referrals - active_referrals,
            'current_fee': student.current_monthly_fee,
            'total_discount': student.total_referral_discount,
            'total_earnings': student.total_earnings,
            'next_milestone': next_milestone,
            'referrals_to_next_milestone': referrals_to_next,
        }
        
        data = {
            'student': StudentSerializer(student).data,
            'enrolled_courses': CourseSerializer(courses, many=True, context={'request': request}).data,
            'upcoming_classes': ClassSessionSerializer(upcoming, many=True, context={'request': request}).data,
            'recent_payments': PaymentSerializer(payments, many=True).data,
            'attendance_stats': attendance_stats,
            'test_results': TestResultSerializer(test_results, many=True).data,
            'referral_stats': referral_stats,
        }
        
        return Response(data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def admin(self, request):
        """Admin dashboard data"""
        today = timezone.now().date()
        current_month = today.replace(day=1)
        
        # Statistics
        total_students = Student.objects.count()
        active_students = Student.objects.filter(is_active=True).count()
        total_courses = Course.objects.filter(is_active=True).count()
        
        # Sessions this month
        total_sessions_this_month = ClassSession.objects.filter(
            date__year=today.year,
            date__month=today.month
        ).count()
        
        # Pending payments
        pending_payments = Payment.objects.filter(status='pending').count()
        
        # Monthly revenue
        monthly_revenue = Payment.objects.filter(
            status='completed',
            for_month=current_month
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        # Recent enrollments
        recent_enrollments = Student.objects.order_by('-enrollment_date')[:5]
        
        # Recent payments
        recent_payments = Payment.objects.filter(
            status='completed'
        ).order_by('-verified_at')[:5]
        
        # Attendance summary for this month
        attendance_summary = {
            'total_marked': Attendance.objects.filter(
                date__year=today.year,
                date__month=today.month
            ).count(),
            'present': Attendance.objects.filter(
                date__year=today.year,
                date__month=today.month,
                status='present'
            ).count(),
            'absent': Attendance.objects.filter(
                date__year=today.year,
                date__month=today.month,
                status='absent'
            ).count(),
        }
        
        data = {
            'total_students': total_students,
            'active_students': active_students,
            'total_courses': total_courses,
            'total_sessions_this_month': total_sessions_this_month,
            'pending_payments': pending_payments,
            'monthly_revenue': monthly_revenue,
            'recent_enrollments': StudentSerializer(recent_enrollments, many=True).data,
            'recent_payments': PaymentSerializer(recent_payments, many=True).data,
            'attendance_summary': attendance_summary,
        }
        
        return Response(data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def finance(self, request):
        """Financial reports"""
        year = int(request.query_params.get('year', timezone.now().year))
        
        monthly_data = []
        for month in range(1, 13):
            payments = Payment.objects.filter(
                status='completed',
                for_month__year=year,
                for_month__month=month
            )
            
            monthly_data.append({
                'month': month,
                'total_collected': payments.aggregate(total=Sum('amount'))['total'] or 0,
                'number_of_payments': payments.count(),
            })
        
        return Response({
            'year': year,
            'monthly_data': monthly_data,
            'total_yearly': sum(m['total_collected'] for m in monthly_data),
        })


class EmailLogViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for viewing email logs (admin only)"""
    queryset = EmailLog.objects.all()
    serializer_class = EmailLogSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        queryset = EmailLog.objects.all()
        
        # Filter by student
        student_id = self.request.query_params.get('student')
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        
        # Filter by email type
        email_type = self.request.query_params.get('type')
        if email_type:
            queryset = queryset.filter(email_type=email_type)
        
        # Filter by status
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        
        return queryset


class QuizViewSet(viewsets.ModelViewSet):
    """API endpoint for quizzes"""
    queryset = Quiz.objects.filter(is_published=True, is_active=True)
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'add_question']:
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]
    
    def get_serializer_class(self):
        if self.action == 'add_question' and self.request.user.is_staff:
            return QuizQuestionAdminSerializer
        return QuizSerializer
    
    def get_queryset(self):
        queryset = Quiz.objects.filter(is_published=True, is_active=True)
        
        # Filter by session
        session_id = self.request.query_params.get('session')
        if session_id:
            queryset = queryset.filter(class_session_id=session_id)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def start_attempt(self, request, pk=None):
        """Start a new quiz attempt"""
        quiz = self.get_object()
        
        try:
            student = request.user.lms_student
        except Student.DoesNotExist:
            return Response(
                {'error': 'Student profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if already attempted
        if QuizAttempt.objects.filter(quiz=quiz, student=student).exists():
            return Response(
                {'error': 'You have already attempted this quiz'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create attempt
        attempt = QuizAttempt.objects.create(
            quiz=quiz,
            student=student,
            answers={}
        )
        
        return Response({
            'attempt_id': attempt.id,
            'quiz_id': quiz.id,
            'time_limit_minutes': quiz.time_limit_minutes,
            'total_marks': quiz.total_marks,
            'started_at': attempt.started_at,
            'message': 'Quiz attempt started'
        })
    
    @action(detail=True, methods=['post'])
    def submit_attempt(self, request, pk=None):
        """Submit quiz answers"""
        quiz = self.get_object()
        
        try:
            student = request.user.lms_student
        except Student.DoesNotExist:
            return Response(
                {'error': 'Student profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get the attempt
        try:
            attempt = QuizAttempt.objects.get(quiz=quiz, student=student)
        except QuizAttempt.DoesNotExist:
            return Response(
                {'error': 'No active quiz attempt found. Start the quiz first.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if attempt.submitted_at:
            return Response(
                {'error': 'Quiz already submitted'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate and save answers
        serializer = QuizSubmitSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Save answers and calculate score
        attempt.answers = serializer.validated_data['answers']
        attempt.time_taken_seconds = serializer.validated_data['time_taken_seconds']
        attempt.submitted_at = timezone.now()
        attempt.save()
        
        # Calculate score
        attempt.calculate_score()
        
        # Send result email
        send_quiz_result_email(attempt)
        attempt.result_email_sent = True
        attempt.save()
        
        return Response({
            'message': 'Quiz submitted successfully',
            'score': attempt.score,
            'total_marks': quiz.total_marks,
            'percentage': attempt.percentage,
            'is_passed': attempt.is_passed,
            'time_taken_seconds': attempt.time_taken_seconds
        })
    
    @action(detail=True, methods=['get'])
    def my_result(self, request, pk=None):
        """Get current user's quiz result"""
        quiz = self.get_object()
        
        try:
            student = request.user.lms_student
        except Student.DoesNotExist:
            return Response(
                {'error': 'Student profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            attempt = QuizAttempt.objects.get(quiz=quiz, student=student)
            serializer = QuizAttemptSerializer(attempt)
            return Response(serializer.data)
        except QuizAttempt.DoesNotExist:
            return Response(
                {'error': 'No attempt found for this quiz'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def add_question(self, request, pk=None):
        """Add question to quiz (admin only)"""
        quiz = self.get_object()
        
        serializer = QuizQuestionAdminSerializer(data=request.data)
        if serializer.is_valid():
            question = serializer.save(quiz=quiz)
            return Response({
                'message': 'Question added successfully',
                'question_id': question.id
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EnrollmentViewSet(viewsets.ViewSet):
    """Public enrollment endpoint with email verification"""
    permission_classes = [permissions.AllowAny]
    
    @action(detail=False, methods=['post'])
    def request_enrollment(self, request):
        """Submit enrollment request with email verification"""
        serializer = EnrollmentRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        # Check if email already exists
        if User.objects.filter(email=data['email']).exists():
            return Response(
                {'error': 'Email already registered. Please login instead.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create user (inactive until email verified)
        user = User.objects.create_user(
            username=data['email'],
            email=data['email'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            password=User.objects.make_random_password(),  # Temporary password
            is_active=False  # Inactive until email verified
        )
        
        # Handle referral
        referred_by = None
        if data.get('referral_code'):
            try:
                referred_by = Student.objects.get(referral_code=data['referral_code'])
            except Student.DoesNotExist:
                pass
        
        # Create student
        student = Student.objects.create(
            user=user,
            phone=data['phone'],
            whatsapp=data.get('whatsapp', ''),
            address=data['address'],
            date_of_birth=data['date_of_birth'],
            grade=data['grade'],
            referred_by=referred_by
        )
        
        # Create email verification token
        import uuid
        import hashlib
        token = hashlib.sha256(f"{user.email}{uuid.uuid4().hex}".encode()).hexdigest()[:64]
        
        verification = EmailVerification.objects.create(
            student=student,
            token=token
        )
        
        # Enroll in course if specified
        if data.get('course_id'):
            try:
                course = Course.objects.get(id=data['course_id'], is_active=True)
                StudentEnrollment.objects.create(
                    student=student,
                    course=course
                )
            except Course.DoesNotExist:
                pass
        
        # Send verification email
        send_verification_email(verification)
        
        return Response({
            'message': 'Enrollment request submitted. Please check your email to verify your account.',
            'email': user.email,
            'verification_required': True
        })
    
    @action(detail=False, methods=['get'])
    def verify_email(self, request):
        """Verify email with token"""
        token = request.query_params.get('token')
        
        if not token:
            return Response(
                {'error': 'Verification token required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            verification = EmailVerification.objects.get(
                token=token,
                is_verified=False
            )
        except EmailVerification.DoesNotExist:
            return Response(
                {'error': 'Invalid or expired verification token'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Activate user
        verification.student.user.is_active = True
        verification.student.user.save()
        
        # Mark as verified
        verification.is_verified = True
        verification.verified_at = timezone.now()
        verification.save()
        
        # Create referral tracking if referred
        if verification.student.referred_by:
            ReferralTracking.objects.create(
                referrer=verification.student.referred_by,
                referred_student=verification.student,
                status='pending'
            )
        
        # Send welcome email
        send_welcome_email(verification.student)
        
        return Response({
            'message': 'Email verified successfully! Your account is now active.',
            'verified': True,
            'login_url': 'https://app.seekhowithrua.com/login'
        })
    
    @action(detail=False, methods=['post'])
    def resend_verification(self, request):
        """Resend verification email"""
        email = request.data.get('email')
        
        if not email:
            return Response(
                {'error': 'Email required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(email=email)
            student = user.lms_student
            verification = student.email_verification
            
            if verification.is_verified:
                return Response(
                    {'error': 'Email already verified. Please login.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Regenerate token
            import uuid
            import hashlib
            verification.token = hashlib.sha256(f"{email}{uuid.uuid4().hex}".encode()).hexdigest()[:64]
            verification.save()
            
            # Send verification email
            send_verification_email(verification)
            
            return Response({
                'message': 'Verification email resent. Please check your inbox.'
            })
            
        except (User.DoesNotExist, Student.DoesNotExist, EmailVerification.DoesNotExist):
            return Response(
                {'error': 'No pending enrollment found for this email'},
                status=status.HTTP_404_NOT_FOUND
            )


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def submit_quiz_report(request):
    """Receive quiz results from static HTML and email report to trainer"""
    data = request.data
    
    # Extract student info
    student_name = data.get('name', 'Anonymous')
    student_email = data.get('email', 'N/A')
    student_mobile = data.get('mobile', 'N/A')
    
    # Extract quiz results
    score = data.get('score', 0)
    total_questions = data.get('totalQuestions', 30)
    correct_answers = data.get('correctAnswers', 0)
    time_taken = data.get('timeTaken', '0:00')
    performance = data.get('performance', 'N/A')
    
    # Extract detailed answers
    answers = data.get('answers', [])
    category_scores = data.get('categoryScores', {})
    
    # Build email content
    subject = f"📊 Quiz Report: {student_name} - Score: {score}%"
    
    # Create HTML email body
    html_content = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .header {{ background: #7c3aed; color: white; padding: 20px; text-align: center; }}
            .container {{ padding: 20px; max-width: 800px; margin: 0 auto; }}
            .student-info {{ background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; }}
            .stats {{ display: flex; justify-content: space-between; margin: 20px 0; }}
            .stat-box {{ background: #fff; border: 2px solid #7c3aed; padding: 15px; text-align: center; border-radius: 8px; flex: 1; margin: 0 10px; }}
            .score-high {{ color: #2ecc71; font-weight: bold; }}
            .score-medium {{ color: #f39c12; font-weight: bold; }}
            .score-low {{ color: #e74c3c; font-weight: bold; }}
            table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
            th, td {{ padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }}
            th {{ background: #7c3aed; color: white; }}
            .correct {{ color: #2ecc71; }}
            .wrong {{ color: #e74c3c; }}
            .category {{ background: #f9fafb; padding: 10px; margin: 10px 0; border-radius: 5px; }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🎯 Python & ML Quiz Report</h1>
            <p>SeekhoWithRua LMS</p>
        </div>
        
        <div class="container">
            <div class="student-info">
                <h2>👤 Student Information</h2>
                <p><strong>Name:</strong> {student_name}</p>
                <p><strong>Email:</strong> {student_email}</p>
                <p><strong>Mobile:</strong> {student_mobile}</p>
                <p><strong>Submitted:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
            </div>
            
            <h2>📈 Performance Summary</h2>
            <div class="stats">
                <div class="stat-box">
                    <h3>Score</h3>
                    <p class="{'score-high' if score >= 70 else 'score-medium' if score >= 50 else 'score-low'}">{score}%</p>
                </div>
                <div class="stat-box">
                    <h3>Correct</h3>
                    <p>{correct_answers}/{total_questions}</p>
                </div>
                <div class="stat-box">
                    <h3>Time</h3>
                    <p>{time_taken}</p>
                </div>
                <div class="stat-box">
                    <h3>Rating</h3>
                    <p>{performance}</p>
                </div>
            </div>
    """
    
    # Add category breakdown
    if category_scores:
        html_content += "<h2>📊 Category Breakdown</h2>"
        for category, stats in category_scores.items():
            html_content += f"""
            <div class="category">
                <strong>{category}:</strong> {stats['correct']}/{stats['total']} correct ({stats['percentage']}%)
            </div>
            """
    
    # Add detailed answers
    html_content += "<h2>📝 Detailed Answers</h2><table>"
    html_content += "<tr><th>Q#</th><th>Category</th><th>Question</th><th>Status</th><th>Student Answer</th><th>Correct Answer</th></tr>"
    
    for ans in answers:
        is_correct = ans.get('isCorrect', False)
        status_class = 'correct' if is_correct else 'wrong'
        status_text = '✓ Correct' if is_correct else '✗ Wrong'
        
        html_content += f"""
        <tr>
            <td>{ans.get('questionNumber', 'N/A')}</td>
            <td>{ans.get('category', 'General')}</td>
            <td>{ans.get('question', 'N/A')[:80]}...</td>
            <td class="{status_class}">{status_text}</td>
            <td>{ans.get('studentAnswer', 'N/A')}</td>
            <td>{ans.get('correctAnswer', 'N/A') if not is_correct else '-'}</td>
        </tr>
        """
    
    html_content += """
            </table>
            
            <div style="text-align: center; margin-top: 30px; color: #6b7280;">
                <p>Generated by SeekhoWithRua LMS Quiz System</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Send email to trainer
    try:
        from django.conf import settings
        
        # Also send to student
        recipients = ['seekhowithrua@gmail.com']
        if student_email and '@' in student_email:
            recipients.append(student_email)
        
        email = EmailMultiAlternatives(
            subject=subject,
            body=strip_tags(html_content),
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'seekhowithrua@gmail.com'),
            to=recipients
        )
        email.attach_alternative(html_content, "text/html")
        email.send()
        
        return Response({
            'success': True,
            'message': 'Quiz report sent successfully to trainer'
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Failed to send email: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def strip_tags(html):
    """Simple HTML tag stripper"""
    import re
    clean = re.compile('<.*?>')
    return re.sub(clean, '', html)
