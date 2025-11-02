// API Route: POST /api/commands/label

import { NextRequest, NextResponse } from 'next/server';
import { executeLabelCommand, validateLabelCommandData } from '@/lib/katana/commands';
import type { LabelCommandData } from '@/lib/katana/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body: LabelCommandData = await request.json();

    // Validate input data
    const validation = await validateLabelCommandData(body);
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

    // Execute label command
    const result = await executeLabelCommand(body);

    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    });
  } catch (error: any) {
    console.error('❌ Label API route error:', error);

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



