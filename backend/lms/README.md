# SeekhoWithRua LMS Backend

Django backend extension for the Learning Management System with student/course management, YouTube video integration, automated email workflows, PhonePe UPI payment tracking, and multi-tier referral system.

## Features

- **Student Management** - Registration, profiles, grades (7-10th)
- **Course Management** - YouTube playlist integration, class sessions
- **Payment System** - PhonePe UPI/QR with screenshot verification
- **Referral System** - Automatic fee concessions (₹200 per referral)
- **Email Automation** - Celery-based scheduled emails
- **Attendance Tracking** - Mark and monitor student attendance
- **Test Management** - Tests, results, rankings
- **Admin Dashboard** - Full CRUD operations, payment verification

## Database Models

1. **Student** - Student profiles with referral tracking
2. **Course** - Course information with YouTube playlists
3. **ClassSession** - Individual class sessions with video IDs
4. **Attendance** - Student attendance records
5. **Test/TestResult** - Tests and student results with ranking
6. **Payment** - Payment records with PhonePe verification
7. **ReferralTracking** - Referral relationships and concessions
8. **EmailLog** - Email delivery tracking
9. **StudentEnrollment** - Course enrollments

## API Endpoints

All endpoints are prefixed with `/api/lms/`

### Students
- `GET /api/lms/students/` - List students (Admin)
- `POST /api/lms/students/` - Register new student
- `GET /api/lms/students/me/` - Current student profile

### Courses
- `GET /api/lms/courses/` - List courses
- `POST /api/lms/courses/{id}/enroll/` - Enroll in course

### Class Sessions
- `GET /api/lms/sessions/` - List sessions
- `POST /api/lms/sessions/{id}/mark_attendance/` - Mark attendance
- `GET /api/lms/sessions/{id}/video_url/` - Get YouTube video URL

### Payments
- `GET /api/lms/payments/` - List payments
- `POST /api/lms/payments/` - Submit payment
- `POST /api/lms/payments/{id}/verify/` - Admin verify payment

### Tests
- `GET /api/lms/tests/` - List tests
- `POST /api/lms/tests/{id}/submit_marks/` - Submit test marks

### Referrals
- `GET /api/lms/referrals/` - My referrals
- `GET /api/lms/referrals/stats/` - Referral statistics

### Dashboard
- `GET /api/lms/dashboard/student/` - Student dashboard
- `GET /api/lms/dashboard/admin/` - Admin dashboard

## Referral System Logic

```
Base Fee: ₹1000/month

Referral Tiers:
- 1 referral  = ₹200 concession (₹800 fee)
- 5 referrals = ₹1000 concession (FREE education)
- 10+ referrals = Earn ₹200-500 per referral
```

## Automated Email Schedule

| Task | Schedule | Description |
|------|----------|-------------|
| Payment Reminders | 7th-10th, 9:00 AM | Monthly fee reminders |
| Class Reminders | Every hour | 24h and 1h before classes |
| Absence Check | Daily 6:00 PM | 3+ days absence alert |
| Feedback Forms | Daily 8:00 PM | Post-class feedback |

## Setup Instructions

### 1. Install Dependencies
```bash
pip install celery django-celery-beat django-celery-results
```

### 2. Run Migrations
```bash
cd backend
python manage.py makemigrations lms
python manage.py migrate
```

### 3. Start Redis (for Celery)
```bash
# Windows
redis-server

# Or use Redis Cloud URL in production
```

### 4. Start Celery Worker
```bash
celery -A backend worker -l info
```

### 5. Start Celery Beat (Scheduler)
```bash
celery -A backend beat -l info
```

### 6. Environment Variables
```bash
# Gmail SMTP (for emails)
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Redis (for Celery)
REDIS_URL=redis://localhost:6379/0
```

## Admin Interface

Access at `/admin/` with superuser credentials:

- Manage all students, courses, sessions
- Verify payments and send receipts
- Mark attendance in bulk
- Upload test marks
- View email logs
- Monitor referrals

## File Structure

```
lms/
├── models.py           # All database models
├── admin.py            # Django admin configuration
├── serializers.py      # DRF serializers
├── views.py            # API viewsets
├── urls.py             # URL routing
├── tasks.py            # Celery background tasks
├── email_service.py    # Email sending functions
└── templates/
    └── lms/emails/     # Email templates
```

## Integration with Main Platform

The LMS integrates with the existing SeekhoWithRua ecosystem:
- Uses existing `users.User` model
- Shares authentication tokens
- Available at `/api/lms/` endpoint
- Admin accessible from main Django admin

---

Built by Master Rua for SeekhoWithRua Coaching
