// API Route: POST /api/commands/receive

import { NextRequest, NextResponse } from 'next/server';
import {
  executeReceiveCommand,
  validateReceiveCommandData,
  extractPackingSlipFromPhoto,
} from '@/lib/katana/commands';
import type { ReceiveCommandData } from '@/lib/katana/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if photo is provided
    let extractedData;
    if (body.photoBase64) {
      console.log('📸 Processing packing slip photo...');
      extractedData = await extractPackingSlipFromPhoto(body.photoBase64);
      console.log(`✅ Extracted data with ${extractedData.confidence * 100}% confidence`);
    }

    // Prepare receive command data
    const receiveData: ReceiveCommandData = {
      purchaseOrderId: body.purchaseOrderId,
      items: body.items,
      receivedDate: body.receivedDate || new Date().toISOString(),
      photoUrl: body.photoUrl,
      notes: body.notes,
    };

    // Validate input data
    const validation = await validateReceiveCommandData(receiveData);
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

    // Execute receive command
    const result = await executeReceiveCommand(receiveData, extractedData);

    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    });
  } catch (error: any) {
    console.error('❌ Receive API route error:', error);

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

