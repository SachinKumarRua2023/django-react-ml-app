from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Student, Course, ClassSession, Attendance,
    Test, TestResult, Payment, ReferralTracking,
    EmailLog, StudentEnrollment, Quiz, QuizQuestion,
    QuizAttempt, EmailVerification
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'username']


class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = Student
        fields = [
            'id', 'user', 'full_name', 'email', 'phone', 'whatsapp', 'address',
            'date_of_birth', 'grade', 'base_monthly_fee', 'current_monthly_fee',
            'total_referral_discount', 'total_earnings', 'referral_code',
            'referred_by', 'enrollment_date', 'is_active'
        ]
        read_only_fields = ['referral_code', 'total_referral_discount', 'total_earnings']


class StudentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new student with user"""
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True, min_length=8)
    referral_code = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = Student
        fields = [
            'first_name', 'last_name', 'email', 'password',
            'phone', 'whatsapp', 'address', 'date_of_birth', 'grade',
            'referral_code'
        ]
    
    def create(self, validated_data):
        # Extract user data
        user_data = {
            'first_name': validated_data.pop('first_name'),
            'last_name': validated_data.pop('last_name'),
            'email': validated_data.pop('email'),
            'username': validated_data.pop('email'),  # Use email as username
        }
        password = validated_data.pop('password')
        referral_code = validated_data.pop('referral_code', None)
        
        # Create user
        user = User.objects.create_user(**user_data, password=password)
        
        # Handle referral
        if referral_code:
            try:
                referrer = Student.objects.get(referral_code=referral_code)
                validated_data['referred_by'] = referrer
            except Student.DoesNotExist:
                pass
        
        # Create student
        student = Student.objects.create(user=user, **validated_data)
        
        # Create referral tracking if referred
        if validated_data.get('referred_by'):
            ReferralTracking.objects.create(
                referrer=validated_data['referred_by'],
                referred_student=student,
                status='pending'
            )
        
        return student


class CourseSerializer(serializers.ModelSerializer):
    enrolled_count = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'category', 'level',
            'course_fee', 'is_paid', 'syllabus_pdf', 'is_active',
            'enrolled_count', 'is_enrolled', 'created_at'
        ]
    
    def get_enrolled_count(self, obj):
        return obj.enrolled_students.filter(is_active=True).count()
    
    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and hasattr(request.user, 'lms_student'):
            return StudentEnrollment.objects.filter(
                student=request.user.lms_student,
                course=obj,
                is_active=True
            ).exists()
        return False


class ClassSessionSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    is_attended = serializers.SerializerMethodField()
    youtube_embed_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ClassSession
        fields = [
            'id', 'course', 'course_title', 'title', 'description',
            'date', 'start_time', 'end_time', 'youtube_video_id',
            'youtube_embed_url', 'is_live', 'recording_available',
            'is_attended', 'created_at'
        ]
    
    def get_is_attended(self, obj):
        request = self.context.get('request')
        if request and hasattr(request.user, 'lms_student'):
            return Attendance.objects.filter(
                student=request.user.lms_student,
                class_session=obj,
                status='present'
            ).exists()
        return False
    
    def get_youtube_embed_url(self, obj):
        if obj.youtube_video_id:
            return f"https://www.youtube.com/embed/{obj.youtube_video_id}"
        return None


class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    session_title = serializers.CharField(source='class_session.title', read_only=True)
    
    class Meta:
        model = Attendance
        fields = [
            'id', 'student', 'student_name', 'class_session', 'session_title',
            'date', 'status', 'notes', 'marked_at'
        ]


class TestSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    results_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Test
        fields = [
            'id', 'course', 'course_title', 'title', 'test_type',
            'total_marks', 'date', 'syllabus', 'is_published',
            'results_count', 'created_at'
        ]
    
    def get_results_count(self, obj):
        return obj.results.count()


class TestResultSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    test_title = serializers.CharField(source='test.title', read_only=True)
    
    class Meta:
        model = TestResult
        fields = [
            'id', 'test', 'test_title', 'student', 'student_name',
            'marks_obtained', 'percentage', 'rank', 'remarks', 'created_at'
        ]


class PaymentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'student', 'student_name', 'amount', 'payment_type',
            'status', 'utr_number', 'payment_method', 'payment_screenshot',
            'for_month', 'due_date', 'receipt_number', 'receipt_sent',
            'verified_by', 'verified_at', 'payment_date', 'notes'
        ]
        read_only_fields = ['receipt_number', 'payment_date', 'verified_at']


class PaymentCreateSerializer(serializers.ModelSerializer):
    """Serializer for students to submit payments"""
    
    class Meta:
        model = Payment
        fields = [
            'amount', 'payment_type', 'utr_number',
            'payment_screenshot', 'for_month'
        ]
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request.user, 'lms_student'):
            validated_data['student'] = request.user.lms_student
            validated_data['due_date'] = validated_data['for_month']
        return super().create(validated_data)


class ReferralTrackingSerializer(serializers.ModelSerializer):
    referrer_name = serializers.CharField(source='referrer.user.get_full_name', read_only=True)
    referred_name = serializers.CharField(source='referred_student.user.get_full_name', read_only=True)
    referred_grade = serializers.CharField(source='referred_student.grade', read_only=True)
    
    class Meta:
        model = ReferralTracking
        fields = [
            'id', 'referrer', 'referrer_name', 'referred_student',
            'referred_name', 'referred_grade', 'status', 'concession_amount',
            'referred_date', 'payment_received_date'
        ]


class ReferralStatsSerializer(serializers.Serializer):
    """Serializer for referral statistics"""
    total_referrals = serializers.IntegerField()
    active_referrals = serializers.IntegerField()
    pending_referrals = serializers.IntegerField()
    current_fee = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_discount = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_earnings = serializers.DecimalField(max_digits=10, decimal_places=2)
    next_milestone = serializers.IntegerField()
    referrals_to_next_milestone = serializers.IntegerField()


class EmailLogSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    
    class Meta:
        model = EmailLog
        fields = [
            'id', 'student', 'student_name', 'email_type',
            'subject', 'status', 'sent_at', 'error_message'
        ]


class StudentEnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    progress_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = StudentEnrollment
        fields = [
            'id', 'student', 'student_name', 'course', 'course_title',
            'progress_percentage', 'is_active', 'enrolled_at'
        ]
    
    def get_progress_percentage(self, obj):
        total_sessions = obj.course.sessions.count()
        if total_sessions == 0:
            return 0
        completed = obj.completed_sessions.count()
        return round((completed / total_sessions) * 100)


class StudentDashboardSerializer(serializers.Serializer):
    """Dashboard data for student portal"""
    student = StudentSerializer()
    enrolled_courses = CourseSerializer(many=True)
    upcoming_classes = ClassSessionSerializer(many=True)
    recent_payments = PaymentSerializer(many=True)
    attendance_stats = serializers.DictField()
    test_results = TestResultSerializer(many=True)
    referral_stats = ReferralStatsSerializer()


class AdminDashboardSerializer(serializers.Serializer):
    """Dashboard data for admin portal"""
    total_students = serializers.IntegerField()
    active_students = serializers.IntegerField()
    total_courses = serializers.IntegerField()
    total_sessions_this_month = serializers.IntegerField()
    pending_payments = serializers.IntegerField()
    monthly_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    recent_enrollments = StudentSerializer(many=True)
    recent_payments = PaymentSerializer(many=True)
    attendance_summary = serializers.DictField()


class QuizQuestionSerializer(serializers.ModelSerializer):
    """Serializer for quiz questions"""
    
    class Meta:
        model = QuizQuestion
        fields = [
            'id', 'question_text', 'question_type',
            'option_a', 'option_b', 'option_c', 'option_d',
            'marks', 'order'
        ]
        # Note: correct_answer is excluded - only shown to admin


class QuizQuestionAdminSerializer(serializers.ModelSerializer):
    """Admin serializer includes correct answer"""
    
    class Meta:
        model = QuizQuestion
        fields = [
            'id', 'question_text', 'question_type',
            'option_a', 'option_b', 'option_c', 'option_d',
            'correct_answer', 'marks', 'order'
        ]


class QuizSerializer(serializers.ModelSerializer):
    """Quiz serializer with questions"""
    questions = QuizQuestionSerializer(many=True, read_only=True)
    session_title = serializers.CharField(source='class_session.title', read_only=True)
    has_attempted = serializers.SerializerMethodField()
    
    class Meta:
        model = Quiz
        fields = [
            'id', 'class_session', 'session_title', 'title', 'description',
            'time_limit_minutes', 'total_marks', 'passing_marks',
            'questions', 'is_published', 'has_attempted', 'created_at'
        ]
    
    def get_has_attempted(self, obj):
        request = self.context.get('request')
        if request and hasattr(request.user, 'lms_student'):
            return QuizAttempt.objects.filter(
                quiz=obj,
                student=request.user.lms_student
            ).exists()
        return False


class QuizAttemptSerializer(serializers.ModelSerializer):
    """Serializer for quiz attempts"""
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)
    total_questions = serializers.SerializerMethodField()
    
    class Meta:
        model = QuizAttempt
        fields = [
            'id', 'quiz', 'quiz_title', 'student', 'student_name',
            'answers', 'score', 'percentage', 'is_passed',
            'time_taken_seconds', 'started_at', 'submitted_at',
            'total_questions'
        ]
        read_only_fields = ['score', 'percentage', 'is_passed', 'started_at']
    
    def get_total_questions(self, obj):
        return obj.quiz.questions.count()


class QuizSubmitSerializer(serializers.Serializer):
    """Serializer for submitting quiz answers"""
    answers = serializers.DictField(child=serializers.CharField())
    time_taken_seconds = serializers.IntegerField(min_value=0)


class EmailVerificationSerializer(serializers.ModelSerializer):
    """Email verification serializer"""
    email = serializers.CharField(source='student.user.email', read_only=True)
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    
    class Meta:
        model = EmailVerification
        fields = ['email', 'student_name', 'is_verified', 'created_at', 'verified_at']
        read_only_fields = ['created_at', 'verified_at']


class EnrollmentRequestSerializer(serializers.Serializer):
    """Serializer for enrollment requests"""
    first_name = serializers.CharField(max_length=50)
    last_name = serializers.CharField(max_length=50)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=15)
    whatsapp = serializers.CharField(max_length=15, required=False, allow_blank=True)
    address = serializers.CharField()
    date_of_birth = serializers.DateField()
    grade = serializers.ChoiceField(choices=[('7', '7th'), ('8', '8th'), ('9', '9th'), ('10', '10th')])
    referral_code = serializers.CharField(max_length=10, required=False, allow_blank=True)
    course_id = serializers.IntegerField(required=False)
