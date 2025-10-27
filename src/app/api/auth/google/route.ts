import { NextRequest, NextResponse } from 'next/server'
import { createSession } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json()
    
    if (!credential) {
      return NextResponse.json({ error: 'No credential provided' }, { status: 400 })
    }

    // Decode the Google JWT token
    const base64Url = credential.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )

    const payload = JSON.parse(jsonPayload)
    
    // Create session with Google user info
    const userId = payload.sub // Google user ID
    const email = payload.email
    const name = payload.name
    
    await createSession(userId, email, name)
    
    return NextResponse.json({ 
      success: true,
      user: { userId, email, name }
    })
  } catch (error) {
    console.error('Error in Google login:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}

