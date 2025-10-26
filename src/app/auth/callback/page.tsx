"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleHashRedirect = async () => {
      const hash = window.location.hash
      
      if (hash && hash.includes('access_token')) {
        try {
          const { createClient } = await import('@supabase/supabase-js')
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
          const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

          if (!supabaseUrl || !supabaseKey) {
            console.error('Supabase credentials not configured')
            router.push('/')
            return
          }

          const supabase = createClient(supabaseUrl, supabaseKey)
          
          // Parse the hash to get the access token
          const params = new URLSearchParams(hash.substring(1))
          const accessToken = params.get('access_token')
          const refreshToken = params.get('refresh_token')
          
          if (accessToken) {
            // Set the session
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            })

            if (error) {
              console.error('Error setting session:', error)
              router.push('/')
            } else if (data.session) {
              // Clear the hash from URL
              window.history.replaceState({}, '', '/auth/callback')
              // Redirect to chat page
              router.push('/chat')
            }
          }
        } catch (error) {
          console.error('Error handling OAuth redirect:', error)
          router.push('/')
        }
      } else {
        // No hash, redirect to home
        router.push('/')
      }
    }

    handleHashRedirect()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  )
}

