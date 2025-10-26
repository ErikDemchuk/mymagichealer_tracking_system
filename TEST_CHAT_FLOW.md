# Chat Persistence Testing Guide

## ✅ Verification Steps

### 1. Check Deployment Status
- Latest deployment: `production-tracking-8cxazc2sk-erik-demchuks-projects.vercel.app`
- Should be READY

### 2. Environment Variables (Vercel)
Make sure these are set:
- `NEXT_PUBLIC_SUPABASE_URL`: https://jcyuopxypvvtwuxdyltp.supabase.co
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

### 3. Supabase Database
- Table: `chats`
- RLS: ENABLED
- Policies:
  - ✅ select_own_chats (SELECT with auth.uid())
  - ✅ insert_own_chats (INSERT with WITH CHECK auth.uid())
  - ✅ update_own_chats (UPDATE with auth.uid())
  - ✅ delete_own_chats (DELETE with auth.uid())

### 4. Testing Flow

#### Step 1: Clear Browser
```
1. Open Dev Tools (F12)
2. Go to Application tab
3. Clear all site data
4. Hard refresh (Ctrl+Shift+R)
```

#### Step 2: Access Chat Page
```
1. Go to: https://production-tracking-8cxazc2sk-erik-demchuks-projects.vercel.app/chat
2. You should see "Checking authentication..." spinner
3. Login modal should appear if not authenticated
```

#### Step 3: Login with Google
```
1. Click "Continue with Google"
2. Should redirect to auth callback
3. Should redirect to /chat
4. Console should show:
   - "✅ Supabase client initialized successfully"
   - "✅ User is authenticated: [user-id]"
   - "Initializing chat page..."
   - "Found 0 existing chats" (first time)
   - "No existing chats, creating new one"
   - "ChatInterface: currentChatId changed from null to [uuid]"
   - "Creating new chat: [uuid]"
   - "🔵 Creating chat with database storage"
   - "Creating chat in database: New Chat with 0 messages for user: [user-id]"
   - "✅ Chat created successfully in database"
   - "✅ New chat created successfully: [uuid]"
```

#### Step 4: Send Messages
```
1. Type a message and send
2. Console should show:
   - "Updating chat with X messages"
3. Check Supabase database - should see 1 row in chats table
```

#### Step 5: Refresh Page
```
1. Press F5 to refresh
2. Console should show:
   - "✅ User is authenticated: [user-id]"
   - "Found 1 existing chats"
   - "Loading most recent chat: [uuid]"
   - "Found existing chat: [uuid] with X messages"
3. Your messages should still be there
4. Sidebar should show "Recent Chats" with your chat
```

#### Step 6: Create New Chat
```
1. Click "New Chat" button
2. Console should show:
   - "ChatPage: Creating new chat: [new-uuid]"
   - "ChatInterface: currentChatId changed from [old-uuid] to [new-uuid]"
   - "Creating new chat: [new-uuid]"
3. Messages should clear
4. Send new messages
5. Refresh - both chats should be in sidebar
```

## 🐛 Troubleshooting

### If console shows "Supabase client is NULL":
- Check Vercel environment variables
- Make sure they're not set to placeholder values
- Redeploy after changing env vars

### If "No authenticated user" in console:
- Clear browser data
- Try login again
- Check Google OAuth is configured in Supabase

### If chat creates but doesn't save:
- Check browser console for RLS errors
- Verify RLS policies in Supabase
- Verify `user_id` column exists in chats table

### If refresh loses chats:
- Check if `useDatabase` is true (should be if env vars set)
- Check if `getChats()` returns empty array
- Check Supabase for actual rows in database

## 📊 Expected Database State

After testing, you should see in Supabase:
```sql
SELECT id, title, user_id, created_at, 
       jsonb_array_length(messages) as message_count
FROM chats
ORDER BY updated_at DESC;
```

Should show:
- Your chat IDs
- Your user ID
- Message counts
- Timestamps

