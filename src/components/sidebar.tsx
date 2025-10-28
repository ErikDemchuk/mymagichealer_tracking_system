"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useChatStorage } from "@/hooks/use-chat-storage"
import { 
  Plus, 
  MessageSquare,
  User,
  Settings,
  Edit2,
  Trash2,
  Check,
  X,
  Search
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
  updateTrigger?: number
}

export function Sidebar({ onNewChat, onSelectChat, currentChatId, updateTrigger = 0 }: SidebarProps) {
  const [recentChats, setRecentChats] = useState<ChatSession[]>([])
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
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

  // Load recent chats from localStorage when updateTrigger changes
  useEffect(() => {
    console.log('Sidebar: updateTrigger changed to', updateTrigger)
    // Always load chats when trigger changes, not just when > 0
    loadRecentChats()
  }, [updateTrigger])
  
  // Load recent chats from localStorage
  useEffect(() => {
    console.log('Sidebar: Reloading chats, currentChatId:', currentChatId, 'searchQuery:', searchQuery)
    loadRecentChats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, currentChatId])
  
  // Add a listener for storage changes to detect new chats
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'production-chats') {
        console.log('Sidebar: localStorage changed, reloading chats')
        loadRecentChats()
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])


  const handleRenameChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const chat = recentChats.find(c => c.id === chatId)
    if (chat) {
      setEditingChatId(chatId)
      setEditTitle(chat.title)
    }
  }

  const saveRename = async () => {
    if (editingChatId && editTitle.trim()) {
      try {
        const currentChat = await getChat(editingChatId)
        if (currentChat) {
          await updateChat(editingChatId, {
            ...currentChat,
            title: editTitle.trim(),
          })
          loadRecentChats() // Reload to update UI
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

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this chat?')) {
      try {
        await deleteChat(chatId)
        loadRecentChats() // Reload to update UI
        
        // If we deleted the current chat, go to new chat
        if (currentChatId === chatId) {
          onNewChat()
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
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">MH</span>
          </div>
          <div className="text-sm font-medium">Magic Healer</div>
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Recent Chats
        </div>
        
        {/* New Chat Button */}
        <Button 
          onClick={onNewChat}
          className="w-full justify-start bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-sm mb-3 font-medium"
          variant="default"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Chat
        </Button>

        {/* Search Input */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>
        <div className="space-y-2">
          {recentChats.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-4">
              {searchQuery.trim() ? 'No chats found' : 'No recent chats'}
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
                          {chat.updatedAt instanceof Date ? chat.updatedAt.toLocaleDateString() : new Date(chat.updatedAt).toLocaleDateString()}
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
