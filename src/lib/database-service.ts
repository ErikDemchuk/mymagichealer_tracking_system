import { supabase, ChatSession } from './supabase'

// Get all chats for a user
export async function getChats(userId?: string): Promise<ChatSession[]> {
  if (!supabase) {
    console.log('Supabase not configured, skipping database fetch')
    return []
  }
  
  try {
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      console.log('No authenticated user, returning empty chats')
      return []
    }
    
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', session.user.id)
      .order('updated_at', { ascending: false })

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
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      console.log('No authenticated user, returning null')
      return null
    }
    
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .eq('user_id', session.user.id)
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
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      console.error('No authenticated user, cannot create chat')
      return null
    }
    
    const userId = session.user.id
    
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
      user_id: userId
    }
    
    // Use provided chat.id if it exists, otherwise let Supabase generate UUID
    if (chat.id) {
      insertData.id = chat.id
    }
    
    console.log('Creating chat in database:', insertData.title, 'with', serializableMessages.length, 'messages', 'for user:', userId)
    
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
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      console.error('No authenticated user, cannot update chat')
      return null
    }
    
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
      .eq('user_id', session.user.id)
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
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      console.error('No authenticated user, cannot delete chat')
      return false
    }
    
    const { error } = await supabase
      .from('chats')
      .delete()
      .eq('id', chatId)
      .eq('user_id', session.user.id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting chat:', error)
    return false
  }
}

