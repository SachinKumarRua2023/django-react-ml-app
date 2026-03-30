#!/bin/bash
# BACKEND DEPLOY SCRIPT - Run this on your server

echo "🚀 Starting Backend Deployment..."

# 1. Navigate to backend
cd /var/www/seekhowithrua/backend || exit 1

# 2. Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# 3. Activate virtualenv
echo "🐍 Activating virtual environment..."
source venv/bin/activate

# 4. Install dependencies (if any new ones)
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# 5. Run migrations
echo "🗄️ Running database migrations..."
python manage.py migrate

# 6. Restart service
echo "🔄 Restarting backend service..."
sudo systemctl restart gunicorn

# 7. Check status
echo "✅ Checking service status..."
sudo systemctl status gunicorn --no-pager

echo "🎉 Backend deployment complete!"
echo ""
echo "Test API:"
echo "curl https://api.seekhowithrua.com/api/syllabus/courses/"
