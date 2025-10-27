import { NextRequest, NextResponse } from 'next/server'
import { createSession } from '@/lib/session'

// Google OAuth handler with CORS support
// Add CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json()
    
    console.log('Google OAuth POST received, credential length:', credential?.length)
    
    if (!credential) {
      return NextResponse.json(
        { error: 'No credential provided' }, 
        { status: 400, headers: corsHeaders }
      )
    }

    // Verify the credential is a valid JWT
    if (!credential.includes('.')) {
      return NextResponse.json(
        { error: 'Invalid credential format' }, 
        { status: 400, headers: corsHeaders }
      )
    }

    // Decode the Google JWT token
    const parts = credential.split('.')
    if (parts.length !== 3) {
      return NextResponse.json(
        { error: 'Invalid JWT structure' }, 
        { status: 400, headers: corsHeaders }
      )
    }

    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )

    const payload = JSON.parse(jsonPayload)
    
    console.log('Decoded Google payload:', {
      email: payload.email,
      name: payload.name,
      sub: payload.sub
    })
    
    // Verify required fields
    if (!payload.sub || !payload.email) {
      return NextResponse.json(
        { error: 'Invalid token payload' }, 
        { status: 400, headers: corsHeaders }
      )
    }
    
    // Create session with Google user info
    const userId = payload.sub // Google user ID
    const email = payload.email
    const name = payload.name || email.split('@')[0]
    
    await createSession(userId, email, name)
    
    console.log('Session created successfully for:', email)
    
    return NextResponse.json({ 
      success: true,
      user: { userId, email, name }
    }, { headers: corsHeaders })
  } catch (error) {
    console.error('Error in Google login:', error)
    return NextResponse.json(
      { error: 'Login failed', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500, headers: corsHeaders }
    )
  }
}


