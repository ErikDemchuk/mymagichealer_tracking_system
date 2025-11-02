// API Route: POST /api/commands/ship

import { NextRequest, NextResponse } from 'next/server';
import { executeShipCommand, validateShipCommandData } from '@/lib/katana/commands';
import type { ShipCommandData } from '@/lib/katana/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body: ShipCommandData = await request.json();

    // Validate input data
    const validation = await validateShipCommandData(body);
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

    // Execute ship command
    const result = await executeShipCommand(body);

    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    });
  } catch (error: any) {
    console.error('❌ Ship API route error:', error);

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

