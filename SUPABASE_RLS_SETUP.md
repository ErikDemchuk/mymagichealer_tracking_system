# Supabase RLS Policy Setup

## Problem
The `chats` table has RLS enabled but no policies are allowing INSERT/SELECT operations, so chats can't be saved.

## Solution: Configure RLS Policies

### Step 1: Go to Authentication > Policies
Visit: https://supabase.com/dashboard/project/jcyuopxypvvtwuxdyltp/auth/policies

### Step 2: Find the `chats` table
Look for `public.chats` in the table list

### Step 3: Add Policies

#### Policy 1: Allow users to INSERT their own chats
1. Click on the `chats` table
2. Click "New Policy"
3. Policy name: `Allow users to insert their own chats`
4. Policy type: `INSERT`
5. Definition: `PERMISSIVE`
6. Policy: `true` (for now, we can restrict later)
7. Check "With check": `true`
8. Click "Save"

#### Policy 2: Allow users to SELECT their own chats
1. Click "New Policy"
2. Policy name: `Allow users to select their own chats`
3. Policy type: `SELECT`
4. Definition: `PERMISSIVE`
5. Policy: `auth.uid()::text = user_id`
6. Click "Save"

#### Policy 3: Allow users to UPDATE their own chats
1. Click "New Policy"
2. Policy name: `Allow users to update their own chats`
3. Policy type: `UPDATE`
4. Definition: `PERMISSIVE`
5. Policy: `auth.uid()::text = user_id`
6. Click "Save"

#### Policy 4: Allow users to DELETE their own chats
1. Click "New Policy"
2. Policy name: `Allow users to delete their own chats`
3. Policy type: `DELETE`
4. Definition: `PERMISSIVE`
5. Policy: `auth.uid()::text = user_id`
6. Click "Save"

## Alternative: Temporarily disable RLS (for testing only)

If you want to test quickly without RLS:

1. Go to: https://supabase.com/dashboard/project/jcyuopxypvvtwuxdyltp/auth/policies
2. Find `public.chats`
3. Turn off "Enable Row Level Security" toggle
4. Click "Save"

⚠️ **Warning**: This makes the chats table public. Only use for testing!

## Test

After setting up policies:

1. Visit: https://production-tracking-cavbzh9mt-erik-demchuks-projects.vercel.app/chat
2. Log in with Google
3. Click "New Chat"
4. Send a message
5. Check Supabase dashboard - you should see the chat in the `chats` table!

