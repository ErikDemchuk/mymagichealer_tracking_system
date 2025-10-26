export async function getOpenAIResponse(
  userMessage: string | any, 
  conversationHistory: Array<{role: 'user' | 'assistant', content: string}>,
  hasImages: boolean = false
) {
  try {
    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userMessage,
        conversationHistory,
        hasImages
      })
    })

    if (!response.ok) {
      console.error('API error:', response.statusText)
      return 'Sorry, I encountered an error. Please try again.'
    }

    const data = await response.json()
    return data.content || 'Sorry, I could not generate a response.'
    
  } catch (error) {
    console.error('Error calling OpenAI:', error)
    return 'Sorry, I encountered an error connecting to the AI service. Please try again.'
  }
}

export async function generateChatTitle(firstMessage: string): Promise<string> {
  try {
    const response = await fetch('/api/generate-title', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ firstMessage })
    })

    if (!response.ok) {
      throw new Error('Failed to generate title')
    }

    const data = await response.json()
    return data.title || `Production ${new Date().getMonth() + 1}/${new Date().getDate()}/${new Date().getFullYear()}`
  } catch (error) {
    console.error('Error generating title:', error)
    // Fallback to date-based title
    const today = new Date()
    return `Production ${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`
  }
}

