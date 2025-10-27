import { NextRequest, NextResponse } from 'next/server'
import { createSession } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()
    
    // Simple demo login - generate a user ID based on email
    const userId = Buffer.from(email).toString('base64').substring(0, 24)
    
    await createSession(userId, email, name)
    
    return NextResponse.json({ 
      success: true,
      user: { userId, email, name }
    })
  } catch (error) {
    console.error('Error in login:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}

