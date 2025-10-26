import { supabase, ChatSession } from './supabase'

// Get all chats for a user
export async function getChats(userId?: string): Promise<ChatSession[]> {
  try {
    let query = supabase
      .from('chats')
      .select('*')
      .order('updated_at', { ascending: false })

    const { data, error } = await query

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching chats:', error)
    return []
  }
}

// Get a single chat by ID
export async function getChat(chatId: string): Promise<ChatSession | null> {
  try {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching chat:', error)
    return null
  }
}

// Create a new chat
export async function createChat(chat: Partial<ChatSession>): Promise<ChatSession | null> {
  try {
    const { data, error } = await supabase
      .from('chats')
      .insert({
        title: chat.title || 'New Chat',
        messages: chat.messages || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating chat:', error)
    return null
  }
}

// Update a chat
export async function updateChat(chatId: string, updates: Partial<ChatSession>): Promise<ChatSession | null> {
  try {
    const { data, error } = await supabase
      .from('chats')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', chatId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating chat:', error)
    return null
  }
}

// Delete a chat
export async function deleteChat(chatId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('chats')
      .delete()
      .eq('id', chatId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting chat:', error)
    return false
  }
}

