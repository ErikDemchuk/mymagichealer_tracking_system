import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/session'
import * as databaseService from '@/lib/database-service'

// GET /api/chats - Get all chats for user
export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const chats = await databaseService.getChats(session.userId)
    return NextResponse.json(chats)
  } catch (error) {
    console.error('Error in GET /api/chats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/chats - Create a new chat
export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const chat = await databaseService.createChat(session.userId, body)
    
    if (!chat) {
      return NextResponse.json({ error: 'Failed to create chat' }, { status: 500 })
    }

    return NextResponse.json(chat, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/chats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

