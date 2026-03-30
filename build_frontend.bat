@echo off
REM FRONTEND BUILD SCRIPT - Run this on your Windows machine

echo 🚀 Starting Frontend Build...

REM 1. Navigate to frontend
cd "C:\Users\Sachin Kumar\OneDrive\Desktop\Full Stack Dev Tutorials\projects\django-react-ml-app\frontend"

REM 2. Install dependencies
echo 📦 Installing dependencies...
npm install

REM 3. Build
echo 🔨 Building production bundle...
npm run build

REM 4. Check build success
if exist "dist\index.html" (
    echo ✅ Build successful!
    echo.
    echo Next steps:
    echo 1. Upload 'dist' folder contents to your server
    echo 2. Or use: scp -r dist/* root@your-server:/var/www/seekhowithrua/frontend/
    echo.
    echo 📁 Build location: %CD%\dist\
) else (
    echo ❌ Build failed! Check errors above.
)

pause
