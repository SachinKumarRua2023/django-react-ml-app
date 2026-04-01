from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views


router = DefaultRouter()
router.register(r'students', views.StudentViewSet, basename='student')
router.register(r'courses', views.CourseViewSet, basename='course')
router.register(r'sessions', views.ClassSessionViewSet, basename='session')
router.register(r'attendance', views.AttendanceViewSet, basename='attendance')
router.register(r'tests', views.TestViewSet, basename='test')
router.register(r'payments', views.PaymentViewSet, basename='payment')
router.register(r'referrals', views.ReferralViewSet, basename='referral')
router.register(r'dashboard', views.DashboardViewSet, basename='dashboard')
router.register(r'email-logs', views.EmailLogViewSet, basename='email-log')
router.register(r'quizzes', views.QuizViewSet, basename='quiz')
router.register(r'enrollment', views.EnrollmentViewSet, basename='enrollment')


urlpatterns = [
    path('', include(router.urls)),
]
