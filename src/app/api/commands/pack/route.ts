// API Route: POST /api/commands/pack

import { NextRequest, NextResponse } from 'next/server';
import { executePackCommand, validatePackCommandData } from '@/lib/katana/commands';
import type { PackCommandData } from '@/lib/katana/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body: PackCommandData = await request.json();

    // Validate input data
    const validation = await validatePackCommandData(body);
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

    // Execute pack command
    const result = await executePackCommand(body);

    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    });
  } catch (error: any) {
    console.error('❌ Pack API route error:', error);

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



