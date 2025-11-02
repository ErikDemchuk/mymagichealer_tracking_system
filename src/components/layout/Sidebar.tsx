"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useChatStorage } from "@/hooks/use-chat-storage"
import { Plus, MessageSquare, User, Edit2, Trash2, Check, X, Search, Home, LogOut, MoreHorizontal } from "lucide-react"
import { Sidebar as AceternitySidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar"
import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface ChatSession {
  id: string
  title: string
  messages: any[]
  createdAt: Date
  updatedAt: Date
}

export interface SidebarProps {
  onNewChat: () => void
  onSelectChat: (chatId: string) => void
  currentChatId?: string | null
  updateTrigger?: number
}

export function Sidebar({ onNewChat, onSelectChat, currentChatId, updateTrigger = 0 }: SidebarProps) {
  const [recentChats, setRecentChats] = useState<ChatSession[]>([])
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [open, setOpen] = useState(false)
  const { getChats, deleteChat, updateChat, getChat } = useChatStorage()

  const loadRecentChats = async () => {
    try {
      const chats = await getChats()
      console.log('Sidebar: Loaded', chats.length, 'chats')

      const localChats: ChatSession[] = chats.map(chat => ({
        id: chat.id,
        title: chat.title,
        messages: chat.messages,
        createdAt: new Date(chat.created_at),
        updatedAt: new Date(chat.updated_at),
      }))

      const sortedChats = localChats.sort((a, b) =>
        b.updatedAt.getTime() - a.updatedAt.getTime()
      )

      const filteredChats = searchQuery.trim()
        ? sortedChats.filter(chat =>
            chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            chat.messages.some(msg =>
              msg.text?.toLowerCase().includes(searchQuery.toLowerCase())
            )
          )
        : sortedChats

      console.log('Sidebar: Showing', filteredChats.length, 'filtered chats')
      setRecentChats(filteredChats)
    } catch (error) {
      console.error('Error loading recent chats:', error)
    }
  }

  useEffect(() => {
    console.log('Sidebar: updateTrigger changed to', updateTrigger)
    loadRecentChats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateTrigger, searchQuery])

  const handleEditChat = async (chatId: string) => {
    const chat = await getChat(chatId)
    if (chat) {
      setEditingChatId(chatId)
      setEditTitle(chat.title)
    }
  }

  const handleSaveEdit = async (chatId: string) => {
    if (editTitle.trim()) {
      try {
        await updateChat(chatId, { title: editTitle })
        await loadRecentChats()
      } catch (error) {
        console.error('Error updating chat title:', error)
      }
    }
    setEditingChatId(null)
  }

  const handleCancelEdit = () => {
    setEditingChatId(null)
    setEditTitle("")
  }

  const handleSelectChat = (chatId: string) => {
    console.log('handleSelectChat:', chatId)
    onSelectChat(chatId)
  }

  const handleDeleteChat = async (chatId: string) => {
    if (window.confirm("Are you sure you want to delete this chat?")) {
      try {
        await deleteChat(chatId)
        await loadRecentChats()
        if (currentChatId === chatId) {
          onSelectChat("")
        }
      } catch (error) {
        console.error('Error deleting chat:', error)
      }
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      // Clear session cache
      const { clearSessionCache } = await import('@/lib/session-cache')
      clearSessionCache()
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <AceternitySidebar open={open} setOpen={setOpen} animate={true}>
      <SidebarBody className="justify-between gap-10 rounded-r-3xl">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/* Logo Section */}
          <div className="mt-4 mb-6 flex items-center justify-center px-2">
            <motion.div
              initial={{ width: 40 }}
              animate={{ width: open ? 150 : 40 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex-shrink-0 overflow-hidden"
            >
              <Image 
                src="/logo-black_200x@2x.avif" 
                alt="NicarePlus Logo" 
                width={150} 
                height={50}
                className="object-contain h-auto w-full"
                priority
                quality={100}
                style={{ imageRendering: 'crisp-edges' }}
              />
            </motion.div>
          </div>

          {/* New Chat Button with Keyboard Shortcut */}
          <div className="mb-4 px-2 relative group">
            <Button
              onClick={onNewChat}
              className={cn(
                "w-full bg-transparent hover:bg-gray-100 text-gray-700 rounded-lg flex items-center justify-start gap-2 relative transition-all duration-300",
                open ? "border border-gray-300" : "border-none"
              )}
            >
              <Plus className={cn("h-4 w-4 transition-all duration-300", !open && "h-5 w-5")} />
              {open && <span className="transition-all duration-300">New Chat</span>}
              
              {/* Keyboard Shortcut - Only show on hover */}
              {open && (
                <span className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded">
                  ⌘K
                </span>
              )}
            </Button>
          </div>

          {/* Dashboard Button */}
          <div className="mb-4 px-2">
            <Link href="/dashboard">
              <Button
                className={cn(
                  "w-full bg-transparent hover:bg-gray-100 text-gray-700 rounded-lg flex items-center justify-start gap-2 transition-all duration-300",
                  open ? "border border-gray-300" : "border-none"
                )}
              >
                <MoreHorizontal className={cn("h-4 w-4 transition-all duration-300", !open && "h-5 w-5")} />
                {open && <span className="transition-all duration-300">Dashboard</span>}
              </Button>
            </Link>
          </div>

          {/* Search Bar */}
          {open && (
            <div className="mb-4 px-2 relative">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-100 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Recent Chats */}
          <div className="flex flex-col gap-1 px-2">
            {open && (
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 mb-2">
                Recent
              </h3>
            )}
            
            {recentChats.length === 0 && open && (
              <p className="text-sm text-gray-500 px-2">No recent chats.</p>
            )}
            
            {recentChats.map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  "group relative flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors",
                  currentChatId === chat.id
                    ? "bg-gray-100 text-gray-900"
                    : "hover:bg-gray-50 text-gray-700"
                )}
                onClick={() => handleSelectChat(chat.id)}
              >
                <MessageSquare className={cn("w-4 h-4 flex-shrink-0", !open && "w-5 h-5")} />
                
                {open && (
                  <>
                    {editingChatId === chat.id ? (
                      <div className="flex-1 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="h-7 text-sm bg-white border-blue-300"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(chat.id)
                            if (e.key === 'Escape') handleCancelEdit()
                          }}
                          autoFocus
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-green-600 hover:bg-green-100"
                          onClick={() => handleSaveEdit(chat.id)}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-red-600 hover:bg-red-100"
                          onClick={handleCancelEdit}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className="flex-1 truncate text-sm">{chat.title}</span>
                        
                        {/* Action Buttons - Only show on hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-gray-500 hover:bg-gray-200"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditChat(chat.id)
                            }}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-gray-500 hover:bg-gray-200"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteChat(chat.id)
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Links */}
        <div className="mt-auto border-t border-gray-200 pt-4 px-2 space-y-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center p-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
          >
            <LogOut className={cn("text-gray-700 flex-shrink-0", open ? "h-4 w-4 mr-2" : "h-5 w-5")} />
            {open && <span>Logout</span>}
          </button>
        </div>
      </SidebarBody>
    </AceternitySidebar>
  )
}
