// Webhook signature verification

import crypto from 'crypto';

export interface WebhookVerificationResult {
  isValid: boolean;
  error?: string;
}

export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): WebhookVerificationResult {
  try {
    // Compute HMAC SHA256 of payload with secret
    const hmac = crypto.createHmac('sha256', secret);
    const payloadString = typeof payload === 'string' ? payload : payload.toString('utf8');
    hmac.update(payloadString);
    const computedSignature = hmac.digest('hex');

    // Compare signatures (constant-time comparison)
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(computedSignature)
    );

    return { isValid };
  } catch (error: any) {
    return {
      isValid: false,
      error: `Signature verification failed: ${error.message}`,
    };
  }
}

export function verifyWebhookTimestamp(
  timestamp: number,
  toleranceSeconds: number = 300 // 5 minutes
): boolean {
  const now = Math.floor(Date.now() / 1000);
  const diff = Math.abs(now - timestamp);
  return diff <= toleranceSeconds;
}

export interface WebhookPayloadValidation {
  isValid: boolean;
  errors: string[];
}

export function validateWebhookPayload(
  payload: any
): WebhookPayloadValidation {
  const errors: string[] = [];

  // Check required fields
  if (!payload.id) {
    errors.push('Missing webhook event ID');
  }

  if (!payload.event_type) {
    errors.push('Missing event_type');
  }

  if (!payload.resource_type) {
    errors.push('Missing resource_type');
  }

  if (!payload.resource_id) {
    errors.push('Missing resource_id');
  }

  if (!payload.timestamp) {
    errors.push('Missing timestamp');
  }

  if (!payload.payload) {
    errors.push('Missing payload data');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function sanitizeWebhookPayload(payload: any): any {
  // Remove potentially dangerous fields
  const sanitized = { ...payload };
  
  // Remove any __proto__ or constructor properties
  delete sanitized.__proto__;
  delete sanitized.constructor;
  delete sanitized.prototype;

  return sanitized;
}

