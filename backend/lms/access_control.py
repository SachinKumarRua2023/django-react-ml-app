"""
Course Access Control & Enrollment Management
Handles secure access verification for paid courses
"""
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import datetime, timedelta
import os

from .models import Enrollment, Payment, Student


def check_bundle_access(user):
    """
    Check if user has active bundle pack access
    Returns True if user has paid for bundle pack
    """
    try:
        # Check for successful bundle pack payments
        bundle_payments = Payment.objects.filter(
            student__user=user,
            payment_type='bundle_pack',
            status='completed',
            verified=True
        )
        
        # Check if any payment is within validity period
        for payment in bundle_payments:
            # Bundle pack is lifetime access or 1 year
            if payment.created_at:
                # Lifetime access - no expiry check needed
                return True
        
        # Also check enrollment records
        enrollments = Enrollment.objects.filter(
            student__user=user,
            course__slug='bundle-pack',
            is_active=True,
            payment_status='paid'
        )
        
        return enrollments.exists() or bundle_payments.exists()
        
    except Exception as e:
        print(f"Bundle access check error: {e}")
        return False


def check_course_access(user, course_slug):
    """
    Check if user has access to specific course
    Returns dict with access info
    """
    try:
        # First check if user has bundle access (gives access to all courses)
        if check_bundle_access(user):
            return {
                'has_access': True,
                'access_type': 'bundle',
                'course_slug': course_slug,
                'expires_at': None  # Lifetime
            }
        
        # Check specific course enrollment
        enrollment = Enrollment.objects.filter(
            student__user=user,
            course__slug=course_slug,
            is_active=True,
            payment_status='paid'
        ).first()
        
        if enrollment:
            return {
                'has_access': True,
                'access_type': 'individual',
                'course_slug': course_slug,
                'enrolled_at': enrollment.enrolled_at,
                'expires_at': enrollment.expires_at
            }
        
        # Check for pending payment
        pending_payment = Payment.objects.filter(
            student__user=user,
            course__slug=course_slug,
            status='pending'
        ).first()
        
        if pending_payment:
            return {
                'has_access': False,
                'access_type': None,
                'course_slug': course_slug,
                'pending_payment': True,
                'payment_id': pending_payment.id
            }
        
        return {
            'has_access': False,
            'access_type': None,
            'course_slug': course_slug
        }
        
    except Exception as e:
        print(f"Course access check error: {e}")
        return {'has_access': False, 'error': str(e)}


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_access(request):
    """
    API endpoint to check course access for logged in user
    GET /api/lms/enrollment/check-access/?course=ai-course
    """
    course_slug = request.GET.get('course')
    
    if not course_slug:
        return Response(
            {'error': 'Course slug required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    access_info = check_course_access(request.user, course_slug)
    
    return Response(access_info)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_courses(request):
    """
    Get all courses the user has access to
    GET /api/lms/enrollment/my-courses/
    """
    user = request.user
    
    # Check if has bundle access
    has_bundle = check_bundle_access(user)
    
    if has_bundle:
        # Return all courses with bundle flag
        return Response({
            'has_bundle_access': True,
            'access_type': 'bundle_pack',
            'all_courses': True,
            'courses': []
        })
    
    # Get individual course enrollments
    enrollments = Enrollment.objects.filter(
        student__user=user,
        is_active=True,
        payment_status='paid'
    ).select_related('course')
    
    courses_data = []
    for enrollment in enrollments:
        courses_data.append({
            'slug': enrollment.course.slug,
            'title': enrollment.course.title,
            'enrolled_at': enrollment.enrolled_at,
            'progress': enrollment.progress,
            'expires_at': enrollment.expires_at
        })
    
    return Response({
        'has_bundle_access': False,
        'access_type': 'individual',
        'all_courses': False,
        'courses': courses_data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enroll_bundle_pack(request):
    """
    Enroll user in bundle pack after successful payment
    POST /api/lms/enrollment/enroll-bundle/
    """
    user = request.user
    payment_id = request.data.get('payment_id')
    
    try:
        # Verify payment exists and is completed
        payment = Payment.objects.get(
            id=payment_id,
            student__user=user,
            status='completed',
            verified=True
        )
        
        # Create or update enrollment
        student, _ = Student.objects.get_or_create(
            user=user,
            defaults={'email': user.email}
        )
        
        enrollment, created = Enrollment.objects.get_or_create(
            student=student,
            course__slug='bundle-pack',
            defaults={
                'payment_status': 'paid',
                'is_active': True,
                'enrolled_at': timezone.now()
            }
        )
        
        if not created:
            enrollment.payment_status = 'paid'
            enrollment.is_active = True
            enrollment.save()
        
        # Link payment to enrollment
        payment.enrollment = enrollment
        payment.save()
        
        return Response({
            'success': True,
            'message': 'Bundle pack activated successfully',
            'enrollment_id': enrollment.id,
            'has_bundle_access': True
        })
        
    except Payment.DoesNotExist:
        return Response(
            {'error': 'Payment not found or not verified'},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class CourseAccessMiddleware:
    """
    Middleware to protect course content API endpoints
    Checks if user has valid access before serving content
    """
    
    PROTECTED_PATHS = [
        '/api/courses/content/',
        '/api/courses/videos/',
        '/api/courses/materials/',
        '/api/courses/lessons/',
    ]
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Check if path is protected
        path = request.path
        is_protected = any(path.startswith(protected) for protected in self.PROTECTED_PATHS)
        
        if is_protected and request.user.is_authenticated:
            # Extract course slug from request
            course_slug = request.GET.get('course') or request.POST.get('course')
            
            if course_slug:
                access_info = check_course_access(request.user, course_slug)
                
                if not access_info['has_access']:
                    from django.http import JsonResponse
                    return JsonResponse({
                        'error': 'Access denied. Please purchase this course.',
                        'has_access': False,
                        'purchase_url': '/api/lms/payment/keys/'
                    }, status=403)
        
        response = self.get_response(request)
        return response
