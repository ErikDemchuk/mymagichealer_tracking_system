"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { ChatInterface } from "@/components/chat-interface"
import { useChatStorage } from "@/hooks/use-chat-storage"
import { LoginModal } from "@/components/login-modal"

function ChatPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [chatUpdateTrigger, setChatUpdateTrigger] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { getChats } = useChatStorage()
  
  // Check authentication first
  useEffect(() => {
    const checkAuth = async () => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
      
      try {
        const response = await fetch('/api/auth/session', {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        })
        clearTimeout(timeoutId)
        
        const data = await response.json()
        
        if (data.authenticated) {
          console.log('✅ User is authenticated:', data.user.userId)
          setIsAuthenticated(true)
        } else {
          console.log('⚠️ User is NOT authenticated')
          setIsAuthenticated(false)
          setShowLoginModal(true)
        }
      } catch (error) {
        clearTimeout(timeoutId)
        console.error('❌ Auth check failed:', error)
        // On timeout or error, show login modal instead of infinite loading
        setIsAuthenticated(false)
        setShowLoginModal(true)
      } finally {
        setIsCheckingAuth(false)
      }
    }
    
    checkAuth()
  }, [])
  
  // Auto-load chat from URL or most recent chat on mount
  useEffect(() => {
    const initializeChat = async () => {
      if (isInitialized || !isAuthenticated || isCheckingAuth) return
      
      console.log('Initializing chat page...')
      
      // Check if there's a chat ID in the URL (e.g., /chat?id=abc123)
      const urlChatId = searchParams.get('id')
      
      if (urlChatId) {
        console.log('Loading chat from URL:', urlChatId)
        setSelectedChat(urlChatId)
        setIsInitialized(true)
        return
      }
      
      try {
        const chats = await getChats()
        console.log('Found', chats.length, 'existing chats')
        
        if (chats.length > 0) {
          // Load the most recent chat
          const mostRecent = chats[0]
          console.log('Loading most recent chat:', mostRecent.id)
          setSelectedChat(mostRecent.id)
          // Update URL to reflect current chat
          router.push(`/chat?id=${mostRecent.id}`, { scroll: false })
        } else {
          // No chats exist, create a new one
          console.log('No existing chats, creating new one')
          const newChatId = crypto.randomUUID()
          setSelectedChat(newChatId)
          // Update URL with new chat ID
          router.push(`/chat?id=${newChatId}`, { scroll: false })
        }
      } catch (error) {
        console.error('Error initializing chat:', error)
        // Fallback: create new chat
        const newChatId = crypto.randomUUID()
        setSelectedChat(newChatId)
        router.push(`/chat?id=${newChatId}`, { scroll: false })
      }
      
      setIsInitialized(true)
    }
    
    initializeChat()
  }, [isInitialized, isAuthenticated, isCheckingAuth, getChats, searchParams, router])

  const handleSlashCommand = (command: string) => {
    switch (command) {
      case "/production":
        return "Opening production form... I'll help you track production metrics, batch numbers, and quality indicators."
      case "/inventory":
        return "Opening inventory check form... Let's review current stock levels and identify any shortages or overstock items."
      case "/quality":
        return "Opening quality check form... I'll guide you through the quality inspection process and documentation requirements."
      case "/maintenance":
        return "Opening maintenance form... Let's schedule equipment maintenance and track any issues that need attention."
      case "/help":
        return "Available commands:\n• /production - Production tracking and metrics\n• /inventory - Stock level management\n• /quality - Quality control processes\n• /maintenance - Equipment maintenance\n• /help - Show this help message"
      default:
        return "Unknown command. Type /help to see available commands."
    }
  }

  const handleNewChat = () => {
    const newChatId = crypto.randomUUID()
    console.log('ChatPage: Creating new chat:', newChatId)
    
    // Set the new chat as selected - this will trigger ChatInterface to create it
    setSelectedChat(newChatId)
    
    // Update URL with new chat ID
    router.push(`/chat?id=${newChatId}`, { scroll: false })
    
    // Trigger sidebar update to show the new chat once it's created
    setChatUpdateTrigger(prev => prev + 1)
  }

  const handleSelectChat = (chatId: string) => {
    console.log('handleSelectChat:', chatId)
    setSelectedChat(chatId)
    
    // Update URL to reflect selected chat
    router.push(`/chat?id=${chatId}`, { scroll: false })
  }

  const handleBackToHome = () => {
    router.push("/")
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }
  
  // Keyboard shortcut for new chat (Ctrl+Shift+O)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'O') {
        e.preventDefault()
        handleNewChat()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleLogin = () => {
    // Login modal will handle the authentication
    setShowLoginModal(false)
  }
  
  const handleCloseModal = () => {
    // Don't allow closing if not authenticated
    if (!isAuthenticated) {
      router.push("/")
    } else {
      setShowLoginModal(false)
    }
  }

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen gap-0" style={{ backgroundColor: '#f4f3f3' }}>
      {/* Sidebar */}
      <Sidebar 
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        currentChatId={selectedChat}
        updateTrigger={chatUpdateTrigger}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <Header onBackToHome={handleBackToHome} />
        
        {/* Chat Interface */}
        <ChatInterface 
          onSlashCommand={handleSlashCommand}
          currentChatId={selectedChat}
          onChatChange={(chatId) => {
            console.log('ChatInterface notified onChatChange:', chatId)
            // Force sidebar to reload after chat is created/updated
            setChatUpdateTrigger(prev => prev + 1)
          }}
        />
      </div>
      
      {/* Login Modal - shown if not authenticated */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={handleCloseModal}
        onLogin={handleLogin}
      />
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  )
}

