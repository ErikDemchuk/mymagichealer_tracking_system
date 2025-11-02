# 🔐 Environment Variables - Vercel Setup Checklist

## ⚡ Quick Setup (Copy these to Vercel)

**Go to:** Vercel Dashboard → Your Project → Settings → Environment Variables

### Required Variables (Production + Preview + Development)

| Variable Name | Description | Example Value |
|--------------|-------------|---------------|
| `STORAGE_MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `OPENAI_API_KEY` | OpenAI API key for chat | `sk-proj-...` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth Client ID | `123456.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret | `GOCSPX-...` |
| `SESSION_PASSWORD` | 32-char random string | Generate with command below |
| `NODE_ENV` | Environment | `production` |

---

## 🔑 Generate SESSION_PASSWORD

Run this in PowerShell:
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

Or online: https://www.random.org/strings/?num=1&len=32&digits=on&upperalpha=on&loweralpha=on&unique=on&format=html&rnd=new

---

## 📋 Current Status

- [x] Code fixed (layout.tsx added)
- [x] Code pushed to GitHub
- [ ] **Add environment variables to Vercel** ← YOU ARE HERE
- [ ] Setup MongoDB Atlas
- [ ] Setup Google OAuth
- [ ] Test deployment

---

## 🚨 Critical: Add These Now

Without these variables, your app will:
- ❌ Fail to connect to MongoDB
- ❌ Google login won't work
- ❌ Session cookies won't work
- ❌ OpenAI chat responses won't work

---

## 📱 How to Add in Vercel

1. Go to https://vercel.com/dashboard
2. Click your project
3. Settings → Environment Variables
4. For each variable:
   - Enter **Key** (e.g., `STORAGE_MONGODB_URI`)
   - Enter **Value** (your actual value)
   - Select **All environments** (Production, Preview, Development)
   - Click **Save**

---

## ✅ After Adding Variables

1. Go to **Deployments** tab
2. Click **Redeploy** on latest deployment
3. Wait ~1 minute for build
4. Visit https://nicareplus.com
5. Should see login screen (no more 404!)

---

## 🔗 Quick Links

- [Get MongoDB Connection String](https://www.mongodb.com/docs/guides/atlas/connection-string/)
- [Create Google OAuth Credentials](https://console.cloud.google.com/apis/credentials)
- [Get OpenAI API Key](https://platform.openai.com/api-keys)

---

## 💡 Pro Tips

1. **MongoDB**: Use MongoDB Atlas free tier (no credit card needed)
2. **Google OAuth**: Add both localhost and production URLs
3. **OpenAI**: Start with free tier ($5 credit)
4. **SESSION_PASSWORD**: Never share this or commit to git

---

## 🐛 If Still Getting Errors

Check Vercel logs:
1. Deployments → Latest deployment
2. Click on **Function Logs** or **Build Logs**
3. Look for missing environment variable errors
4. Add any missing variables and redeploy




