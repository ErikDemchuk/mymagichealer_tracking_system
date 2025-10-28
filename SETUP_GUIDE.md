# 🚀 Quick Setup Guide - Production Tracking

## ✅ Fix Applied

**Problem:** 404 error on production deployment  
**Cause:** Missing root `layout.tsx` file required by Next.js 16  
**Fix:** Created `src/app/layout.tsx` and `src/app/globals.css`

---

## 📋 Environment Variables Setup

### Step 1: Create `.env.local` file (for local development)

Create a `.env.local` file in the root directory with:

```env
# MongoDB Connection
STORAGE_MONGODB_URI=your-mongodb-connection-string-here

# OpenAI API Key
OPENAI_API_KEY=your-openai-api-key-here

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# Session Security (generate a 32-character random string)
SESSION_PASSWORD=your-32-character-random-string-here

# Next.js
NODE_ENV=development
```

### Step 2: Add Environment Variables to Vercel

Go to your Vercel project → Settings → Environment Variables and add:

1. **STORAGE_MONGODB_URI** - Your MongoDB connection string
2. **OPENAI_API_KEY** - Your OpenAI API key
3. **NEXT_PUBLIC_GOOGLE_CLIENT_ID** - Your Google OAuth Client ID
4. **GOOGLE_CLIENT_SECRET** - Your Google OAuth Client Secret
5. **SESSION_PASSWORD** - A 32-character random string for session encryption
6. **NODE_ENV** - Set to `production`

---

## 🔧 MongoDB Setup

### Option 1: MongoDB Atlas (Recommended for Production)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist Vercel's IP addresses (or use `0.0.0.0/0` for all)
5. Get your connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/production-tracking?retryWrites=true&w=majority
   ```

### Option 2: Local MongoDB (Development Only)

```bash
# Install MongoDB locally
# Windows: Download from https://www.mongodb.com/try/download/community
# Mac: brew install mongodb-community
# Linux: sudo apt-get install mongodb

# Connection string for local:
mongodb://localhost:27017/production-tracking
```

---

## 🔐 Google OAuth Setup

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen
6. Application type: **Web application**
7. Add authorized JavaScript origins:
   - `http://localhost:3000` (for dev)
   - `https://nicareplus.com` (for production)
   - `https://production-tracking-git-master-erik-demchuks-projects.vercel.app` (Vercel preview)
8. Add authorized redirect URIs:
   - `http://localhost:3000` (for dev)
   - `https://nicareplus.com` (for production)
   - `https://production-tracking-git-master-erik-demchuks-projects.vercel.app` (Vercel preview)
9. Copy **Client ID** and **Client Secret**

### Step 2: Add Google Credentials to Environment

Add to `.env.local` and Vercel:
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

---

## 🚀 Deployment Steps

### 1. Test Locally First

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Visit http://localhost:3000
```

### 2. Deploy to Vercel

```bash
# Build the project
npm run build

# Test the build locally
npm run start

# Deploy to Vercel
git add .
git commit -m "Fix: Add layout.tsx and globals.css for Next.js 16"
git push

# Vercel will auto-deploy from your git repository
```

### 3. Verify Deployment

1. Check Vercel deployment logs
2. Visit your domain: `https://nicareplus.com`
3. Should see the chat interface with Google login

---

## ✨ What's Working Now

✅ Root layout.tsx - Required for Next.js 16  
✅ Global CSS - Tailwind styling  
✅ Google OAuth - Sign in with Google  
✅ Email login - Simple email-based auth  
✅ Session management - Cookie-based sessions  
✅ MongoDB integration - Chat storage ready  
✅ Chat interface - ChatGPT-like UI  
✅ API routes - All endpoints configured  

---

## 🧪 Testing

### Test Google Login
1. Visit your site
2. Click "Continue with Google"
3. Sign in with Google account
4. Should redirect to chat interface

### Test Email Login
1. Visit your site
2. Enter your email
3. Click "Continue"
4. Should redirect to chat interface

### Test Chat Creation
1. After login, you should see chat interface
2. Type a message
3. Chat should be saved to MongoDB
4. Check MongoDB to verify

---

## 🐛 Troubleshooting

### Still Getting 404?
- Clear Vercel cache and redeploy
- Check build logs in Vercel
- Verify all environment variables are set

### Google Login Not Working?
- Check Google OAuth credentials
- Verify authorized origins/redirects
- Check browser console for errors

### MongoDB Connection Failed?
- Verify connection string format
- Check IP whitelist in MongoDB Atlas
- Test connection string locally

### Session Not Persisting?
- Verify SESSION_PASSWORD is set
- Check browser cookies are enabled
- Check cookie domain settings

---

## 📞 Next Steps

1. Add environment variables to Vercel
2. Set up MongoDB Atlas
3. Configure Google OAuth
4. Redeploy to Vercel
5. Test login flow
6. Start using the app!

---

## 🔗 Useful Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Next.js Documentation](https://nextjs.org/docs)

