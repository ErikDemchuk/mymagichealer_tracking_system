import { NextRequest, NextResponse } from 'next/server'
import { chatCompletion } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  try {
    const { userMessage, conversationHistory } = await request.json()

    const messages = [
      {
        role: 'system' as const,
        content: 'You are a helpful production tracking assistant for Magic Healer. Help warehouse workers track production, manage inventory, and handle quality checks.'
      },
      ...conversationHistory,
      {
        role: 'user' as const,
        content: userMessage
      }
    ]

    const { content } = await chatCompletion(messages, {
      temperature: 0.7,
      max_tokens: 1000
    })

    return NextResponse.json({
      content: content || 'Sorry, I could not generate a response.'
    })
    
  } catch (error: any) {
    console.error('Error calling AI service:', error)
    
    // Provide helpful error messages
    if (error.message?.includes('not configured')) {
      return NextResponse.json(
        { error: 'AI provider not configured. Please add either MINIMAX_API_KEY or OPENAI_API_KEY to .env.local' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

