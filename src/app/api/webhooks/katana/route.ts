// API Route: POST /api/webhooks/katana
// Handles incoming webhook events from Katana

import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature, validateWebhookPayload, sanitizeWebhookPayload } from '@/lib/katana/utils/webhook-verifier';
import { processWebhookEvent } from '@/lib/katana/webhooks/processor';
import type { AllWebhookEvents } from '@/lib/katana/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    // 1. Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('x-katana-signature') || '';
    const webhookSecret = process.env.WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('❌ WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      );
    }

    // 2. Verify webhook signature
    const verification = verifyWebhookSignature(rawBody, signature, webhookSecret);
    
    if (!verification.isValid) {
      console.error('❌ Invalid webhook signature:', verification.error);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    console.log('✅ Webhook signature verified');

    // 3. Parse payload
    let payload: AllWebhookEvents;
    try {
      payload = JSON.parse(rawBody);
    } catch (error) {
      console.error('❌ Invalid JSON payload:', error);
      return NextResponse.json(
        { error: 'Invalid JSON' },
        { status: 400 }
      );
    }

    // 4. Validate payload structure
    const payloadValidation = validateWebhookPayload(payload);
    if (!payloadValidation.isValid) {
      console.error('❌ Invalid payload structure:', payloadValidation.errors);
      return NextResponse.json(
        { error: 'Invalid payload', details: payloadValidation.errors },
        { status: 400 }
      );
    }

    // 5. Sanitize payload
    const sanitizedPayload = sanitizeWebhookPayload(payload);

    // 6. Log webhook received
    console.log(`📨 Webhook received: ${sanitizedPayload.event_type} (${sanitizedPayload.id})`);

    // 7. Process webhook event (async, don't block response)
    processWebhookEvent(sanitizedPayload).catch((error) => {
      console.error('❌ Failed to process webhook event:', error);
    });

    // 8. Return 200 OK immediately to acknowledge receipt
    return NextResponse.json(
      {
        success: true,
        eventId: sanitizedPayload.id,
        message: 'Webhook received and queued for processing',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Webhook handler error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check webhook status
export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/webhooks/katana',
    message: 'Katana webhook endpoint is operational',
  });
}

