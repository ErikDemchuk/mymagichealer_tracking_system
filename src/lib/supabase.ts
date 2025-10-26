import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Only create client if environment variables are set
export const supabase = (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your-supabase-project-url')
  ? createBrowserClient(supabaseUrl, supabaseAnonKey)
  : null

// Log if Supabase is configured
if (supabase) {
  console.log('✅ Supabase client initialized successfully')
} else {
  console.warn('⚠️ Supabase client is NULL - environment variables not set!')
}

// Database types
export interface ChatSession {
  id: string
  title: string
  messages: any[]
  created_at: string
  updated_at: string
  user_id?: string
}

export interface Database {
  public: {
    Tables: {
      chats: {
        Row: {
          id: string
          title: string
          messages: any[]
          created_at: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          id?: string
          title: string
          messages: any[]
          created_at?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          title?: string
          messages?: any[]
          created_at?: string
          updated_at?: string
          user_id?: string | null
        }
      }
    }
  }
}

