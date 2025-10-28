import { connectToDatabase } from './mongodb'
import { Chat, IChat, IMessage } from './models/Chat'

export interface ChatSession {
  id: string
  title: string
  messages: IMessage[]
  created_at: string
  updated_at: string
  user_id?: string
}

// Get all chats for a user
export async function getChats(userId: string): Promise<ChatSession[]> {
  try {
    await connectToDatabase()
    
    const chats = await Chat.find({ userId })
      .sort({ updatedAt: -1 })
      .lean()
      .exec()

    return chats.map(chat => ({
      id: chat._id.toString(),
      title: chat.title,
      messages: chat.messages,
      created_at: chat.createdAt.toISOString(),
      updated_at: chat.updatedAt.toISOString(),
      user_id: chat.userId
    }))
  } catch (error) {
    console.error('Error fetching chats:', error)
    return []
  }
}

// Get a single chat by ID
export async function getChat(chatId: string, userId: string): Promise<ChatSession | null> {
  try {
    await connectToDatabase()
    
    const chat = await Chat.findOne({ _id: chatId, userId })
      .lean()
      .exec()

    if (!chat) return null

    return {
      id: chat._id.toString(),
      title: chat.title,
      messages: chat.messages,
      created_at: chat.createdAt.toISOString(),
      updated_at: chat.updatedAt.toISOString(),
      user_id: chat.userId
    }
  } catch (error) {
    console.error('Error fetching chat:', error)
    return null
  }
}

// Create a new chat
export async function createChat(userId: string, chat: Partial<ChatSession>): Promise<ChatSession | null> {
  try {
    await connectToDatabase()
    
    console.log('🔵 Creating chat in MongoDB for user:', userId, 'with ID:', chat.id)
    
    const newChat = await Chat.create({
      _id: chat.id,
      userId,
      title: chat.title || 'New Chat',
      messages: chat.messages || []
    })

    console.log('✅ Chat created successfully in MongoDB:', newChat._id)

    return {
      id: newChat._id.toString(),
      title: newChat.title,
      messages: newChat.messages,
      created_at: newChat.createdAt.toISOString(),
      updated_at: newChat.updatedAt.toISOString(),
      user_id: newChat.userId
    }
  } catch (error) {
    console.error('❌ Error creating chat:', error)
    console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// Update a chat
export async function updateChat(chatId: string, userId: string, updates: Partial<ChatSession>): Promise<ChatSession | null> {
  try {
    await connectToDatabase()
    
    const updateData: any = {}
    
    if (updates.title !== undefined) {
      updateData.title = updates.title
    }
    
    if (updates.messages !== undefined) {
      updateData.messages = updates.messages
      console.log('Updating chat with', updates.messages.length, 'messages')
    }

    const chat = await Chat.findOneAndUpdate(
      { _id: chatId, userId },
      { $set: updateData },
      { new: true }
    ).lean().exec()

    if (!chat) return null

    return {
      id: chat._id.toString(),
      title: chat.title,
      messages: chat.messages,
      created_at: chat.createdAt.toISOString(),
      updated_at: chat.updatedAt.toISOString(),
      user_id: chat.userId
    }
  } catch (error) {
    console.error('Error updating chat:', error)
    return null
  }
}

// Delete a chat
export async function deleteChat(chatId: string, userId: string): Promise<boolean> {
  try {
    await connectToDatabase()
    
    const result = await Chat.deleteOne({ _id: chatId, userId })
    return result.deletedCount > 0
  } catch (error) {
    console.error('Error deleting chat:', error)
    return false
  }
}
