import { supabase, ChatSession } from './supabase'

// Get all chats for a user
export async function getChats(userId?: string): Promise<ChatSession[]> {
  if (!supabase) {
    console.log('Supabase not configured, skipping database fetch')
    return []
  }
  
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
  if (!supabase) {
    console.log('Supabase not configured, skipping database fetch')
    return null
  }
  
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
  if (!supabase) {
    console.log('Supabase not configured, skipping database create')
    return null
  }
  
  try {
    // Don't get user session here - it should be passed from client
    const userId = chat.user_id || null
    
    // Ensure messages are serializable (convert Date objects to ISO strings)
    const serializableMessages = (chat.messages || []).map((msg: any) => ({
      ...msg,
      timestamp: msg.timestamp instanceof Date 
        ? msg.timestamp.toISOString() 
        : (typeof msg.timestamp === 'string' ? msg.timestamp : new Date().toISOString())
    }))
    
    const insertData: any = {
      title: chat.title || 'New Chat',
      messages: serializableMessages,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    // Use provided chat.id if it exists, otherwise let Supabase generate UUID
    if (chat.id) {
      insertData.id = chat.id
    }
    
    // Add user_id if we have a session
    if (userId) {
      insertData.user_id = userId
    }
    
    console.log('Creating chat in database:', insertData.title, 'with', serializableMessages.length, 'messages')
    
    const { data, error } = await supabase
      .from('chats')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Supabase error creating chat:', error)
      throw error
    }
    
    console.log('Chat created successfully:', data.id)
    return data
  } catch (error) {
    console.error('Error creating chat:', error)
    return null
  }
}

// Update a chat
export async function updateChat(chatId: string, updates: Partial<ChatSession>): Promise<ChatSession | null> {
  if (!supabase) {
    console.log('Supabase not configured, skipping database update')
    return null
  }
  
  try {
    // Handle message serialization
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }
    
    if (updates.title !== undefined) {
      updateData.title = updates.title
    }
    
    if (updates.messages !== undefined) {
      // Ensure messages are serializable
      updateData.messages = updates.messages.map((msg: any) => ({
        ...msg,
        timestamp: msg.timestamp instanceof Date 
          ? msg.timestamp.toISOString() 
          : (typeof msg.timestamp === 'string' ? msg.timestamp : new Date().toISOString())
      }))
      console.log('Updating chat with', updateData.messages.length, 'messages')
    }
    
    const { data, error } = await supabase
      .from('chats')
      .update(updateData)
      .eq('id', chatId)
      .select()
      .single()

    if (error) {
      console.error('Supabase error updating chat:', error)
      throw error
    }
    
    return data
  } catch (error) {
    console.error('Error updating chat:', error)
    return null
  }
}

// Delete a chat
export async function deleteChat(chatId: string): Promise<boolean> {
  if (!supabase) {
    console.log('Supabase not configured, skipping database delete')
    return false
  }
  
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

