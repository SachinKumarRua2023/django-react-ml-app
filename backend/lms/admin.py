from django.contrib import admin
from .models import (
    Student, Course, ClassSession, Attendance,
    Test, TestResult, Payment, ReferralTracking,
    EmailLog, StudentEnrollment, Quiz, QuizQuestion,
    QuizAttempt, EmailVerification
)


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['user', 'grade', 'phone', 'current_monthly_fee', 'total_referral_discount', 'is_active', 'enrollment_date']
    list_filter = ['grade', 'is_active', 'enrollment_date']
    search_fields = ['user__first_name', 'user__last_name', 'user__email', 'phone', 'referral_code']
    readonly_fields = ['referral_code', 'total_referral_discount', 'total_earnings', 'created_at', 'updated_at']
    
    fieldsets = (
        ('User Information', {
            'fields': ('user', 'phone', 'whatsapp', 'address', 'date_of_birth')
        }),
        ('Academic', {
            'fields': ('grade', 'is_active')
        }),
        ('Fee Structure', {
            'fields': ('base_monthly_fee', 'current_monthly_fee', 'total_referral_discount', 'total_earnings')
        }),
        ('Referral', {
            'fields': ('referred_by', 'referral_code')
        }),
        ('Timestamps', {
            'fields': ('enrollment_date', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'level', 'course_fee', 'is_paid', 'is_active', 'created_at']
    list_filter = ['level', 'is_paid', 'is_active', 'category']
    search_fields = ['title', 'description']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(ClassSession)
class ClassSessionAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'date', 'start_time', 'is_live', 'recording_available', 'reminder_sent_24h']
    list_filter = ['course', 'date', 'is_live', 'recording_available']
    search_fields = ['title', 'description']
    date_hierarchy = 'date'
    
    actions = ['mark_as_live', 'mark_recording_available']
    
    def mark_as_live(self, request, queryset):
        queryset.update(is_live=True)
    mark_as_live.short_description = "Mark selected sessions as live"
    
    def mark_recording_available(self, request, queryset):
        queryset.update(recording_available=True)
    mark_recording_available.short_description = "Mark recordings as available"


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['student', 'class_session', 'date', 'status', 'marked_by', 'marked_at']
    list_filter = ['status', 'date']
    search_fields = ['student__user__first_name', 'student__user__last_name']
    date_hierarchy = 'date'


@admin.register(Test)
class TestAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'test_type', 'total_marks', 'date', 'is_published']
    list_filter = ['test_type', 'is_published', 'date']
    search_fields = ['title', 'syllabus']
    date_hierarchy = 'date'


@admin.register(TestResult)
class TestResultAdmin(admin.ModelAdmin):
    list_display = ['student', 'test', 'marks_obtained', 'percentage', 'rank', 'created_at']
    list_filter = ['test', 'created_at']
    search_fields = ['student__user__first_name', 'student__user__last_name']
    readonly_fields = ['percentage', 'created_at', 'updated_at']
    
    actions = ['calculate_ranks']
    
    def calculate_ranks(self, request, queryset):
        """Recalculate ranks for selected test results"""
        tests = set(result.test for result in queryset)
        for test in tests:
            results = TestResult.objects.filter(test=test).order_by('-marks_obtained')
            for rank, result in enumerate(results, 1):
                result.rank = rank
                result.save(update_fields=['rank'])
    calculate_ranks.short_description = "Recalculate ranks for selected results"


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['student', 'amount', 'payment_type', 'status', 'for_month', 'verified_by', 'verified_at']
    list_filter = ['status', 'payment_type', 'for_month']
    search_fields = ['student__user__first_name', 'student__user__last_name', 'utr_number', 'receipt_number']
    readonly_fields = ['receipt_number', 'payment_date']
    date_hierarchy = 'for_month'
    
    actions = ['verify_payments', 'mark_as_failed', 'resend_receipt']
    
    def verify_payments(self, request, queryset):
        for payment in queryset.filter(status='pending'):
            payment.verify(request.user)
    verify_payments.short_description = "Verify selected pending payments"
    
    def mark_as_failed(self, request, queryset):
        queryset.update(status='failed')
    mark_as_failed.short_description = "Mark selected as failed"
    
    def resend_receipt(self, request, queryset):
        from .email_service import send_payment_receipt_email
        for payment in queryset.filter(status='completed'):
            send_payment_receipt_email(payment)
            payment.receipt_sent = True
            payment.save()
    resend_receipt.short_description = "Resend payment receipts"


@admin.register(ReferralTracking)
class ReferralTrackingAdmin(admin.ModelAdmin):
    list_display = ['referrer', 'referred_student', 'status', 'concession_amount', 'referred_date', 'payment_received_date']
    list_filter = ['status', 'referred_date']
    search_fields = ['referrer__user__first_name', 'referrer__user__last_name', 
                     'referred_student__user__first_name', 'referred_student__user__last_name']
    readonly_fields = ['referred_date']


@admin.register(EmailLog)
class EmailLogAdmin(admin.ModelAdmin):
    list_display = ['student', 'email_type', 'subject', 'status', 'sent_at']
    list_filter = ['email_type', 'status', 'sent_at']
    search_fields = ['student__user__first_name', 'student__user__last_name', 'subject']
    readonly_fields = ['sent_at']
    date_hierarchy = 'sent_at'


@admin.register(StudentEnrollment)
class StudentEnrollmentAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'enrolled_at', 'is_active']
    list_filter = ['course', 'is_active', 'enrolled_at']
    search_fields = ['student__user__first_name', 'student__user__last_name', 'course__title']


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ['title', 'class_session', 'total_marks', 'passing_marks', 'is_published', 'created_at']
    list_filter = ['is_published', 'is_active', 'created_at']
    search_fields = ['title', 'description']
    readonly_fields = ['created_at']


class QuizQuestionInline(admin.TabularInline):
    model = QuizQuestion
    extra = 1
    fields = ['question_text', 'question_type', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer', 'marks', 'order']


@admin.register(QuizQuestion)
class QuizQuestionAdmin(admin.ModelAdmin):
    list_display = ['quiz', 'question_text', 'question_type', 'marks', 'order']
    list_filter = ['quiz', 'question_type']
    search_fields = ['question_text']


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ['student', 'quiz', 'score', 'percentage', 'is_passed', 'submitted_at', 'result_email_sent']
    list_filter = ['is_passed', 'result_email_sent', 'submitted_at']
    search_fields = ['student__user__first_name', 'student__user__last_name', 'quiz__title']
    readonly_fields = ['started_at', 'submitted_at']
    actions = ['resend_result_emails']
    
    def resend_result_emails(self, request, queryset):
        from .email_service import send_quiz_result_email
        for attempt in queryset:
            send_quiz_result_email(attempt)
            attempt.result_email_sent = True
            attempt.save()
    resend_result_emails.short_description = "Resend quiz result emails"


@admin.register(EmailVerification)
class EmailVerificationAdmin(admin.ModelAdmin):
    list_display = ['student', 'is_verified', 'created_at', 'verified_at']
    list_filter = ['is_verified', 'created_at']
    search_fields = ['student__user__email', 'token']
    readonly_fields = ['token', 'created_at', 'verified_at']
