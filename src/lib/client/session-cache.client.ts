import 'client-only';
// Client-side session cache to prevent excessive API calls
let sessionCache: {
  userId: string | null
  email?: string
  name?: string
  timestamp: number
} | null = null

const SESSION_CACHE_TTL = 60000 // 1 minute cache
const FETCH_TIMEOUT = 5000 // 5 second timeout for fetch requests

// Helper function to create a fetch with timeout
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout: number = FETCH_TIMEOUT): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout')
    }
    throw error
  }
}

export async function getCachedSession(): Promise<{
  userId: string | null
  email?: string
  name?: string
} | null> {
  if (typeof window === 'undefined') return null

  // Return cached session if still valid
  const now = Date.now()
  if (sessionCache && (now - sessionCache.timestamp) < SESSION_CACHE_TTL) {
    return {
      userId: sessionCache.userId,
      email: sessionCache.email,
      name: sessionCache.name
    }
  }

  try {
    const response = await fetchWithTimeout('/api/auth/session', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      sessionCache = { userId: null, timestamp: now }
      return null
    }

    const data = await response.json()
    if (data.authenticated && data.user) {
      sessionCache = {
        userId: data.user.userId,
        email: data.user.email,
        name: data.user.name,
        timestamp: now
      }
      return {
        userId: data.user.userId,
        email: data.user.email,
        name: data.user.name
      }
    }

    sessionCache = { userId: null, timestamp: now }
    return null
  } catch (error) {
    console.error('Error fetching session:', error)
    // On timeout or error, return null but don't cache it (so we retry next time)
    // This prevents infinite loading states
    return null
  }
}

export function clearSessionCache() {
  sessionCache = null
}
