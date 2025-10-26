import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    
    // Check environment variables
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!hasUrl || !hasKey) {
      return NextResponse.json({
        status: 'error',
        message: 'Supabase environment variables not configured',
        hasUrl,
        hasKey
      })
    }
    
    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set(name, value, options)
          },
          remove(name: string, options: any) {
            cookieStore.delete(name)
          },
        },
      }
    )
    
    // Check auth session
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      return NextResponse.json({
        status: 'error',
        message: 'Auth error',
        error: authError.message
      })
    }
    
    if (!session) {
      return NextResponse.json({
        status: 'not_authenticated',
        message: 'No active session'
      })
    }
    
    // Try to query chats table
    const { data: chats, error: dbError } = await supabase
      .from('chats')
      .select('id, title, created_at')
      .eq('user_id', session.user.id)
      .limit(5)
    
    if (dbError) {
      return NextResponse.json({
        status: 'error',
        message: 'Database error',
        error: dbError.message,
        userId: session.user.id
      })
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'Everything configured correctly',
      user: {
        id: session.user.id,
        email: session.user.email
      },
      chatsCount: chats?.length || 0,
      chats: chats?.map(c => ({
        id: c.id,
        title: c.title,
        created_at: c.created_at
      }))
    })
    
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Server error',
      error: error.message
    })
  }
}

