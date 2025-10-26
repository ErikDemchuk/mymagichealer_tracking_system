# Supabase Configuration Steps

## Current Latest Deployment
https://production-tracking-3tv1jsy0a-erik-demchuks-projects.vercel.app

## Steps to Update Supabase Settings

### 1. Go to Supabase Dashboard
https://supabase.com/dashboard/project/jcyuopxypvvtwuxdyltp/settings/auth

### 2. Update Site URL
In the **Site URL** field, enter:
```
https://production-tracking-3tv1jsy0a-erik-demchuks-projects.vercel.app
```

### 3. Update Redirect URLs
In the **Redirect URLs** section:
1. Keep the existing one or remove it
2. Click **"Add URL"**
3. Add this URL with wildcard:
```
https://production-tracking-3tv1jsy0a-erik-demchuks-projects.vercel.app/*
```

### 4. Save Changes
Click the green **"Save changes"** button

### 5. Test
1. Visit: https://production-tracking-3tv1jsy0a-erik-demchuks-projects.vercel.app
2. Click "Get Started"
3. Click "Continue with Google"
4. Sign in with your Google account
5. Should land on chat page ✅
6. Click your avatar to log out ✅

