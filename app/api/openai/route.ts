import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { userMessage, conversationHistory, hasImages } = await request.json()

    const apiKey = process.env.OPENAI_API_KEY
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const messages = [
      {
        role: 'system' as const,
        content: 'You are a helpful production tracking assistant for Magic Healer. Help warehouse workers track production, manage inventory, and handle quality checks.'
      },
      ...conversationHistory,
      {
        role: 'user' as const,
        content: hasImages ? userMessage : userMessage // If has images, userMessage is already an array
      }
    ]

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('OpenAI API error:', error)
      return NextResponse.json(
        { error: 'Failed to get AI response' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({
      content: data.choices[0]?.message?.content || 'Sorry, I could not generate a response.'
    })
    
  } catch (error) {
    console.error('Error calling OpenAI:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

