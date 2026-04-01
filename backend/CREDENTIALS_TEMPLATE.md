# LMS Environment Configuration
## Required Credentials (DO NOT COMMIT THIS FILE)

Copy this to `.env` file in `django-react-ml-app/backend/` and fill in your values.

---

## Email Automation (Gmail SMTP)
```bash
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password  # Gmail App Password, not regular password
DEFAULT_FROM_EMAIL=noreply@seekhowithrua.com
```

**How to get Gmail App Password:**
1. Go to Google Account → Security → 2-Step Verification → Enable
2. Go to Security → App passwords → Generate
3. Select "Mail" → "Other (Custom name)" → Type "SeekhoWithRua LMS"
4. Copy the 16-character password

---

## Payment System (PhonePe / Razorpay)

### Current: PhonePe UPI (Manual Verification)
Currently implemented with manual verification (admin verifies payment screenshots)

**To add UPI QR Code:**
1. Login to PhonePe Business app
2. Go to QR Codes section
3. Download your QR code image
4. Upload to `seekhowithrua-lms/assets/phonepe-qr.png`

### Future: Razorpay Integration (When Ready)
```bash
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxx
```

**To get Razorpay credentials:**
1. Sign up at [razorpay.com](https://razorpay.com)
2. Complete KYC verification
3. Go to Settings → API Keys → Generate Key
4. Copy Key ID and Key Secret

---

## Redis / Celery (For Background Tasks)
```bash
# Local development
REDIS_URL=redis://localhost:6379/0

# Production (Redis Cloud - free tier)
REDIS_URL=redis://redis-xxx.cloud.redislabs.com:18199
REDIS_PASSWORD=your-redis-password
```

**Free Redis hosting:** [redislabs.com](https://redislabs.com) - 30MB free tier

---

## Database (Already Configured)
PostgreSQL on Supabase - already in `settings.py`:
- Host: `aws-1-ap-southeast-2.pooler.supabase.com`
- Already configured ✅

---

## YouTube API (Optional - for playlist sync)
```bash
YOUTUBE_API_KEY=AIzaSxxxxxxxxxxxxxxxxxxx
```

**To get YouTube API Key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project → Enable YouTube Data API v3
3. Create API Key
4. Restrict key to YouTube Data API only

---

## Deployment Checklist

### Before First Deployment:
- [ ] Add Gmail App Password to environment variables
- [ ] Upload PhonePe QR code to assets folder
- [ ] Set up Redis Cloud account (for Celery)
- [ ] Add Redis URL to environment variables
- [ ] Create superuser for Django admin
- [ ] Test email sending from admin panel

### After Deployment:
- [ ] Test student registration flow
- [ ] Test payment submission
- [ ] Verify Celery workers are running
- [ ] Check email delivery in admin logs

---

## Security Notes

⚠️ **NEVER commit this file to GitHub**
⚠️ **NEVER share these credentials**
⚠️ **Rotate passwords regularly**

Add to `.gitignore`:
```
.env
.env.local
.env.production
credentials.md
```

---

## Current Status

| Component | Status | Needs Credentials |
|-----------|--------|------------------|
| Backend Models | ✅ 100% Complete | No |
| API Endpoints | ✅ 100% Complete | No |
| Email Templates | ✅ 100% Complete | Gmail App Password |
| Quiz System | ✅ 100% Complete | No |
| PhonePe QR | ✅ Code Complete | QR Code Image |
| Razorpay | ⏳ Future Feature | Razorpay Keys |
| Celery/Redis | ✅ Code Complete | Redis URL |

---

**Next Step:** Add credentials to your hosting platform's environment variables section (Render, Heroku, etc.)
