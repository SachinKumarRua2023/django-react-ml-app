"""
LMS App for SeekhoWithRua Coaching Institute
Handles students, courses, payments, attendance, tests, and referrals
"""

from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import uuid


class Student(models.Model):
    """Student profile linked to User model"""
    
    GRADE_CHOICES = [
        ('7', '7th Grade'),
        ('8', '8th Grade'),
        ('9', '9th Grade'),
        ('10', '10th Grade'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='lms_student')
    
    # Personal Info
    phone = models.CharField(max_length=15)
    whatsapp = models.CharField(max_length=15, blank=True)
    address = models.TextField()
    date_of_birth = models.DateField()
    
    # Class/Grade
    grade = models.CharField(max_length=2, choices=GRADE_CHOICES)
    
    # Fee Structure (Base fee ₹1000/month)
    base_monthly_fee = models.DecimalField(max_digits=10, decimal_places=2, default=1000.00)
    current_monthly_fee = models.DecimalField(max_digits=10, decimal_places=2, default=1000.00)
    total_referral_discount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Enrollment
    enrollment_date = models.DateField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    # Referral Tracking
    referred_by = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='referrals')
    referral_code = models.CharField(max_length=10, unique=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'lms_students'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - Grade {self.grade}"
    
    def save(self, *args, **kwargs):
        if not self.referral_code:
            self.referral_code = self.generate_referral_code()
        super().save(*args, **kwargs)
    
    def generate_referral_code(self):
        """Generate unique referral code"""
        return f"RUA{self.user.id:04d}{uuid.uuid4().hex[:4].upper()}"
    
    def calculate_referral_concession(self):
        """
        Calculate fee based on referrals:
        1 referral = ₹200 concession
        5 referrals = ₹1000 concession (FREE)
        10+ referrals = Start earning ₹200-500 per referral
        """
        active_referrals = ReferralTracking.objects.filter(
            referrer=self,
            status='paid'
        ).count()
        
        if active_referrals >= 10:
            # Student earns money
            self.current_monthly_fee = 0
            self.total_referral_discount = 1000
            self.total_earnings = (active_referrals - 10) * 200
        elif active_referrals >= 5:
            # Free education
            self.current_monthly_fee = 0
            self.total_referral_discount = 1000
            self.total_earnings = 0
        else:
            # Partial concession
            self.current_monthly_fee = max(0, 1000 - (active_referrals * 200))
            self.total_referral_discount = active_referrals * 200
            self.total_earnings = 0
        
        self.save()
        return self.current_monthly_fee


class Course(models.Model):
    """Course model with YouTube integration"""
    
    LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=50)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='beginner')
    
    # YouTube Integration
    youtube_playlist_id = models.CharField(max_length=100, blank=True)
    
    # Fee
    course_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_paid = models.BooleanField(default=False)
    
    # Syllabus
    syllabus_pdf = models.FileField(upload_to='lms/syllabus/', blank=True, null=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'lms_courses'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title


class ClassSession(models.Model):
    """Individual class sessions with YouTube videos"""
    
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='sessions')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # Schedule
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    
    # YouTube Video (Unlisted)
    youtube_video_id = models.CharField(max_length=20, blank=True)
    
    # Status
    is_live = models.BooleanField(default=False)
    recording_available = models.BooleanField(default=False)
    
    # Automated Reminders
    reminder_sent_24h = models.BooleanField(default=False)
    reminder_sent_1h = models.BooleanField(default=False)
    feedback_form_sent = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'lms_class_sessions'
        ordering = ['-date', '-start_time']
    
    def __str__(self):
        return f"{self.course.title} - {self.title} ({self.date})"


class Attendance(models.Model):
    """Student attendance records"""
    
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('leave', 'Leave'),
    ]
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendance_records')
    class_session = models.ForeignKey(ClassSession, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    
    # Marked by
    marked_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    marked_at = models.DateTimeField(auto_now_add=True)
    
    # Notes
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'lms_attendance'
        unique_together = ['student', 'date', 'class_session']
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.student.user.get_full_name()} - {self.date} - {self.status}"


class Test(models.Model):
    """Tests and exams"""
    
    TEST_TYPE_CHOICES = [
        ('weekly', 'Weekly Test'),
        ('monthly', 'Monthly Test'),
        ('final', 'Final Exam'),
        ('quiz', 'Quiz'),
    ]
    
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='tests')
    title = models.CharField(max_length=200)
    test_type = models.CharField(max_length=20, choices=TEST_TYPE_CHOICES)
    total_marks = models.IntegerField(default=100)
    date = models.DateField()
    
    # Syllabus covered
    syllabus = models.TextField(blank=True)
    
    # Status
    is_published = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'lms_tests'
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.title} - {self.course.title}"


class TestResult(models.Model):
    """Student test results with ranking"""
    
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name='results')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='test_results')
    marks_obtained = models.IntegerField()
    rank = models.IntegerField(null=True, blank=True)
    remarks = models.TextField(blank=True)
    
    # Percentage calculated
    percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'lms_test_results'
        unique_together = ['test', 'student']
        ordering = ['-marks_obtained']
    
    def __str__(self):
        return f"{self.student.user.get_full_name()} - {self.test.title}: {self.marks_obtained}"
    
    def save(self, *args, **kwargs):
        if self.test.total_marks > 0:
            self.percentage = (self.marks_obtained / self.test.total_marks) * 100
        super().save(*args, **kwargs)


class Payment(models.Model):
    """Payment records for fees"""
    
    PAYMENT_STATUS = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    PAYMENT_TYPE = [
        ('monthly_fee', 'Monthly Fee'),
        ('course_fee', 'Course Fee'),
        ('referral_bonus', 'Referral Bonus'),
    ]
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    
    # PhonePe/UPI Details
    utr_number = models.CharField(max_length=50, blank=True, verbose_name='UTR/Transaction Number')
    payment_method = models.CharField(max_length=20, default='phonepe_upi')
    payment_screenshot = models.ImageField(upload_to='lms/payment_screenshots/', blank=True, null=True)
    
    # Month being paid for
    for_month = models.DateField(help_text="The month this payment is for")
    
    # Dates
    payment_date = models.DateTimeField(auto_now_add=True)
    due_date = models.DateField()
    
    # Receipt
    receipt_number = models.CharField(max_length=20, unique=True, blank=True)
    receipt_sent = models.BooleanField(default=False)
    
    # Admin verification
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_payments')
    verified_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'lms_payments'
        ordering = ['-payment_date']
    
    def __str__(self):
        return f"{self.student.user.get_full_name()} - ₹{self.amount} - {self.status}"
    
    def save(self, *args, **kwargs):
        if not self.receipt_number:
            self.receipt_number = f"RUA{timezone.now().year}{self.id:06d}"
        super().save(*args, **kwargs)
    
    def verify(self, verified_by_user):
        """Mark payment as verified by admin"""
        self.status = 'completed'
        self.verified_by = verified_by_user
        self.verified_at = timezone.now()
        self.save()
        
        # If this is a referral student's payment, update referrer's concession
        referral = ReferralTracking.objects.filter(
            referred_student=self.student,
            status='pending'
        ).first()
        
        if referral:
            referral.mark_as_paid()


class ReferralTracking(models.Model):
    """Track referrals and concessions"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending Payment'),
        ('paid', 'Paid - Active'),
        ('inactive', 'Inactive'),
    ]
    
    referrer = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='referrals_made')
    referred_student = models.OneToOneField(Student, on_delete=models.CASCADE, related_name='referral_record')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Concession details
    concession_amount = models.DecimalField(max_digits=10, decimal_places=2, default=200.00)
    applied_to_month = models.DateField(null=True, blank=True)
    
    # Dates
    referred_date = models.DateField(auto_now_add=True)
    payment_received_date = models.DateField(null=True, blank=True)
    
    # Notification
    concession_notification_sent = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'lms_referral_tracking'
        ordering = ['-referred_date']
    
    def __str__(self):
        return f"{self.referrer.user.get_full_name()} referred {self.referred_student.user.get_full_name()}"
    
    def mark_as_paid(self):
        """When referred student pays, activate referral and apply concession"""
        if self.status == 'pending':
            self.status = 'paid'
            self.payment_received_date = timezone.now().date()
            self.save()
            
            # Recalculate referrer's fee
            self.referrer.calculate_referral_concession()
            
            # Send notification
            self.send_concession_notification()
    
    def send_concession_notification(self):
        """Send email notification about applied concession"""
        from .email_service import send_referral_concession_email
        
        if not self.concession_notification_sent:
            send_referral_concession_email(self)
            self.concession_notification_sent = True
            self.save()


class EmailLog(models.Model):
    """Log all automated emails sent"""
    
    EMAIL_TYPES = [
        ('welcome', 'Welcome Email'),
        ('payment_reminder', 'Payment Reminder'),
        ('payment_receipt', 'Payment Receipt'),
        ('class_reminder_24h', 'Class Reminder - 24h Before'),
        ('class_reminder_1h', 'Class Reminder - 1h Before'),
        ('feedback_form', 'Feedback Form'),
        ('absence_alert', 'Absence Alert'),
        ('referral_concession', 'Referral Concession'),
        ('earnings_notification', 'Earnings Notification'),
        ('test_result', 'Test Result'),
    ]
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='email_logs')
    email_type = models.CharField(max_length=30, choices=EMAIL_TYPES)
    subject = models.CharField(max_length=200)
    content = models.TextField(blank=True)
    
    sent_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=[('sent', 'Sent'), ('failed', 'Failed')])
    error_message = models.TextField(blank=True)
    
    class Meta:
        db_table = 'lms_email_logs'
        ordering = ['-sent_at']
    
    def __str__(self):
        return f"{self.student.user.get_full_name()} - {self.email_type} - {self.status}"


class StudentEnrollment(models.Model):
    """Many-to-many relationship between students and courses"""
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrolled_students')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    # Progress tracking
    completed_sessions = models.ManyToManyField(ClassSession, blank=True)
    
    class Meta:
        db_table = 'lms_student_enrollments'
        unique_together = ['student', 'course']
    
    def __str__(self):
        return f"{self.student.user.get_full_name()} enrolled in {self.course.title}"


class Quiz(models.Model):
    """Quizzes associated with class sessions"""
    
    class_session = models.OneToOneField(ClassSession, on_delete=models.CASCADE, related_name='quiz')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # Quiz settings
    time_limit_minutes = models.IntegerField(default=10)
    total_marks = models.IntegerField(default=10)
    passing_marks = models.IntegerField(default=5)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_published = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'lms_quizzes'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.class_session.title}"


class QuizQuestion(models.Model):
    """Individual quiz questions"""
    
    QUESTION_TYPES = [
        ('mcq', 'Multiple Choice'),
        ('true_false', 'True/False'),
        ('short_answer', 'Short Answer'),
    ]
    
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES, default='mcq')
    
    # For MCQ
    option_a = models.CharField(max_length=255, blank=True)
    option_b = models.CharField(max_length=255, blank=True)
    option_c = models.CharField(max_length=255, blank=True)
    option_d = models.CharField(max_length=255, blank=True)
    
    # Correct answer
    correct_answer = models.CharField(max_length=255)
    marks = models.IntegerField(default=1)
    
    order = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'lms_quiz_questions'
        ordering = ['order']
    
    def __str__(self):
        return f"Q{self.order}: {self.question_text[:50]}..."


class QuizAttempt(models.Model):
    """Student quiz attempts with results"""
    
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='quiz_attempts')
    
    # Answers stored as JSON: {"question_id": "answer"}
    answers = models.JSONField(default=dict)
    
    # Results
    score = models.IntegerField(default=0)
    percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    is_passed = models.BooleanField(default=False)
    
    # Timing
    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    time_taken_seconds = models.IntegerField(default=0)
    
    # Notification
    result_email_sent = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'lms_quiz_attempts'
        unique_together = ['quiz', 'student']
        ordering = ['-submitted_at']
    
    def __str__(self):
        return f"{self.student.user.get_full_name()} - {self.quiz.title}: {self.score}/{self.quiz.total_marks}"
    
    def calculate_score(self):
        """Calculate score based on answers"""
        total = 0
        for question in self.quiz.questions.all():
            student_answer = self.answers.get(str(question.id), '')
            if student_answer.lower().strip() == question.correct_answer.lower().strip():
                total += question.marks
        
        self.score = total
        if self.quiz.total_marks > 0:
            self.percentage = (total / self.quiz.total_marks) * 100
        self.is_passed = self.score >= self.quiz.passing_marks
        self.save()
        return self.score


class EmailVerification(models.Model):
    """Email verification tokens for new enrollments"""
    
    student = models.OneToOneField(Student, on_delete=models.CASCADE, related_name='email_verification')
    token = models.CharField(max_length=64, unique=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'lms_email_verifications'
    
    def __str__(self):
        return f"{self.student.user.email} - {'Verified' if self.is_verified else 'Pending'}"
