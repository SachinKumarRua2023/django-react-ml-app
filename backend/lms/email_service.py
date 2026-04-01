"""
Email service for LMS - handles all automated email notifications
"""

from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from .models import EmailLog, Student, Payment, ReferralTracking, ClassSession, QuizAttempt

# LMS Settings
UPI_ID = getattr(settings, 'LMS_UPI_ID', '8826776018-4@ybl')
MONTHLY_FEE = getattr(settings, 'LMS_MONTHLY_FEE', 1000)


def log_email(student, email_type, subject, content='', status='sent', error_message=''):
    """Log email to database"""
    EmailLog.objects.create(
        student=student,
        email_type=email_type,
        subject=subject,
        content=content,
        status=status,
        error_message=error_message
    )


def send_email_with_template(student, email_type, subject, template_name, context):
    """Send email using HTML template"""
    try:
        html_content = render_to_string(f'lms/emails/{template_name}.html', context)
        text_content = strip_tags(html_content)
        
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[student.user.email]
        )
        email.attach_alternative(html_content, "text/html")
        email.send()
        
        log_email(student, email_type, subject, html_content, 'sent')
        return True
    except Exception as e:
        log_email(student, email_type, subject, '', 'failed', str(e))
        return False


def send_welcome_email(student):
    """Send welcome email to new student"""
    subject = "Welcome to SeekhoWithRua Coaching!"
    context = {
        'student_name': student.user.get_full_name(),
        'grade': student.get_grade_display(),
        'referral_code': student.referral_code,
        'monthly_fee': student.current_monthly_fee,
        'login_email': student.user.email,
    }
    return send_email_with_template(student, 'welcome', subject, 'welcome', context)


def send_payment_reminder_email(student, payment):
    """Send payment reminder email"""
    subject = f"Payment Reminder - Fee Due for {payment.for_month.strftime('%B %Y')}"
    context = {
        'student_name': student.user.get_full_name(),
        'amount': payment.amount,
        'for_month': payment.for_month.strftime('%B %Y'),
        'due_date': payment.due_date,
        'upi_id': 'seekhowithrua@ybl',  # Update with actual UPI ID
        'phonepe_qr_url': '/static/lms/phonepe-qr.png',  # Update with actual QR
    }
    return send_email_with_template(student, 'payment_reminder', subject, 'payment_reminder', context)


def send_payment_receipt_email(payment):
    """Send payment receipt after verification"""
    student = payment.student
    subject = f"Payment Receipt - {payment.receipt_number}"
    context = {
        'student_name': student.user.get_full_name(),
        'receipt_number': payment.receipt_number,
        'amount': payment.amount,
        'for_month': payment.for_month.strftime('%B %Y'),
        'payment_date': payment.verified_at,
        'utr_number': payment.utr_number,
        'current_fee': student.current_monthly_fee,
    }
    
    if send_email_with_template(student, 'payment_receipt', subject, 'payment_receipt', context):
        payment.receipt_sent = True
        payment.save()
        return True
    return False


def send_class_reminder_email(student, class_session, hours_before):
    """Send class reminder email"""
    if hours_before == 24:
        subject = f"Reminder: {class_session.title} tomorrow at {class_session.start_time}"
        email_type = 'class_reminder_24h'
    else:
        subject = f"Starting in 1 hour: {class_session.title}"
        email_type = 'class_reminder_1h'
    
    context = {
        'student_name': student.user.get_full_name(),
        'class_title': class_session.title,
        'course_title': class_session.course.title,
        'date': class_session.date,
        'start_time': class_session.start_time,
        'hours_before': hours_before,
    }
    return send_email_with_template(student, email_type, subject, 'class_reminder', context)


def send_feedback_form_email(student, class_session):
    """Send feedback form link after class"""
    subject = f"Feedback Request: {class_session.title}"
    context = {
        'student_name': student.user.get_full_name(),
        'class_title': class_session.title,
        'course_title': class_session.course.title,
        'feedback_url': f"https://app.seekhowithrua.com/feedback/{class_session.id}",
    }
    return send_email_with_template(student, 'feedback_form', subject, 'feedback_form', context)


def send_absence_alert_email(student, consecutive_days):
    """Send alert for continuous absence"""
    subject = f"Absence Alert - {consecutive_days} Days Missed"
    context = {
        'student_name': student.user.get_full_name(),
        'consecutive_days': consecutive_days,
        'parent_contact': student.whatsapp or student.phone,
    }
    return send_email_with_template(student, 'absence_alert', subject, 'absence_alert', context)


def send_referral_concession_email(referral_tracking):
    """Send notification about applied referral concession"""
    referrer = referral_tracking.referrer
    referred = referral_tracking.referred_student
    
    subject = "Referral Concession Applied! 🎉"
    context = {
        'referrer_name': referrer.user.get_full_name(),
        'referred_name': referred.user.get_full_name(),
        'concession_amount': referral_tracking.concession_amount,
        'new_monthly_fee': referrer.current_monthly_fee,
        'total_referrals': ReferralTracking.objects.filter(referrer=referrer, status='paid').count(),
        'referral_code': referrer.referral_code,
    }
    
    if send_email_with_template(referrer, 'referral_concession', subject, 'referral_concession', context):
        referral_tracking.concession_notification_sent = True
        referral_tracking.save()
        return True
    return False


def send_earnings_notification_email(student):
    """Send notification when student starts earning from referrals"""
    subject = "Congratulations! You've Started Earning! 💰"
    context = {
        'student_name': student.user.get_full_name(),
        'total_earnings': student.total_earnings,
        'active_referrals': ReferralTracking.objects.filter(referrer=student, status='paid').count(),
        'earning_per_referral': 200,
    }
    return send_email_with_template(student, 'earnings_notification', subject, 'earnings_notification', context)


def send_test_result_email(test_result):
    """Send test results to student"""
    student = test_result.student
    test = test_result.test
    
    subject = f"Test Results: {test.title}"
    context = {
        'student_name': student.user.get_full_name(),
        'test_title': test.title,
        'marks_obtained': test_result.marks_obtained,
        'total_marks': test.total_marks,
        'percentage': test_result.percentage,
        'rank': test_result.rank,
        'remarks': test_result.remarks,
    }
    return send_email_with_template(student, 'test_result', subject, 'test_result', context)


# Bulk email functions for Celery tasks

def send_payment_reminders_to_all():
    """Send payment reminders to all students with pending payments"""
    from django.utils import timezone
    from datetime import timedelta
    
    # Get students with pending payments for current month
    current_month = timezone.now().replace(day=1)
    pending_payments = Payment.objects.filter(
        for_month=current_month,
        status='pending'
    ).select_related('student')
    
    sent_count = 0
    for payment in pending_payments:
        if send_payment_reminder_email(payment.student, payment):
            sent_count += 1
    
    return sent_count


def send_class_reminders():
    """Send class reminders (24h and 1h before)"""
    from django.utils import timezone
    from datetime import timedelta
    
    now = timezone.now()
    sent_count = 0
    
    # 24 hour reminders
    classes_24h = ClassSession.objects.filter(
        date=now.date() + timedelta(days=1),
        reminder_sent_24h=False
    )
    
    for session in classes_24h:
        enrollments = StudentEnrollment.objects.filter(
            course=session.course,
            is_active=True
        ).select_related('student')
        
        for enrollment in enrollments:
            if send_class_reminder_email(enrollment.student, session, 24):
                sent_count += 1
        
        session.reminder_sent_24h = True
        session.save()
    
    # 1 hour reminders
    classes_1h = ClassSession.objects.filter(
        date=now.date(),
        start_time__hour=now.hour + 1,
        reminder_sent_1h=False
    )
    
    for session in classes_1h:
        enrollments = StudentEnrollment.objects.filter(
            course=session.course,
            is_active=True
        ).select_related('student')
        
        for enrollment in enrollments:
            if send_class_reminder_email(enrollment.student, session, 1):
                sent_count += 1
        
        session.reminder_sent_1h = True
        session.save()
    
    return sent_count


def check_continuous_absence():
    """Check for students with 3+ days of continuous absence"""
    from django.utils import timezone
    from datetime import timedelta
    
    today = timezone.now().date()
    students = Student.objects.filter(is_active=True)
    
    alerted_count = 0
    for student in students:
        # Check last 3 days
        consecutive_absent = 0
        for i in range(1, 4):
            check_date = today - timedelta(days=i)
            attendance = Attendance.objects.filter(
                student=student,
                date=check_date
            ).first()
            
            if attendance and attendance.status == 'absent':
                consecutive_absent += 1
            else:
                break
        
        if consecutive_absent >= 3:
            if send_absence_alert_email(student, consecutive_absent):
                alerted_count += 1
    
    return alerted_count


def send_feedback_form_requests():
    """Send feedback forms for completed classes"""
    from django.utils import timezone
    
    now = timezone.now()
    completed_classes = ClassSession.objects.filter(
        date__lt=now.date(),
        feedback_form_sent=False
    )
    
    sent_count = 0
    for session in completed_classes:
        enrollments = StudentEnrollment.objects.filter(
            course=session.course,
            is_active=True
        ).select_related('student')
        
        for enrollment in enrollments:
            if send_feedback_form_email(enrollment.student, session):
                sent_count += 1
        
        session.feedback_form_sent = True
        session.save()
    
    return sent_count


def send_quiz_result_email(attempt):
    """Send quiz results to student"""
    student = attempt.student
    quiz = attempt.quiz
    
    subject = f"Quiz Results: {quiz.title}"
    context = {
        'student_name': student.user.get_full_name(),
        'quiz_title': quiz.title,
        'session_title': quiz.class_session.title,
        'score': attempt.score,
        'total_marks': quiz.total_marks,
        'percentage': attempt.percentage,
        'is_passed': attempt.is_passed,
        'passing_marks': quiz.passing_marks,
        'time_taken_minutes': attempt.time_taken_seconds // 60,
        'time_taken_seconds': attempt.time_taken_seconds % 60,
    }
    
    if send_email_with_template(student, 'quiz_result', subject, 'quiz_result', context):
        attempt.result_email_sent = True
        attempt.save()
        return True
    return False


def send_verification_email(verification):
    """Send email verification link to new student"""
    student = verification.student
    
    subject = "Verify Your Email - SeekhoWithRua Coaching"
    verification_url = f"https://api.seekhowithrua.com/api/lms/enrollment/verify_email/?token={verification.token}"
    
    context = {
        'student_name': student.user.get_full_name(),
        'email': student.user.email,
        'verification_url': verification_url,
        'grade': student.get_grade_display(),
    }
    
    return send_email_with_template(student, 'welcome', subject, 'email_verification', context)
