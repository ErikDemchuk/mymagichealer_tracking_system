import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/session'
import * as databaseService from '@/lib/database-service'

// GET /api/chats/[id] - Get a single chat
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(request)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const chat = await databaseService.getChat(params.id, session.userId)
    
    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    return NextResponse.json(chat)
  } catch (error) {
    console.error('Error in GET /api/chats/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/chats/[id] - Update a chat
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(request)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updates = await request.json()
    const chat = await databaseService.updateChat(params.id, session.userId, updates)
    
    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    return NextResponse.json(chat)
  } catch (error) {
    console.error('Error in PATCH /api/chats/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/chats/[id] - Delete a chat
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(request)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const success = await databaseService.deleteChat(params.id, session.userId)
    
    if (!success) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/chats/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

