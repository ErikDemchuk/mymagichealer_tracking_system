"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { ChatInterface } from "@/components/chat-interface"
import { useChatStorage } from "@/hooks/use-chat-storage"

export default function ChatPage() {
  const router = useRouter()
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [chatUpdateTrigger, setChatUpdateTrigger] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)
  const { getChats } = useChatStorage()
  
  // Auto-load most recent chat or create new one on mount
  useEffect(() => {
    const initializeChat = async () => {
      if (isInitialized) return
      
      console.log('Initializing chat page...')
      
      try {
        const chats = await getChats()
        console.log('Found', chats.length, 'existing chats')
        
        if (chats.length > 0) {
          // Load the most recent chat
          const mostRecent = chats[0]
          console.log('Loading most recent chat:', mostRecent.id)
          setSelectedChat(mostRecent.id)
        } else {
          // No chats exist, create a new one
          console.log('No existing chats, creating new one')
          const newChatId = `chat-${Date.now()}`
          setSelectedChat(newChatId)
        }
      } catch (error) {
        console.error('Error initializing chat:', error)
        // Fallback: create new chat
        const newChatId = `chat-${Date.now()}`
        setSelectedChat(newChatId)
      }
      
      setIsInitialized(true)
    }
    
    initializeChat()
  }, [isInitialized, getChats])

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
    const newChatId = `chat-${Date.now()}`
    console.log('ChatPage: Creating new chat:', newChatId)
    
    // Set the new chat as selected - this will trigger ChatInterface to create it
    setSelectedChat(newChatId)
    
    // Trigger sidebar update to show the new chat once it's created
    setChatUpdateTrigger(prev => prev + 1)
  }

  const handleSelectChat = (chatId: string) => {
    console.log('handleSelectChat:', chatId)
    setSelectedChat(chatId)
  }

  const handleBackToHome = () => {
    router.push("/")
  }

  return (
    <div className="h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        currentChatId={selectedChat}
        updateTrigger={chatUpdateTrigger}
      />
      
      {/* Main Content */}
      <div className="ml-64 flex flex-col h-screen overflow-hidden">
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
    </div>
  )
}

