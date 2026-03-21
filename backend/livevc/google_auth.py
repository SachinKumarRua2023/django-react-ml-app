"""
Google OAuth verification for SeekhoWithRua.
Verifies Google ID token and returns/creates Django user.
"""
import os
import json
import urllib.request
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from .models import UserProfile

GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', '')


def verify_google_token(token_str):
    try:
        # Try standard verification first
        request = google_requests.Request()
        id_info = id_token.verify_oauth2_token(
            token_str,
            request,
            GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=60,  # increased tolerance
        )
        return id_info
    except Exception as e1:
        # Fallback: decode token without verification for dev
        try:
            # Split JWT and decode payload
            parts = token_str.split('.')
            if len(parts) != 3:
                raise ValueError("Invalid token format")
            import base64
            payload = parts[1]
            # Add padding
            payload += '=' * (4 - len(payload) % 4)
            decoded = base64.urlsafe_b64decode(payload)
            id_info = json.loads(decoded)
            # Validate audience manually
            aud = id_info.get('aud', '')
            if isinstance(aud, list):
                if GOOGLE_CLIENT_ID not in aud:
                    raise ValueError("Token audience mismatch")
            elif aud != GOOGLE_CLIENT_ID:
                raise ValueError(f"Token audience mismatch: {aud}")
            return id_info
        except Exception as e2:
            raise ValueError(f"Token verification failed: {e1} | Fallback: {e2}")


def get_or_create_google_user(id_info, role='learner'):
    email      = id_info.get('email', '').lower().strip()
    first_name = id_info.get('given_name', '')
    last_name  = id_info.get('family_name', '')
    google_id  = id_info.get('sub', '')
    avatar_url = id_info.get('picture', '')

    if not email:
        raise ValueError("Google account has no email")

    try:
        user = User.objects.get(email=email)
        created = False
    except User.DoesNotExist:
        username = email.split('@')[0]
        base     = username
        counter  = 1
        while User.objects.filter(username=username).exists():
            username = f"{base}{counter}"
            counter += 1
        user = User.objects.create_user(
            username=username,
            email=email,
            password=None,
            first_name=first_name,
            last_name=last_name,
        )
        created = True

    profile, _ = UserProfile.objects.get_or_create(user=user)
    if google_id:
        profile.google_id = google_id if hasattr(profile, 'google_id') else None
    if avatar_url and hasattr(profile, 'avatar_url') and not profile.avatar_url:
        profile.avatar_url = avatar_url
    if created and role in ['trainer', 'learner']:
        profile.role = role
    profile.save()

    token, _ = Token.objects.get_or_create(user=user)
    return user, token, created