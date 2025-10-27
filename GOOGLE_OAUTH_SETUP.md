# Google OAuth Setup Guide

## 🔐 Setting Up Google Authentication

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Name it: "Production Tracking" (or your preferred name)

### Step 2: Enable Google+ API

1. In your project, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click **Enable**

### Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. If prompted, configure the OAuth consent screen first:
   - User Type: **External**
   - App name: **Production Tracking**
   - User support email: Your email
   - Developer contact: Your email
   - Click **Save and Continue**
   - Scopes: Skip (click **Save and Continue**)
   - Test users: Add your email
   - Click **Save and Continue**

4. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: **Production Tracking Web Client**
   
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     https://production-tracking-erik-demchuks-projects.vercel.app
     https://production-tracking-git-master-erik-demchuks-projects.vercel.app
     ```
   
   - **Authorized redirect URIs**: (Leave empty - we're using Google Sign-In, not OAuth redirect flow)
   
   - Click **CREATE**

5. **Copy your credentials**:
   - Client ID: `xxxxx.apps.googleusercontent.com`
   - Client Secret: `xxxxxxxxxxxxxxxxxxxxxxxx`

### Step 4: Add to Environment Variables

#### Local Development (.env.local)
```bash
STORAGE_MONGODB_URI="mongodb+srv://..."
OPENAI_API_KEY="sk-..."
NEXT_PUBLIC_GOOGLE_CLIENT_ID="YOUR_CLIENT_ID.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="YOUR_CLIENT_SECRET"
```

#### Vercel (Production)
Go to: https://vercel.com/erik-demchuks-projects/production-tracking/settings/environment-variables

Add these variables:

1. **STORAGE_MONGODB_URI**
   - Value: `mongodb+srv://Vercel-Admin-atlas-indigo-chair:pqC8PGTOfSB2Pem1@atlas-indigo-chair.e3jrqaq.mongodb.net/?retryWrites=true&w=majority`
   - Environments: All

2. **NEXT_PUBLIC_GOOGLE_CLIENT_ID**
   - Value: Your Google Client ID (from step 5)
   - Environments: All
   - ⚠️ **Important**: Must start with `NEXT_PUBLIC_` to be accessible in the browser

3. **GOOGLE_CLIENT_SECRET** (optional, for future use)
   - Value: Your Google Client Secret
   - Environments: All

### Step 5: Test the Integration

1. **Local Testing**:
   ```bash
   npm run dev
   ```
   - Visit http://localhost:3000
   - Click "Get Started"
   - Click "Continue with Google"
   - Google Sign-In popup should appear

2. **Production Testing**:
   - Wait for Vercel deployment
   - Visit your production URL
   - Test Google Sign-In

### Troubleshooting

#### "Google Sign-In not loaded"
- Check that `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set in Vercel
- Verify the Client ID starts with your project number and ends with `.apps.googleusercontent.com`
- Make sure the environment variable name has the `NEXT_PUBLIC_` prefix

#### "Redirect URI mismatch"
- We're using Google Sign-In (One Tap), not OAuth redirect flow
- No redirect URIs needed
- Just add authorized JavaScript origins

#### "Access blocked: This app's request is invalid"
- Add your production domain to authorized JavaScript origins
- Make sure OAuth consent screen is configured

#### Email Login Still Works
Yes! The email-only login is kept as a fallback. Users can choose either:
- **Google Sign-In** (recommended, faster)
- **Email address** (simple, no OAuth needed)

## 🎯 How It Works

1. **User clicks "Continue with Google"**
2. **Google One Tap** appears (popup or embedded)
3. **User selects Google account**
4. **Google returns JWT credential**
5. **Your app decodes JWT** to get user info (ID, email, name)
6. **Session created** with MongoDB (30-day cookie)
7. **User redirected to** `/chat`

## 📊 Data Stored in MongoDB

When a user logs in with Google, we store:
- `userId`: Google user ID (sub claim from JWT)
- `email`: User's Google email
- `name`: User's display name
- Session stored in secure httpOnly cookie (30 days)

All chat data is linked to this `userId`.

## 🔒 Security Features

- ✅ Credentials verified by Google
- ✅ JWT tokens validated
- ✅ Sessions stored in httpOnly cookies (XSS protection)
- ✅ User-specific chat data (MongoDB filtering)
- ✅ No passwords to manage

---

**Next**: Add the environment variables to Vercel and test!

