import { createBrowserClient } from '@supabase/ssr'

// Create a Supabase client for use in client components
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('⚠️ Supabase credentials not configured')
    return null
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

