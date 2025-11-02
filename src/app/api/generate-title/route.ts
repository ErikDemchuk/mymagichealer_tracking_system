import { NextRequest, NextResponse } from 'next/server'
import { chatCompletion } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  try {
    const { firstMessage } = await request.json()

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

    const { content } = await chatCompletion(messages, {
      temperature: 0.7,
      max_tokens: 50
    })

    const generatedTitle = content?.trim() || 
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


