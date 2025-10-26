# Database Setup Guide

This guide will help you set up Supabase database for the Production Tracking application.

## Step 1: Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and sign up or log in
2. Click "New Project"
3. Fill in your project details:
   - **Organization**: Select or create an organization
   - **Name**: production-tracking (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your location (e.g., Washington, D.C., USA (East))
   - **Plan**: Select "Free" plan to start
4. Click "Create new project"

## Step 2: Get Your API Keys

1. Once your project is created, go to **Settings** → **API**
2. You'll see:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
3. Copy both of these values

## Step 3: Configure Environment Variables

1. Create a `.env.local` file in the root of your project:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

2. Replace the values with your actual Supabase credentials from Step 2

## Step 4: Create the Database Table

You have two options:

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New query"
4. Paste the contents of `supabase/migrations/001_create_chats_table.sql`
5. Click "Run" (or press Ctrl+Enter)

### Option B: Using Supabase CLI

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. Run migrations:
   ```bash
   supabase db push
   ```

## Step 5: Verify the Setup

1. In your Supabase dashboard, go to **Table Editor**
2. You should see a `chats` table with columns:
   - `id` (uuid)
   - `title` (text)
   - `messages` (jsonb)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)
   - `user_id` (text, nullable)

## Step 6: Start the Application

```bash
npm run dev
```

The app will now use Supabase database instead of localStorage!

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure your `.env.local` file exists and has the correct values
- Restart your dev server after creating/editing `.env.local`

### "relation 'chats' does not exist"
- You haven't run the migration yet
- Follow Step 4 to create the table

### Still using localStorage?
- Check the browser console for "Supabase not configured, using localStorage"
- This means the environment variables aren't set correctly

## Migration from localStorage

If you have existing chats in localStorage and want to migrate them to the database:

1. Export your localStorage data:
   ```javascript
   console.log(localStorage.getItem('production-chats'))
   ```

2. Copy the JSON data

3. In Supabase SQL Editor, run:
   ```sql
   INSERT INTO chats (id, title, messages, created_at, updated_at)
   VALUES ('your-chat-id', 'Chat Title', '[{"your":"messages"}]', NOW(), NOW());
   ```

## API Security

The current setup uses the `anon` key which is safe for client-side usage. For production, consider:
- Setting up Row Level Security (RLS) policies
- Using the `service_role` key only on the server side
- Adding authentication to associate chats with users

## Need Help?

- Check [Supabase Documentation](https://supabase.com/docs)
- Visit the [Supabase Discord](https://discord.supabase.com)

