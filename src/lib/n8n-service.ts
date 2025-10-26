export interface N8NWebhookData {
  batch_id: string;
  product_type: string;
  location: string;
  crate_id: string;
  units: number;
  job_box: string;
  timestamp: string;
  user: string;
  task_type: string; // Add task type field
}

export async function submitToN8N(data: N8NWebhookData): Promise<boolean> {
  try {
    // Your specific N8N webhook URL
    const webhookUrl = 'https://mymagichealer.app.n8n.cloud/webhook-test/production-cook';
    
    console.log('🚀 Sending data to N8N:', data);

    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const result = await response.json();
      console.log('✅ N8N Success:', result);
      return true;
    } else {
      console.error('❌ N8N Error:', response.status, response.statusText);
      return false;
    }
    
  } catch (error) {
    // Handle all errors silently - don't use console.error to avoid UI errors
    if (error instanceof Error) {
      console.log('N8N not available:', error.message);
    } else {
      console.log('N8N not available:', error);
    }
    // Always return false instead of throwing
    return false;
  }
}

