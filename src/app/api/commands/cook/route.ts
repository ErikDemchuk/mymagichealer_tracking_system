// API Route: POST /api/commands/cook

import { NextRequest, NextResponse } from 'next/server';
import { executeCookCommand, validateCookCommandData } from '@/lib/katana/commands';
import type { CookCommandData } from '@/lib/katana/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body: CookCommandData = await request.json();

    // Validate input data
    const validation = await validateCookCommandData(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    // Execute cook command
    const result = await executeCookCommand(body);

    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    });
  } catch (error: any) {
    console.error('❌ Cook API route error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error.message,
      },
      { status: 500 }
    );
  }
}



