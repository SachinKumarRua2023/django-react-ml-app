#!/bin/bash
# EMERGENCY BACKEND FIX - Run on server NOW

cd /var/www/seekhowithrua/backend || exit 1

echo "Step 1: Pulling latest code..."
git pull origin main

echo "Step 2: Activating virtualenv..."
source venv/bin/activate

echo "Step 3: Running migrations (CRITICAL)..."
python manage.py migrate

echo "Step 4: Checking migrations..."
python manage.py showmigrations ml_apps

echo "Step 5: Restarting backend..."
sudo systemctl restart gunicorn

echo "Done! Testing API..."
sleep 3
curl -s http://localhost:8000/api/syllabus/courses/ | head -c 100
