/**
 * AI Service Helper
 * Supports both OpenAI and MiniMax M-2 APIs
 */

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ChatCompletionOptions {
  model?: string
  temperature?: number
  max_tokens?: number
}

/**
 * Determines which AI provider to use based on environment variables
 * Priority: MiniMax M-2 (if API key is set), then OpenAI
 */
function getAIConfig() {
  const minimaxApiKey = process.env.MINIMAX_API_KEY
  const openaiApiKey = process.env.OPENAI_API_KEY

  if (minimaxApiKey) {
    return {
      provider: 'minimax' as const,
      baseUrl: 'https://api.minimax.io/v1',
      apiKey: minimaxApiKey,
      model: 'MiniMax-M2'
    }
  }

  if (openaiApiKey) {
    return {
      provider: 'openai' as const,
      baseUrl: 'https://api.openai.com/v1',
      apiKey: openaiApiKey,
      model: 'gpt-4o'
    }
  }

  return null
}

/**
 * Returns the current AI model information (public, safe to expose)
 */
export function getAIModelInfo() {
  const config = getAIConfig()
  
  if (!config) {
    return {
      provider: null,
      model: null,
      status: 'not_configured'
    }
  }

  return {
    provider: config.provider,
    model: config.model,
    status: 'configured'
  }
}

/**
 * Makes a chat completion request to either OpenAI or MiniMax
 */
export async function chatCompletion(
  messages: ChatMessage[],
  options: ChatCompletionOptions = {}
): Promise<{ content: string }> {
  const config = getAIConfig()

  if (!config) {
    throw new Error(
      'No AI provider configured. Please set either MINIMAX_API_KEY or OPENAI_API_KEY in your environment variables.'
    )
  }

  const {
    model = config.model,
    temperature = 0.7,
    max_tokens = 1000
  } = options

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens
    })
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    console.error(`${config.provider.toUpperCase()} API error:`, error)
    throw new Error(
      error.error?.message || 
      `Failed to get AI response from ${config.provider} (${response.status})`
    )
  }

  const data = await response.json()
  const content = data.choices[0]?.message?.content

  if (!content) {
    throw new Error(`No content received from ${config.provider}`)
  }

  return { content }
}


