import { useState, useEffect, useCallback } from 'react'
import * as databaseService from '@/lib/database-service'

export interface Message {
  id: string
  text?: string
  isUser: boolean
  timestamp: Date
  formData?: any
  images?: string[]
}

export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  created_at: string
  updated_at: string
  user_id?: string
}

// Get user ID from session cookie
function getUserId(): string | null {
  if (typeof window === 'undefined') return null
  
  try {
    const cookies = document.cookie.split(';')
    const sessionCookie = cookies.find(c => c.trim().startsWith('user_session='))
    
    if (!sessionCookie) return null
    
    const encodedSession = sessionCookie.split('=')[1]
    const sessionData = JSON.parse(atob(encodedSession))
    return sessionData.userId || null
  } catch (error) {
    console.error('Error getting user ID:', error)
    return null
  }
}

export function useChatStorage() {
  const [useDatabase, setUseDatabase] = useState(true)

  // Get all chats
  const getChats = useCallback(async (): Promise<ChatSession[]> => {
    const userId = getUserId()
    
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
    const userId = getUserId()
    
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
    const userId = getUserId()
    
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
      
      if (!response.ok) throw new Error('Failed to create chat')
      
      const newChat = await response.json()
      console.log('✅ Chat created successfully')
      return newChat
    } catch (error) {
      console.error('❌ Error creating chat:', error)
      return createLocalChat(chat)
    }
  }, [])

  // Update a chat
  const updateChat = useCallback(async (chatId: string, updates: Partial<ChatSession>): Promise<ChatSession | null> => {
    const userId = getUserId()
    
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
    const userId = getUserId()
    
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
