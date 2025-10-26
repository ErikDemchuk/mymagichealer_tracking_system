"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { ChatInterface } from "@/components/chat-interface"

export default function ChatPage() {
  const router = useRouter()
  const [selectedChat, setSelectedChat] = useState<string | null>(null)

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
    setSelectedChat(newChatId)
  }

  const handleSelectChat = (chatId: string) => {
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
      />
      
      {/* Main Content */}
      <div className="ml-64 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <Header onBackToHome={handleBackToHome} />
        
        {/* Chat Interface */}
        <ChatInterface 
          onSlashCommand={handleSlashCommand}
          currentChatId={selectedChat}
          onChatChange={handleSelectChat}
        />
      </div>
    </div>
  )
}

