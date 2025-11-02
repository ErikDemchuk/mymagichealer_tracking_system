import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/session'

// Helper to add timeout to async operations
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    )
  ])
}

export async function GET(request: NextRequest) {
  try {
    // Wrap in timeout to prevent hanging
    const session = await withTimeout(
      Promise.resolve(getSessionFromRequest(request)),
      3000 // 3 second timeout
    )
    
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

