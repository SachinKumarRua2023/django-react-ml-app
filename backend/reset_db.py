import os
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import django
django.setup()

from django.db import connection

# Drop ALL tables automatically
with connection.cursor() as cursor:
    # Get all table names
    cursor.execute("""
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT LIKE 'pg_%' 
        AND tablename NOT LIKE 'sql_%'
    """)
    tables = [row[0] for row in cursor.fetchall()]
    
    print(f"Found {len(tables)} tables to drop:")
    for table in tables:
        try:
            cursor.execute(f'DROP TABLE IF EXISTS "{table}" CASCADE;')
            print(f'  Dropped: {table}')
        except Exception as e:
            print(f'  Error dropping {table}: {e}')

print('\nDatabase reset complete - all tables dropped')
