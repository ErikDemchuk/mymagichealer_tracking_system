import mongoose, { Schema, Model } from 'mongoose'

export interface IMessage {
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

export interface IChat {
  _id: string
  userId: string
  title: string
  messages: IMessage[]
  createdAt: Date
  updatedAt: Date
}

const MessageSchema = new Schema({
  id: { type: String, required: true },
  text: String,
  isUser: { type: Boolean, required: true },
  timestamp: { type: Date, required: true },
  formData: Schema.Types.Mixed,
  images: [String],
  userId: String,
  userName: String,
  userEmail: String
})

const ChatSchema = new Schema<IChat>(
  {
    _id: { type: String, required: true }, // Allow UUID strings as _id
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    messages: [MessageSchema]
  },
  {
    timestamps: true,
    _id: false // Disable auto ObjectId generation
  }
)

// Index for faster queries
ChatSchema.index({ userId: 1, updatedAt: -1 })

// Prevent model recompilation in development
export const Chat: Model<IChat> = mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema)

