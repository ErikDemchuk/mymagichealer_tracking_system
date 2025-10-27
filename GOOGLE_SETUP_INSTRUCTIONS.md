# 🚨 CRITICAL: Google OAuth Setup Instructions

## ⚠️ **IMPORTANT: Fix Your Redirect URIs!**

Your Google OAuth is configured with **OLD SUPABASE REDIRECT** which won't work anymore!

## 🔧 **What You Need To Do:**

### **Step 1: Update Google Cloud Console**

Go back to your Google OAuth settings:
https://console.cloud.google.com/apis/credentials/oauthclient/293328947211-6uc16de0smqrlo9gqruh7phv6f80936.apps.googleusercontent.com

### **Step 2: Remove Old Supabase Redirect URI**

❌ **DELETE THIS:**
```
https://jcyuopxypvvtwuxdyltp.supabase.co/auth/v1/callback
```

### **Step 3: Your Authorized JavaScript Origins Should Be:**

✅ Keep these (looks correct in your screenshot):
```
https://production-tracking-erik-demchuks-projects.vercel.app
```

💡 **Also add localhost for testing:**
```
http://localhost:3000
```

### **Step 4: Authorized Redirect URIs**

Since you're using **Google One Tap** (not traditional OAuth flow), you actually **DON'T need redirect URIs** for this setup! 

You can either:
- **Option A:** Leave it empty (Google One Tap works without it)
- **Option B:** Remove the old Supabase URI entirely

Click **Save** in Google Cloud Console!

---

## 🔑 **Step 5: Get Your Client Secret**

In your screenshot, I see the client secret is partially hidden (`****_FWV`).

1. Click the **download icon** next to the secret
2. Copy the full client secret
3. Save it somewhere secure temporarily

---

## 🌐 **Step 6: Add Environment Variables to Vercel**

Go to: https://vercel.com/erik-demchuks-projects/production-tracking/settings/environment-variables

Add these **3 variables** (All Environments):

### **1. STORAGE_MONGODB_URI**
```
mongodb+srv://Vercel-Admin-atlas-indigo-chair:pqC8PGTOfSB2Pem1@atlas-indigo-chair.e3jrqaq.mongodb.net/?retryWrites=true&w=majority
```

### **2. NEXT_PUBLIC_GOOGLE_CLIENT_ID**
```
293328947211-6uc16de0smqrlo9gqruh7phv6f80936.apps.googleusercontent.com
```

### **3. GOOGLE_CLIENT_SECRET**
```
PASTE_YOUR_FULL_CLIENT_SECRET_HERE
```
(Get this from the Google Cloud Console - click download icon)

### **4. SESSION_PASSWORD**
```
at-least-32-characters-long-random-secret-key-change-this
```
(Generate a random 32+ character string)

---

## 🧪 **Step 7: Test Locally (Optional)**

Create `.env.local` file in `production-tracking/` folder:

```bash
STORAGE_MONGODB_URI="mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@atlas-indigo-chair.e3jrqaq.mongodb.net/?retryWrites=true&w=majority"
OPENAI_API_KEY="your-openai-api-key-here"
NEXT_PUBLIC_GOOGLE_CLIENT_ID="293328947211-6uc16de0smqrlo9gqruh7phv6f80936.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="YOUR_FULL_CLIENT_SECRET_HERE"
SESSION_PASSWORD="create-a-super-long-random-secret-32-chars-minimum"
```

Run:
```bash
npm run dev
```

Test at http://localhost:3000

---

## ✅ **Checklist:**

- [ ] Remove old Supabase redirect URI from Google Cloud Console
- [ ] Add `http://localhost:3000` to Authorized JavaScript origins
- [ ] Copy full client secret from Google Cloud Console
- [ ] Add all 4 environment variables to Vercel
- [ ] Redeploy (Vercel will auto-deploy after env vars are added)
- [ ] Test Google login on live site

---

## 🎯 **What Should Happen:**

1. Visit your site
2. Click "Get Started" 
3. See login modal with **"Continue with Google"** button
4. Click it → Google account picker appears
5. Select account → Auto logged in!
6. Chat messages persist in MongoDB

---

## 🐛 **If It Doesn't Work:**

Check browser console for errors. Common issues:
- `redirect_uri_mismatch` → Fix redirect URIs in Google Console
- `invalid_client` → Wrong client ID or secret
- `Missing: NEXT_PUBLIC_GOOGLE_CLIENT_ID` → Env var not set

---

## 📞 **Current Status:**

- ✅ Client ID: `293328947211-6uc16de0smqrlo9gqruh7phv6f80936.apps.googleusercontent.com`
- ✅ JavaScript Origins: Correct
- ❌ Redirect URIs: **NEEDS FIXING** (remove Supabase)
- ⏳ Client Secret: **NEEDS TO BE COPIED** 
- ⏳ Vercel Env Vars: **NEEDS TO BE ADDED**

**Next:** Follow steps above, then test!

