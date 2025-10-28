"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { HeroSection } from "@/components/hero-section-with-smooth-bg-shader"
import { LoginModal } from "@/components/login-modal"

export default function HomePage() {
  const router = useRouter()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session')
        const data = await response.json()
        
        if (data.authenticated) {
          // User is authenticated, redirect to chat
          router.push("/chat")
        } else {
          // Not authenticated, stay on landing page
          setIsCheckingAuth(false)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        setIsCheckingAuth(false)
      }
    }
    
    checkAuth()
  }, [router])

  const handleGetStarted = () => {
    setShowLoginModal(true)
  }

  const handleLogin = async (email: string) => {
    // After login, redirect to chat
    router.push("/chat")
  }

  if (isCheckingAuth) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <HeroSection
        title="Welcome to"
        highlightText="NicarePlus"
        description="Your intelligent production tracking and chat platform powered by AI. Collaborate, track, and manage your production workflow seamlessly."
        buttonText="Get Started"
        onButtonClick={handleGetStarted}
        colors={["#72b9bb", "#b5d9d9", "#ffd1bd", "#ffebe0", "#8cc5b8", "#dbf4a4"]}
        distortion={0.8}
        swirl={0.6}
        speed={0.42}
      />
      
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />
    </>
  )
}
