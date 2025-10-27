import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request)
    
    if (!session) {
      return NextResponse.json({ authenticated: false })
    }

    return NextResponse.json({ 
      authenticated: true,
      user: {
        userId: session.userId,
        email: session.email,
        name: session.name
      }
    })
  } catch (error) {
    console.error('Error checking session:', error)
    return NextResponse.json({ authenticated: false })
  }
}

