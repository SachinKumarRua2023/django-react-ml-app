import os
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import django
django.setup()

from django.db import connection

# Drop tables that conflict
tables_to_drop = [
    'livevc_handraiserequest',
    'livevc_panelmember',
    'livevc_userprofile', 
    'livevc_voicepanel',
    'voice_rooms_follow',
    'voice_rooms_upvote',
    'voice_rooms_userrankscore',
    'voice_rooms_panelsession',
    'voice_rooms_userpanelhistory',
    'voice_rooms_panelcooccurrence',
    'voice_rooms_voiceroomprofile',
]

with connection.cursor() as cursor:
    for table in tables_to_drop:
        try:
            cursor.execute(f'DROP TABLE IF EXISTS {table} CASCADE;')
            print(f'Dropped: {table}')
        except Exception as e:
            print(f'Error dropping {table}: {e}')
    
    # Clear django_migrations for our apps and admin (to fix dependency order)
    cursor.execute("DELETE FROM django_migrations WHERE app IN ('users', 'livevc', 'voice_rooms', 'admin', 'contenttypes');")
    print('Cleared migration records')

print('Database reset complete')
