# Google OAuth Setup Guide

Follow these steps to get your Client ID and Client Secret for Google Sign-in.

## Step 1: Go to Google Cloud Console
Visit: https://console.cloud.google.com/

## Step 2: Create or Select a Project
1. Click the project dropdown at the top
2. Either:
   - **Create a new project**: Click "New Project" → Enter name (e.g., "Magic Healer Auth") → Click "Create"
   - **Select existing project**: Choose an existing project from the dropdown

## Step 3: Enable Google+ API
1. Go to **APIs & Services** → **Library** (or search for "APIs" in the top search bar)
2. Search for "Google+ API" 
3. Click on it and click **"Enable"**
   
   **OR** you can skip this step - it's optional for basic OAuth

## Step 4: Configure OAuth Consent Screen
1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **"External"** (unless you have a Google Workspace)
3. Click **"Create"**
4. Fill in the required fields:
   - **App name**: Magic Healer Production Tracking
   - **User support email**: Select your email
   - **Developer contact information**: Enter your email
5. Click **"Save and Continue"**
6. For **Scopes**, click **"Add or Remove Scopes"**
   - Add: `email`, `profile`, `openid`
   - Click **"Update"**
7. Click **"Save and Continue"**
8. For **Test users** (if in testing mode), add your email
9. Click **"Save and Continue"**
10. Click **"Back to Dashboard"**

## Step 5: Create OAuth 2.0 Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **"+ Create Credentials"** → **"OAuth client ID"**
3. **Application type**: Select **"Web application"**
4. **Name**: Magic Healer Auth (or any name you prefer)
5. **Authorized redirect URIs**: Click **"+ Add URI"** and add:
   ```
   https://jcyuopxypvvtwuxdyltp.supabase.co/auth/v1/callback
   ```
6. Click **"Create"**

## Step 6: Copy Your Credentials
A popup will show your credentials:
- **Your Client ID** - Copy this
- **Your Client Secret** - Copy this

⚠️ **Important**: Save the Client Secret - you won't be able to see it again!

## Step 7: Add to Supabase
1. Go back to your Supabase project
2. Go to **Authentication** → **Providers**
3. Find **"Google"** and click to configure
4. Toggle **"Enable Sign in with Google"** to ON
5. Paste your **Client ID** in the "Client IDs" field
6. Paste your **Client Secret** in the "Client Secret (for OAuth)" field
7. Click **"Save"**

## Step 8: Add to Vercel Environment Variables
For production, you'll also need to add these to Vercel:
1. Go to your Vercel project settings
2. Add these environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` (already set)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (already set)
   - `OPENAI_API_KEY` (already set)
3. No additional Google credentials needed in Vercel - Supabase handles it

## Testing
1. Visit your deployed site
2. Click "Get Started"
3. Click "Continue with Google"
4. You should be redirected to Google sign-in
5. After signing in, you'll be redirected back to your chat page

## Troubleshooting
- **"Redirect URI mismatch"**: Double-check the redirect URI in both Google Console and Supabase
- **"Access blocked"**: Make sure your OAuth consent screen is published (or you're a test user)
- **Google login doesn't work**: Ensure the Google provider is enabled in Supabase

