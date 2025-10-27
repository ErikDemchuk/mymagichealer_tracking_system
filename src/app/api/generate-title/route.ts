import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { firstMessage } = await request.json()

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
        content: 'You are a helpful assistant. Generate a concise, descriptive title (5-8 words max) for a production tracking conversation based on the first message. Only return the title, nothing else.'
      },
      {
        role: 'user' as const,
        content: `First message: "${firstMessage}"\nGenerate a short descriptive title for this production tracking conversation.`
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
        max_tokens: 50
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('OpenAI API error:', error)
      // Fallback to date-based title
      const today = new Date()
      return NextResponse.json({
        title: `Production ${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`
      })
    }

    const data = await response.json()
    const generatedTitle = data.choices[0]?.message?.content?.trim() || 
      `Production ${new Date().getMonth() + 1}/${new Date().getDate()}/${new Date().getFullYear()}`
    
    return NextResponse.json({
      title: generatedTitle
    })
    
  } catch (error) {
    console.error('Error generating title:', error)
    // Fallback to date-based title
    const today = new Date()
    return NextResponse.json({
      title: `Production ${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`
    })
  }
}


