"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useChatStorage } from "@/hooks/use-chat-storage"
import { Plus, MessageSquare, User, Settings, Edit2, Trash2, Check, X, Search, Home, LogOut } from "lucide-react"
import { Sidebar as AceternitySidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar"
import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ChatSession {
  id: string
  title: string
  messages: any[]
  createdAt: Date
  updatedAt: Date
}

interface SidebarProps {
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
      
      // Convert to local format for display
      const localChats: ChatSession[] = chats.map(chat => ({
        id: chat.id,
        title: chat.title,
        messages: chat.messages,
        createdAt: new Date(chat.created_at),
        updatedAt: new Date(chat.updated_at),
      }))
      
      // Sort by updatedAt (most recent first)
      const sortedChats = localChats.sort((a, b) => 
        b.updatedAt.getTime() - a.updatedAt.getTime()
      )
      
      // Filter by search query if exists
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
    console.log('Sidebar: Reloading chats, currentChatId:', currentChatId, 'searchQuery:', searchQuery)
    loadRecentChats()
  }, [updateTrigger, searchQuery])

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (confirm('Are you sure you want to delete this chat?')) {
      try {
        await deleteChat(chatId)
        await loadRecentChats()
        
        if (chatId === currentChatId) {
          onNewChat()
        }
      } catch (error) {
        console.error('Error deleting chat:', error)
      }
    }
  }

  const handleEditChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const chat = recentChats.find(c => c.id === chatId)
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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <AceternitySidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/* Logo and User Section */}
          <div className="mt-4 mb-6">
            {open ? (
              <div className="flex items-center gap-2 px-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  N
                </div>
                <span className="font-bold text-lg">NicarePlus</span>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                N
              </div>
            )}
          </div>

          {/* New Chat Button */}
          <Button
            onClick={onNewChat}
            className="w-full mb-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            {open && "New Chat"}
          </Button>

          {/* Search Bar */}
          {open && (
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-neutral-100 dark:bg-neutral-900 border-none"
              />
            </div>
          )}

          {/* Recent Chats */}
          <div className="flex flex-col gap-2">
            {open && (
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-2 mb-2">
                Recent Chats
              </h3>
            )}
            
            {recentChats.map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  "group relative flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors",
                  currentChatId === chat.id
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    : "hover:bg-neutral-200 dark:hover:bg-neutral-700"
                )}
                onClick={() => handleSelectChat(chat.id)}
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                
                {open && (
                  <>
                    {editingChatId === chat.id ? (
                      <div className="flex-1 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="h-7 text-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(chat.id)
                            if (e.key === 'Escape') handleCancelEdit()
                          }}
                          autoFocus
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => handleSaveEdit(chat.id)}
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={handleCancelEdit}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{chat.title}</p>
                          <div className="text-xs text-gray-500 truncate mt-1">
                            {chat.updatedAt instanceof Date 
                              ? chat.updatedAt.toLocaleDateString() 
                              : new Date(chat.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            onClick={(e) => handleEditChat(chat.id, e)}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                            onClick={(e) => handleDeleteChat(chat.id, e)}
                          >
                            <Trash2 className="w-3 h-3" />
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

        {/* Bottom Section - Settings & Logout */}
        <div className="flex flex-col gap-2 border-t border-neutral-300 dark:border-neutral-700 pt-4">
          <SidebarLink
            link={{
              label: "Settings",
              href: "#",
              icon: <Settings className="w-5 h-5" />,
            }}
          />
          <div
            onClick={handleLogout}
            className={cn(
              "flex items-center justify-start gap-2 group/sidebar py-2 px-2 rounded-md cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            )}
          >
            <LogOut className="w-5 h-5 text-neutral-700 dark:text-neutral-200" />
            {open && (
              <span className="text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre">
                Logout
              </span>
            )}
          </div>
        </div>
      </SidebarBody>
    </AceternitySidebar>
  )
}

