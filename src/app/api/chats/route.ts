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
    console.log('🔵 POST /api/chats - Starting')
    
    const session = getSessionFromRequest(request)
    console.log('Session:', session ? '✅ Found' : '❌ Not found')
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('📦 Request body:', { id: body.id, title: body.title, messageCount: body.messages?.length })
    
    const chat = await databaseService.createChat(session.userId, body)
    console.log('Database result:', chat ? '✅ Created' : '❌ Failed')
    
    if (!chat) {
      return NextResponse.json({ error: 'Failed to create chat' }, { status: 500 })
    }

    console.log('✅ Chat created successfully:', chat.id)
    return NextResponse.json(chat, { status: 201 })
  } catch (error) {
    console.error('❌ Error in POST /api/chats:', error)
    console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

