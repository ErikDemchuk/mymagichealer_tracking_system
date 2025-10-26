import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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

