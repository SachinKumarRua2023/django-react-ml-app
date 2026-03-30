#!/bin/bash
# STARTUP SCRIPT FOR RENDER - Auto-runs migrations on deploy

echo "🚀 Render Startup Script"
echo "Running database migrations..."

python manage.py migrate --noinput

echo "✅ Migrations complete!"
echo "Starting Gunicorn..."

# Start the actual server
exec gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT
