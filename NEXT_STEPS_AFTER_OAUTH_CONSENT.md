# Steps After Completing OAuth Consent Screen

## You're currently at: Audience Selection ✅

**Next steps:**

1. **Click "Next"** (you're on the External option - this is correct!)

2. **Contact Information** (Step 3)
   - User support email: Your email address
   - Developer contact information: Your email address
   - Click "Save and Continue"

3. **Scopes** (Step 3 continued)
   - Click "Add or Remove Scopes"
   - Add these scopes:
     - `email`
     - `profile`
     - `openid`
   - Click "Update"
   - Click "Save and Continue"

4. **Test users** (Step 3 continued)
   - Add your Google email address as a test user
   - Click "Save and Continue"
   - Click "Back to Dashboard"

5. **Now create OAuth credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "+ Create Credentials" → "OAuth client ID"
   - Application type: **"Web application"**
   - Name: Magic Healer Auth
   - **Authorized redirect URIs** - Click "+ Add URI" and add:
     ```
     https://jcyuopxypvvtwuxdyltp.supabase.co/auth/v1/callback
     ```
   - Click "Create"

6. **Copy your credentials** when they appear

7. **Add to Supabase** (the screen you showed earlier)

8. **Test your login!**

