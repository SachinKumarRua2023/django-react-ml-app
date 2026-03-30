#!/bin/bash
# FIX BACKEND - Run this on your server

echo "🔧 Fixing Backend Syllabus API..."

cd /var/www/seekhowithrua/backend

# 1. Pull latest code with syllabus feature
echo "📥 Pulling latest code..."
git pull origin main

# 2. Activate virtualenv
source venv/bin/activate

# 3. Install any new dependencies
pip install -r requirements.txt

# 4. 🔴 CRITICAL: Run migrations for syllabus models
echo "🗄️ Running migrations..."
python manage.py migrate

# 5. Check if migrations applied
echo "✅ Verifying migrations..."
python manage.py showmigrations ml_apps

# 6. Restart backend
echo "🔄 Restarting service..."
sudo systemctl restart gunicorn

# 7. Test API
echo "🧪 Testing API..."
sleep 2
curl -s http://localhost:8000/api/syllabus/courses/ || echo "API test failed"

echo "🎉 Backend fix complete!"
