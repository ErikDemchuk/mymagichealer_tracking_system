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

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ N8N Success:', result);
      return true;
    } else {
      console.error('❌ N8N Error:', response.status, response.statusText);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Connection Error:', error);
    return false;
  }
}

