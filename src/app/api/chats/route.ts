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
    console.log('Session:', session ? `✅ Found (userId: ${session.userId})` : '❌ Not found')
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!session.userId) {
      console.error('❌ Session exists but userId is missing')
      return NextResponse.json({ error: 'User ID missing from session' }, { status: 400 })
    }

    const body = await request.json()
    console.log('📦 Request body:', { id: body.id, title: body.title, messageCount: body.messages?.length })
    
    if (!body.id) {
      console.error('❌ Chat ID is missing from request body')
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 })
    }
    
    try {
      const chat = await databaseService.createChat(session.userId, body)
      console.log('✅ Chat created successfully:', chat.id)
      return NextResponse.json(chat, { status: 201 })
    } catch (dbError) {
      // Database service now throws errors instead of returning null
      const errorMessage = dbError instanceof Error ? dbError.message : 'Unknown database error'
      console.error('❌ Database error creating chat:', errorMessage)
      return NextResponse.json({ 
        error: 'Failed to create chat in database',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      }, { status: 500 })
    }
  } catch (error) {
    console.error('❌ Error in POST /api/chats:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error('❌ Error details:', errorMessage)
    if (errorStack) {
      console.error('❌ Error stack:', errorStack)
    }
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 })
  }
}

