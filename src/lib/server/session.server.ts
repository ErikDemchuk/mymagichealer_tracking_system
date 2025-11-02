import 'server-only';
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

export interface Session {
  userId: string
  email?: string
  name?: string
  createdAt: number
}

const SESSION_COOKIE_NAME = 'user_session'
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 days

// Create a session
export async function createSession(userId: string, email?: string, name?: string): Promise<string> {
  const session: Session = {
    userId,
    email,
    name,
    createdAt: Date.now()
  }
  
  const sessionData = JSON.stringify(session)
  const encodedSession = Buffer.from(sessionData).toString('base64')
  
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, encodedSession, {
    httpOnly: true, // Secure: prevent client-side JavaScript access
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000,
    path: '/',
    domain: undefined // Let browser set domain automatically
  })
  
  console.log('✅ Session cookie set:', { userId, email })
  
  return encodedSession
}

// Get session from cookies (server-side)
export async function getServerSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)
    
    if (!sessionCookie?.value) return null
    
    const sessionData = Buffer.from(sessionCookie.value, 'base64').toString('utf-8')
    const session: Session = JSON.parse(sessionData)
    
    // Check if session is expired
    if (Date.now() - session.createdAt > SESSION_DURATION) {
      await destroySession()
      return null
    }
    
    return session
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}

// Get session from request (for API routes)
export function getSessionFromRequest(request: NextRequest): Session | null {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)
    
    if (!sessionCookie?.value) return null
    
    const sessionData = Buffer.from(sessionCookie.value, 'base64').toString('utf-8')
    const session: Session = JSON.parse(sessionData)
    
    // Check if session is expired
    if (Date.now() - session.createdAt > SESSION_DURATION) {
      return null
    }
    
    return session
  } catch (error) {
    console.error('Error getting session from request:', error)
    return null
  }
}

// Destroy session
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

// Client-side: Get session from API (secure method - no cookie access needed)
export async function getClientSession(): Promise<Session | null> {
  if (typeof window === 'undefined') return null
  
  // Use the cached session utility (dynamic import to avoid server-only violation)
  const { getCachedSession } = await import('../client/session-cache.client')
  const session = await getCachedSession()
  
  if (!session || !session.userId) return null
  
  // Return session-like object matching Session interface
  return {
    userId: session.userId,
    email: session.email,
    name: session.name,
    createdAt: Date.now() // Not exact, but sufficient for client-side checks
  }
}
