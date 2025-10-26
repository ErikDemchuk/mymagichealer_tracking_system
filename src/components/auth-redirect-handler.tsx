"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

export function AuthRedirectHandler() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const handleHashRedirect = async () => {
      const hash = window.location.hash
      
      // Only handle if we're on the auth callback page and have a hash
      if (pathname === '/auth/callback' && hash && hash.includes('access_token')) {
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
      }
    }

    handleHashRedirect()
  }, [router, pathname])

  return null
}

