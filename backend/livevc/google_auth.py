"""
Google OAuth verification for SeekhoWithRua.
Verifies Google ID token and returns/creates Django user.
"""
import os
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from .models import UserProfile


GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', '')


def verify_google_token(token_str):
    """
    Verifies Google ID token.
    Returns user dict on success, raises ValueError on failure.
    """
    try:
        id_info = id_token.verify_oauth2_token(
            token_str,
            google_requests.Request(),
            GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=10,
        )
        return id_info
    except Exception as e:
        raise ValueError(f"Invalid Google token: {e}")


def get_or_create_google_user(id_info, role='learner'):
    """
    Gets existing user or creates new one from Google profile.
    Returns (user, token, created).
    """
    email      = id_info.get('email', '').lower().strip()
    first_name = id_info.get('given_name', '')
    last_name  = id_info.get('family_name', '')
    google_id  = id_info.get('sub', '')
    avatar_url = id_info.get('picture', '')

    if not email:
        raise ValueError("Google account has no email")

    # Try to find existing user by email
    try:
        user = User.objects.get(email=email)
        created = False
    except User.DoesNotExist:
        # Create new user
        username = email.split('@')[0]
        base     = username
        counter  = 1
        while User.objects.filter(username=username).exists():
            username = f"{base}{counter}"
            counter += 1

        user = User.objects.create_user(
            username=username,
            email=email,
            password=None,  # No password — Google auth only
            first_name=first_name,
            last_name=last_name,
        )
        created = True

    # Update or create profile
    profile, _ = UserProfile.objects.get_or_create(user=user)
    if google_id:
        profile.google_id = google_id
    if avatar_url and not profile.avatar_url:
        profile.avatar_url = avatar_url
    if created and role in ['trainer', 'learner']:
        profile.role = role
    profile.save()

    # Get or create auth token
    token, _ = Token.objects.get_or_create(user=user)

    return user, token, created