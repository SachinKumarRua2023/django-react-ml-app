"""
Payment Integration Module for SeekhoWithRua
Supports Stripe (International) and Razorpay (India)
"""
import os
import stripe
import razorpay
from typing import Dict, Any, Optional

# Initialize payment clients
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY', '')
razorpay_client = razorpay.Client(
    auth=(
        os.environ.get('RAZORPAY_KEY_ID', ''),
        os.environ.get('RAZORPAY_KEY_SECRET', '')
    )
) if os.environ.get('RAZORPAY_KEY_ID') else None

class PaymentGateway:
    """Unified payment gateway for SeekhoWithRua"""
    
    BUNDLE_PACK_PRICE_INR = 29900  # ₹299 in paise
    BUNDLE_PACK_PRICE_USD = 9900  # $99 in cents
    
    @classmethod
    def create_stripe_payment_intent(cls, currency: str = 'usd') -> Dict[str, Any]:
        """Create a Stripe PaymentIntent for Bundle Pack"""
        amount = cls.BUNDLE_PACK_PRICE_USD if currency == 'usd' else cls.BUNDLE_PACK_PRICE_INR
        
        try:
            intent = stripe.PaymentIntent.create(
                amount=amount,
                currency=currency,
                metadata={
                    'product': 'bundle_pack',
                    'description': 'SeekhoWithRua Complete Bundle Pack'
                },
                automatic_payment_methods={'enabled': True}
            )
            return {
                'success': True,
                'client_secret': intent.client_secret,
                'payment_intent_id': intent.id,
                'amount': amount,
                'currency': currency
            }
        except stripe.error.StripeError as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    @classmethod
    def create_razorpay_order(cls, amount: int = None) -> Dict[str, Any]:
        """Create a Razorpay order for Bundle Pack (India)"""
        if not razorpay_client:
            return {
                'success': False,
                'error': 'Razorpay not configured'
            }
        
        # Use provided amount or default
        order_amount = amount if amount else cls.BUNDLE_PACK_PRICE_INR
        
        try:
            order_data = {
                'amount': order_amount,
                'currency': 'INR',
                'receipt': 'bundle_pack_order',
                'notes': {
                    'product': 'bundle_pack',
                    'description': 'SeekhoWithRua Complete Bundle Pack'
                }
            }
            order = razorpay_client.order.create(data=order_data)
            return {
                'success': True,
                'order_id': order['id'],
                'amount': order['amount'],
                'currency': order['currency'],
                'key_id': os.environ.get('RAZORPAY_KEY_ID', '')
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    @classmethod
    def verify_razorpay_payment(cls, payment_id: str, order_id: str, signature: str) -> bool:
        """Verify Razorpay payment signature"""
        if not razorpay_client:
            return False
        
        try:
            params_dict = {
                'razorpay_payment_id': payment_id,
                'razorpay_order_id': order_id,
                'razorpay_signature': signature
            }
            razorpay_client.utility.verify_payment_signature(params_dict)
            return True
        except Exception:
            return False
    
    @classmethod
    def get_publishable_keys(cls) -> Dict[str, str]:
        """Get publishable keys for frontend"""
        return {
            'stripe_key': os.environ.get('STRIPE_PUBLISHABLE_KEY', ''),
            'razorpay_key': os.environ.get('RAZORPAY_KEY_ID', ''),
            'price_inr': cls.BUNDLE_PACK_PRICE_INR,
            'price_usd': cls.BUNDLE_PACK_PRICE_USD
        }
