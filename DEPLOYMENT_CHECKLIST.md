# DEPLOYMENT CHECKLIST - Syllabus Feature

## Backend Deployment (Django API)

### Step 1: SSH to Your Server
```bash
ssh root@your-server-ip
# or however you access your server
```

### Step 2: Navigate to Backend
```bash
cd /var/www/seekhowithrua/backend  # adjust path as needed
git pull origin main  # pull latest changes
```

### Step 3: Run Migrations
```bash
source venv/bin/activate  # activate virtualenv
python manage.py migrate
# Should show: Applying ml_apps.0001_initial... OK
```

### Step 4: Restart Backend
```bash
# If using gunicorn with systemd
sudo systemctl restart gunicorn
# or
sudo systemctl restart seekhowithrua-backend

# Check status
sudo systemctl status gunicorn
```

### Step 5: Verify API
```bash
curl https://api.seekhowithrua.com/api/syllabus/courses/
# Should return: [] or course data (JSON)
```

---

## Frontend Deployment (React)

### Step 1: Build Frontend
```bash
# On your local machine
cd C:\Users\Sachin Kumar\OneDrive\Desktop\Full Stack Dev Tutorials\projects\django-react-ml-app\frontend
npm install  # ensure dependencies installed
npm run build
```

### Step 2: Upload Build Files
```bash
# Option 1: Using SCP (from local machine terminal)
scp -r dist/* root@your-server:/var/www/seekhowithrua/frontend/

# Option 2: Using FTP/SFTP tool like FileZilla
# Upload frontend/dist contents to /var/www/seekhowithrua/frontend/

# Option 3: If using Git
git push origin main
# Then on server:
cd /var/www/seekhowithrua/frontend
git pull
npm install
npm run build
```

### Step 3: Clear CDN/Cache (IMPORTANT!)
```bash
# If using CloudFlare
# Login to CloudFlare dashboard → Caching → Purge Everything

# If using Nginx
sudo systemctl restart nginx

# If browser cache
# Open DevTools → Network tab → Check "Disable cache" → Reload
```

---

## Quick Test After Deploy

1. Open https://app.seekhowithrua.com/syllabus
2. Hard refresh: **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)
3. Check console for errors
4. Verify: "Edit Content" button should NOT appear for non-master users
5. Login as master@gmail.com
6. Verify: "✏️ Edit Courses" button SHOULD appear

---

## If Still Not Working

### Check 1: Verify API is working
```bash
curl https://api.seekhowithrua.com/api/syllabus/courses/
```
**If 404**: Backend not deployed properly
**If []**: Working but no data (need to add test data)

### Check 2: Check frontend is using correct API URL
```bash
# On server
cat /var/www/seekhowithrua/frontend/assets/*.js | grep "api.seekhowithrua"
# Should find: https://api.seekhowithrua.com/api
```

### Check 3: Browser cache
- Open DevTools → Application → Storage → Clear site data
- Or try in Incognito/Private window

---

## Emergency Rollback

If something breaks:
```bash
cd /var/www/seekhowithrua/backend
git revert HEAD  # revert last commit
python manage.py migrate
sudo systemctl restart gunicorn
```

---

## Support

If stuck, check these logs:
```bash
# Backend errors
sudo tail -f /var/log/gunicorn/error.log
# or
sudo journalctl -u gunicorn -f

# Nginx errors
sudo tail -f /var/log/nginx/error.log
```
