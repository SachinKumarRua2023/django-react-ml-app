"""
Payment API Views for SeekhoWithRua
Stripe and Razorpay integration endpoints
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
import os

from .payment_gateway import PaymentGateway


@api_view(['GET'])
@permission_classes([AllowAny])
def get_payment_keys(request):
    """Get publishable payment keys for frontend"""
    keys = PaymentGateway.get_publishable_keys()
    return Response({
        'stripe_key': keys['stripe_key'],
        'razorpay_key': keys['razorpay_key'],
        'price_inr': keys['price_inr'],
        'price_usd': keys['price_usd'],
        'upi_id': os.environ.get('LMS_UPI_ID', '')
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_stripe_payment(request):
    """Create Stripe PaymentIntent for Bundle Pack"""
    currency = request.data.get('currency', 'usd')
    
    result = PaymentGateway.create_stripe_payment_intent(currency)
    
    if result['success']:
        return Response({
            'client_secret': result['client_secret'],
            'payment_intent_id': result['payment_intent_id'],
            'amount': result['amount'],
            'currency': result['currency']
        })
    else:
        return Response(
            {'error': result['error']},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def create_razorpay_order(request):
    """Create Razorpay order for Bundle Pack - Public access for funnel"""
    amount = request.data.get('amount', 899900)  # Default ₹8,999 in paise
    
    result = PaymentGateway.create_razorpay_order(amount=amount)
    
    if result['success']:
        return Response({
            'order_id': result['order_id'],
            'amount': result['amount'],
            'currency': result['currency'],
            'key_id': result['key_id']
        })
    else:
        return Response(
            {'error': result['error']},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_razorpay_payment(request):
    """Verify Razorpay payment after completion - Public access for funnel"""
    payment_id = request.data.get('payment_id')
    order_id = request.data.get('order_id')
    signature = request.data.get('signature')
    
    if not all([payment_id, order_id, signature]):
        return Response(
            {'error': 'Missing payment verification data'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    is_valid = PaymentGateway.verify_razorpay_payment(
        payment_id, order_id, signature
    )
    
    if is_valid:
        return Response({
            'success': True,
            'message': 'Payment verified successfully',
            'payment_id': payment_id
        })
    else:
        return Response(
            {'error': 'Payment verification failed'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def stripe_webhook(request):
    """Handle Stripe webhook events"""
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    webhook_secret = os.environ.get('STRIPE_WEBHOOK_SECRET', '')
    
    try:
        import stripe
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
        
        # Handle successful payment
        if event['type'] == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            # TODO: Activate bundle pack for user
            # User info should be in metadata
            
        return Response({'status': 'success'})
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
