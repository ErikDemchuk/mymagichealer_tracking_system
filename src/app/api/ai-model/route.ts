import { NextResponse } from 'next/server'
import { getAIModelInfo } from '@/lib/ai-service'

/**
 * API endpoint to get the current AI model information
 * Safe to expose - doesn't reveal API keys
 */
export async function GET() {
  try {
    const modelInfo = getAIModelInfo()
    
    return NextResponse.json({
      ...modelInfo,
      displayName: modelInfo.model || 'Not configured'
    })
  } catch (error) {
    console.error('Error getting AI model info:', error)
    return NextResponse.json(
      { error: 'Failed to get AI model info' },
      { status: 500 }
    )
  }
}

















