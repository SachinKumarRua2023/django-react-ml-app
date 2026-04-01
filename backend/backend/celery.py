"""
Celery configuration for Django backend
"""

import os
from celery import Celery
from celery.schedules import crontab

# Set the default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

app = Celery('backend')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django app configs
app.autodiscover_tasks()

# Update Celery Beat Schedule
app.conf.beat_schedule = {
    'payment-reminder-7th': {
        'task': 'lms.tasks.send_payment_reminders',
        'schedule': crontab(day_of_month='7-10', hour=9, minute=0),
    },
    'class-reminder-24h': {
        'task': 'lms.tasks.send_class_reminders',
        'schedule': crontab(hour='*/1', minute=0),
    },
    'absence-checker': {
        'task': 'lms.tasks.check_continuous_absence',
        'schedule': crontab(hour=18, minute=0),
    },
    'feedback-form-sender': {
        'task': 'lms.tasks.send_feedback_form_requests',
        'schedule': crontab(hour=20, minute=0),
    },
}


@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
