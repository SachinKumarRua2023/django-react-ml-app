"""
Celery tasks for LMS email automation
"""

from celery import shared_task
from .email_service import (
    send_payment_reminders_to_all,
    send_class_reminders,
    check_continuous_absence,
    send_feedback_form_requests,
)


@shared_task
def send_payment_reminders():
    """Send payment reminders to all students with pending payments (7th-10th)"""
    count = send_payment_reminders_to_all()
    return f"Sent {count} payment reminders"


@shared_task
def send_class_reminders():
    """Send class reminders (24h and 1h before)"""
    count = send_class_reminders()
    return f"Sent {count} class reminders"


@shared_task
def check_continuous_absence():
    """Check for students with 3+ days of continuous absence"""
    count = check_continuous_absence()
    return f"Sent {count} absence alerts"


@shared_task
def send_feedback_form_requests():
    """Send feedback forms for completed classes"""
    count = send_feedback_form_requests()
    return f"Sent {count} feedback form requests"
