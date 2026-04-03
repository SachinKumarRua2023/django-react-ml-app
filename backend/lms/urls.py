from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import payment_views
from . import access_control


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
    # Payment Gateway URLs
    path('payment/keys/', payment_views.get_payment_keys, name='payment-keys'),
    path('payment/stripe/create/', payment_views.create_stripe_payment, name='stripe-create'),
    path('payment/razorpay/create/', payment_views.create_razorpay_order, name='razorpay-create'),
    path('payment/razorpay/verify/', payment_views.verify_razorpay_payment, name='razorpay-verify'),
    path('payment/stripe/webhook/', payment_views.stripe_webhook, name='stripe-webhook'),
    # Access Control URLs
    path('enrollment/check-access/', access_control.check_access, name='check-access'),
    path('enrollment/my-courses/', access_control.my_courses, name='my-courses'),
    path('enrollment/enroll-bundle/', access_control.enroll_bundle_pack, name='enroll-bundle'),
]
