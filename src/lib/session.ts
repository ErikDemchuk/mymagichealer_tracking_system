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
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000,
    path: '/'
  })
  
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

// Client-side: Get session from cookie
export function getClientSession(): Session | null {
  if (typeof window === 'undefined') return null
  
  try {
    const cookies = document.cookie.split(';')
    const sessionCookie = cookies.find(c => c.trim().startsWith(`${SESSION_COOKIE_NAME}=`))
    
    if (!sessionCookie) return null
    
    const encodedSession = sessionCookie.split('=')[1]
    const sessionData = Buffer.from(encodedSession, 'base64').toString('utf-8')
    const session: Session = JSON.parse(sessionData)
    
    // Check if session is expired
    if (Date.now() - session.createdAt > SESSION_DURATION) {
      return null
    }
    
    return session
  } catch (error) {
    console.error('Error getting client session:', error)
    return null
  }
}

