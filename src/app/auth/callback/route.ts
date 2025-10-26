import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const nextUrl = requestUrl.searchParams.get('next') || '/chat'

  if (code) {
    // Exchange code for session server-side
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.redirect(new URL('/?error=config', requestUrl.origin))
    }

    // Exchange code for session
    const formData = new FormData()
    formData.append('code', code)
    formData.append('grant_type', 'authorization_code')
    formData.append('redirect_uri', `${requestUrl.origin}/auth/callback`)

    const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=authorization_code`, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    })

    const data = await response.json()

    if (data.error) {
      console.error('Error exchanging code:', data.error)
      return NextResponse.redirect(new URL('/?error=auth', requestUrl.origin))
    }

    // Set the session cookie
    if (data.access_token) {
      const cookieStore = await cookies()
      cookieStore.set('sb-access-token', data.access_token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1 year
      })
    }

    // Redirect to chat page on success
    return NextResponse.redirect(new URL(nextUrl, requestUrl.origin))
  }

  // No code provided, redirect to home
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}

