#!/bin/bash
# RENDER BUILD SCRIPT - Runs on every deploy

echo "🚀 Render Build Starting..."

# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# 🔴 CRITICAL: Run migrations
echo "🗄️ Running database migrations..."
python manage.py migrate --noinput

echo "✅ Build complete!"
