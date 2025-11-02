import { useState, useEffect, useCallback } from 'react'
import * as databaseService from '@/lib/database-service'
import { getCachedSession } from '@/lib/session-cache'

export interface Message {
  id: string
  text?: string
  isUser: boolean
  timestamp: Date
  formData?: any
  images?: string[]
  userId?: string
  userName?: string
  userEmail?: string
}

export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  created_at: string
  updated_at: string
  user_id?: string
}

// Get user ID from session via API (secure method with caching)
async function getUserId(): Promise<string | null> {
  const session = await getCachedSession()
  return session?.userId || null
}

// Clear userId cache (useful after logout)
export function clearUserIdCache() {
  // Re-export for convenience
  import('@/lib/session-cache').then(({ clearSessionCache }) => clearSessionCache())
}

export function useChatStorage() {
  const [useDatabase, setUseDatabase] = useState(true)

  // Get all chats
  const getChats = useCallback(async (): Promise<ChatSession[]> => {
    const userId = await getUserId()
    
    if (!userId) {
      console.log('No user ID, using localStorage')
      return getLocalChats()
    }

    try {
      const response = await fetch('/api/chats')
      if (!response.ok) throw new Error('Failed to fetch chats')
      
      const chats = await response.json()
      return chats.map((chat: any) => ({
        ...chat,
        messages: chat.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }))
    } catch (error) {
      console.error('Error fetching chats:', error)
      return getLocalChats()
    }
  }, [])

  // Get a single chat
  const getChat = useCallback(async (chatId: string): Promise<ChatSession | null> => {
    const userId = await getUserId()
    
    if (!userId) {
      return getLocalChat(chatId)
    }

    try {
      const response = await fetch(`/api/chats/${chatId}`)
      if (!response.ok) return getLocalChat(chatId)
      
      const chat = await response.json()
      if (chat.messages) {
        chat.messages = chat.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }
      return chat
    } catch (error) {
      console.error('Error fetching chat:', error)
      return getLocalChat(chatId)
    }
  }, [])

  // Create a chat
  const createChat = useCallback(async (chat: Partial<ChatSession>): Promise<ChatSession | null> => {
    const userId = await getUserId()
    
    if (!userId) {
      return createLocalChat(chat)
    }

    try {
      console.log('🔵 Creating chat with MongoDB')
      
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chat)
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        const errorMessage = errorData.details || errorData.error || `Failed to create chat: ${response.status}`
        console.error('❌ API Error:', response.status, errorData)
        console.error('❌ Error message:', errorMessage)
        throw new Error(errorMessage)
      }
      
      const newChat = await response.json()
      console.log('✅ Chat created successfully')
      return newChat
    } catch (error) {
      console.error('❌ Error creating chat:', error)
      // Fallback to local storage if database fails
      console.log('⚠️ Falling back to local storage')
      return createLocalChat(chat)
    }
  }, [])

  // Update a chat
  const updateChat = useCallback(async (chatId: string, updates: Partial<ChatSession>): Promise<ChatSession | null> => {
    const userId = await getUserId()
    
    if (!userId) {
      return updateLocalChat(chatId, updates)
    }

    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      
      if (!response.ok) throw new Error('Failed to update chat')
      
      return await response.json()
    } catch (error) {
      console.error('Error updating chat:', error)
      return updateLocalChat(chatId, updates)
    }
  }, [])

  // Delete a chat
  const deleteChat = useCallback(async (chatId: string): Promise<boolean> => {
    const userId = await getUserId()
    
    if (!userId) {
      return deleteLocalChat(chatId)
    }

    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'DELETE'
      })
      
      return response.ok
    } catch (error) {
      console.error('Error deleting chat:', error)
      return deleteLocalChat(chatId)
    }
  }, [])

  return {
    getChats,
    getChat,
    createChat,
    updateChat,
    deleteChat,
    useDatabase,
  }
}

// LocalStorage fallback functions
function getLocalChats(): ChatSession[] {
  try {
    const saved = localStorage.getItem('production-chats')
    if (!saved) return []
    return JSON.parse(saved)
  } catch {
    return []
  }
}

function getLocalChat(chatId: string): ChatSession | null {
  const chats = getLocalChats()
  return chats.find(c => c.id === chatId) || null
}

function createLocalChat(chat: Partial<ChatSession>): ChatSession {
  const newChat: ChatSession = {
    id: chat.id || crypto.randomUUID(),
    title: chat.title || 'New Chat',
    messages: chat.messages || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  const chats = getLocalChats()
  chats.push(newChat)
  localStorage.setItem('production-chats', JSON.stringify(chats))
  return newChat
}

function updateLocalChat(chatId: string, updates: Partial<ChatSession>): ChatSession | null {
  const chats = getLocalChats()
  const index = chats.findIndex(c => c.id === chatId)
  
  if (index === -1) return null
  
  chats[index] = { ...chats[index], ...updates, updated_at: new Date().toISOString() }
  localStorage.setItem('production-chats', JSON.stringify(chats))
  return chats[index]
}

function deleteLocalChat(chatId: string): boolean {
  const chats = getLocalChats()
  const filtered = chats.filter(c => c.id !== chatId)
  localStorage.setItem('production-chats', JSON.stringify(filtered))
  return true
}
