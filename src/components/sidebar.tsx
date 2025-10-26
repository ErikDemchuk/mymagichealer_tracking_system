"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Plus, 
  Search, 
  BookOpen, 
  FolderOpen, 
  MessageSquare,
  User,
  Settings,
  Edit2,
  Trash2,
  Check,
  X
} from "lucide-react"

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
}

export function Sidebar({ onNewChat, onSelectChat, currentChatId }: SidebarProps) {
  const [recentChats, setRecentChats] = useState<ChatSession[]>([])
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")

  // Load recent chats from localStorage
  useEffect(() => {
    loadRecentChats()
  }, [])

  const loadRecentChats = () => {
    try {
      const savedChats = localStorage.getItem('production-chats')
      if (savedChats) {
        const chats: ChatSession[] = JSON.parse(savedChats)
        // Sort by updatedAt (most recent first) and take first 10
        const sortedChats = chats
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 10)
        setRecentChats(sortedChats)
      }
    } catch (error) {
      console.error('Error loading recent chats:', error)
    }
  }

  const handleRenameChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const chat = recentChats.find(c => c.id === chatId)
    if (chat) {
      setEditingChatId(chatId)
      setEditTitle(chat.title)
    }
  }

  const saveRename = () => {
    if (editingChatId && editTitle.trim()) {
      try {
        const savedChats = localStorage.getItem('production-chats')
        if (savedChats) {
          const chats: ChatSession[] = JSON.parse(savedChats)
          const chatIndex = chats.findIndex(c => c.id === editingChatId)
          if (chatIndex >= 0) {
            chats[chatIndex].title = editTitle.trim()
            chats[chatIndex].updatedAt = new Date()
            localStorage.setItem('production-chats', JSON.stringify(chats))
            loadRecentChats() // Reload to update UI
          }
        }
      } catch (error) {
        console.error('Error renaming chat:', error)
      }
    }
    setEditingChatId(null)
    setEditTitle("")
  }

  const cancelRename = () => {
    setEditingChatId(null)
    setEditTitle("")
  }

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this chat?')) {
      try {
        const savedChats = localStorage.getItem('production-chats')
        if (savedChats) {
          const chats: ChatSession[] = JSON.parse(savedChats)
          const filteredChats = chats.filter(c => c.id !== chatId)
          localStorage.setItem('production-chats', JSON.stringify(filteredChats))
          loadRecentChats() // Reload to update UI
          
          // If we deleted the current chat, go to new chat
          if (currentChatId === chatId) {
            onNewChat()
          }
        }
      } catch (error) {
        console.error('Error deleting chat:', error)
      }
    }
  }

  return (
    <div className="w-64 h-screen bg-gray-50 border-r border-gray-200 flex flex-col fixed left-0 top-0 z-40">
      {/* Top Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">MH</span>
          </div>
          <div className="text-sm font-medium">Magic Healer</div>
        </div>
        
        <Button 
          onClick={onNewChat}
          className="w-full justify-start bg-white hover:bg-gray-100 text-gray-700 border border-gray-200"
          variant="outline"
        >
          <Plus className="w-4 h-4 mr-2" />
          New chat
        </Button>
      </div>

      {/* Navigation */}
      <div className="p-4 space-y-2">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-gray-600 hover:bg-gray-100"
        >
          <Search className="w-4 h-4 mr-2" />
          Search chats
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-gray-600 hover:bg-gray-100"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Library
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-gray-600 hover:bg-gray-100"
        >
          <FolderOpen className="w-4 h-4 mr-2" />
          Projects
        </Button>
      </div>

      {/* Chat History */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Recent Chats
        </div>
        <div className="space-y-2">
          {recentChats.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-4">
              No recent chats
            </div>
          ) : (
            recentChats.map((chat) => (
              <Card 
                key={chat.id}
                className={`p-3 cursor-pointer hover:bg-gray-100 transition-colors group relative ${
                  currentChatId === chat.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => onSelectChat(chat.id)}
              >
                <div className="flex items-start space-x-2">
                  <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    {editingChatId === chat.id ? (
                      <div className="flex items-center space-x-1">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="text-sm h-6 px-2"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveRename()
                            if (e.key === 'Escape') cancelRename()
                          }}
                          autoFocus
                        />
                        <Button size="sm" variant="ghost" onClick={saveRename} className="h-6 w-6 p-0">
                          <Check className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={cancelRename} className="h-6 w-6 p-0">
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {chat.title}
                        </div>
                        <div className="text-xs text-gray-500 truncate mt-1">
                          {new Date(chat.updatedAt).toLocaleDateString()}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Action buttons - only show on hover */}
                  {editingChatId !== chat.id && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => handleRenameChat(chat.id, e)}
                        className="h-6 w-6 p-0 hover:bg-gray-200"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => handleDeleteChat(chat.id, e)}
                        className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900">Worker</div>
            <div className="text-xs text-gray-500">Production Staff</div>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full bg-white hover:bg-gray-100 text-gray-700"
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  )
}
