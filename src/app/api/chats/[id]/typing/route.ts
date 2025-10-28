import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/session'
import { connectToDatabase } from '@/lib/mongodb'
import { Chat } from '@/lib/models/Chat'

// POST /api/chats/[id]/typing - Update typing status
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getSessionFromRequest(request)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { isTyping, userName } = await request.json()
    
    await connectToDatabase()
    
    if (isTyping) {
      // Add or update typing user
      await Chat.findByIdAndUpdate(
        id,
        {
          $pull: { typingUsers: { userId: session.userId } }, // Remove old entry
        }
      )
      
      await Chat.findByIdAndUpdate(
        id,
        {
          $push: {
            typingUsers: {
              userId: session.userId,
              userName: userName || session.email?.split('@')[0] || 'User',
              timestamp: new Date()
            }
          }
        }
      )
    } else {
      // Remove typing user
      await Chat.findByIdAndUpdate(
        id,
        {
          $pull: { typingUsers: { userId: session.userId } }
        }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating typing status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

