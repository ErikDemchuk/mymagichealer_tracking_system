import { useState, useEffect, useCallback } from 'react'
import * as databaseService from '@/lib/database-service'
import { ChatSession } from '@/lib/supabase'

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your-supabase-project-url'
  )
}

export function useChatStorage() {
  const [useDatabase, setUseDatabase] = useState(false)

  useEffect(() => {
    setUseDatabase(isSupabaseConfigured())
  }, [])

  // Get all chats
  const getChats = useCallback(async (): Promise<ChatSession[]> => {
    if (useDatabase) {
      const chats = await databaseService.getChats()
      // Convert timestamp strings back to Date objects for all messages
      return chats.map(chat => ({
        ...chat,
        messages: chat.messages ? chat.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })) : []
      }))
    } else {
      // Fallback to localStorage
      try {
        const savedChats = localStorage.getItem('production-chats')
        if (savedChats) {
          const chats = JSON.parse(savedChats)
          return chats.map((chat: any) => ({
            id: chat.id,
            title: chat.title,
            messages: chat.messages,
            created_at: chat.createdAt,
            updated_at: chat.updatedAt,
          }))
        }
      } catch (error) {
        console.error('Error loading chats from localStorage:', error)
      }
      return []
    }
  }, [useDatabase])

  // Get a single chat
  const getChat = useCallback(async (chatId: string): Promise<ChatSession | null> => {
    if (useDatabase) {
      const chat = await databaseService.getChat(chatId)
      if (chat && chat.messages) {
        // Convert timestamp strings back to Date objects
        chat.messages = chat.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }
      return chat
    } else {
      try {
        const savedChats = localStorage.getItem('production-chats')
        if (savedChats) {
          const chats = JSON.parse(savedChats)
          const chat = chats.find((c: any) => c.id === chatId)
          if (chat) {
            // Convert timestamp strings back to Date objects
            const messagesWithDates = chat.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
            return {
              id: chat.id,
              title: chat.title,
              messages: messagesWithDates,
              created_at: chat.createdAt,
              updated_at: chat.updatedAt,
            }
          }
        }
      } catch (error) {
        console.error('Error loading chat from localStorage:', error)
      }
      return null
    }
  }, [useDatabase])

  // Create a chat
  const createChat = useCallback(async (chat: Partial<ChatSession>): Promise<ChatSession | null> => {
    if (useDatabase) {
      try {
        console.log('🔵 Creating chat with database storage')
        
        // Database service will handle getting user session
        const result = await databaseService.createChat(chat)
        if (result) {
          console.log('✅ Chat created successfully in database')
        } else {
          console.error('❌ Chat creation returned null')
        }
        return result
      } catch (error) {
        console.error('❌ Error in createChat:', error)
        return null
      }
    } else {
      try {
        const newChat: ChatSession = {
          id: chat.id || `chat-${Date.now()}`,
          title: chat.title || 'New Chat',
          messages: chat.messages || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        const savedChats = localStorage.getItem('production-chats')
        const chats = savedChats ? JSON.parse(savedChats) : []
        chats.push({
          id: newChat.id,
          title: newChat.title,
          messages: newChat.messages,
          createdAt: newChat.created_at,
          updatedAt: newChat.updated_at,
        })
        localStorage.setItem('production-chats', JSON.stringify(chats))
        return newChat
      } catch (error) {
        console.error('Error creating chat in localStorage:', error)
        return null
      }
    }
  }, [useDatabase])

  // Update a chat
  const updateChat = useCallback(async (chatId: string, updates: Partial<ChatSession>): Promise<ChatSession | null> => {
    if (useDatabase) {
      // Ensure messages are serializable (convert Date objects to strings)
      const serializableUpdates = {
        ...updates,
        messages: updates.messages ? updates.messages.map((msg: any) => ({
          ...msg,
          timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp
        })) : undefined
      }
      return await databaseService.updateChat(chatId, serializableUpdates)
    } else {
      try {
        const savedChats = localStorage.getItem('production-chats')
        if (!savedChats) return null

        const chats = JSON.parse(savedChats)
        const chatIndex = chats.findIndex((c: any) => c.id === chatId)
        
        if (chatIndex >= 0) {
          chats[chatIndex] = {
            ...chats[chatIndex],
            title: updates.title ?? chats[chatIndex].title,
            messages: updates.messages ?? chats[chatIndex].messages,
            updatedAt: new Date().toISOString(),
          }
          localStorage.setItem('production-chats', JSON.stringify(chats))
          
          return {
            id: chats[chatIndex].id,
            title: chats[chatIndex].title,
            messages: chats[chatIndex].messages,
            created_at: chats[chatIndex].createdAt,
            updated_at: chats[chatIndex].updatedAt,
          }
        }
        return null
      } catch (error) {
        console.error('Error updating chat in localStorage:', error)
        return null
      }
    }
  }, [useDatabase])

  // Delete a chat
  const deleteChat = useCallback(async (chatId: string): Promise<boolean> => {
    if (useDatabase) {
      return await databaseService.deleteChat(chatId)
    } else {
      try {
        const savedChats = localStorage.getItem('production-chats')
        if (!savedChats) return false

        const chats = JSON.parse(savedChats)
        const filteredChats = chats.filter((c: any) => c.id !== chatId)
        localStorage.setItem('production-chats', JSON.stringify(filteredChats))
        return true
      } catch (error) {
        console.error('Error deleting chat from localStorage:', error)
        return false
      }
    }
  }, [useDatabase])

  return {
    getChats,
    getChat,
    createChat,
    updateChat,
    deleteChat,
    useDatabase,
  }
}

