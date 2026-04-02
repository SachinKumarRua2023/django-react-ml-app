#!/usr/bin/env python
"""
Reset password for master@gmail.com
Usage: python reset_master_password.py
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
django.setup()

from users.models import User

def reset_master_password():
    """Reset password for master@gmail.com to 'Master@123'"""
    email = 'master@gmail.com'
    new_password = 'Master@123'
    
    try:
        # Try to get existing user
        user = User.objects.get(email=email)
        print(f"Found existing user: {user.username} ({user.email})")
        
        # Set new password
        user.set_password(new_password)
        user.save()
        print(f"[OK] Password reset successfully for {email}")
        print(f"   New password: {new_password}")
        
    except User.DoesNotExist:
        # Create new user if doesn't exist
        print(f"User {email} not found. Creating new user...")
        
        username = 'master'
        user = User.objects.create_user(
            username=username,
            email=email,
            password=new_password,
            first_name='Master',
            last_name='Rua',
            is_staff=True,
            is_superuser=True
        )
        print(f"[OK] Created new user: {user.username} ({user.email})")
        print(f"   Password: {new_password}")
        print(f"   Staff: {user.is_staff}")
        print(f"   Superuser: {user.is_superuser}")
    
    return True

if __name__ == '__main__':
    print("=" * 50)
    print("Master Password Reset Tool")
    print("=" * 50)
    
    success = reset_master_password()
    
    if success:
        print("\n[OK] Done! You can now login with:")
        print("   Email: master@gmail.com")
        print("   Password: Master@123")
    else:
        print("\n[FAILED] Failed to reset password")
        sys.exit(1)
