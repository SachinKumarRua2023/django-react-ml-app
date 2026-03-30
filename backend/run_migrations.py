#!/usr/bin/env python3
"""
MIGRATION HELPER - Run this once on Render to create database tables
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.insert(0, '/opt/render/project/src/backend')

django.setup()

from django.core.management import call_command

print("🚀 Running migrations...")
call_command('migrate', '--noinput')
print("✅ Migrations complete!")

# Verify tables exist
from django.db import connection
with connection.cursor() as cursor:
    cursor.execute("""
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename LIKE 'ml_apps_%'
    """)
    tables = cursor.fetchall()
    print(f"📊 Found tables: {[t[0] for t in tables]}")
