export interface N8NWebhookData {
  batchNumber?: string;
  storageLocation?: string;
  productType?: string;
  crateId?: string;
  jarCount?: string;
  jobBoxNumber?: string;
  action?: string; // Added action for generic forms, though cook form uses specific fields
  summary: string;
  user: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
  taskType: string;
}

export async function submitToN8N(data: N8NWebhookData): Promise<boolean> {
  try {
    const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL
    
    if (!webhookUrl) {
      console.warn('N8N webhook URL not configured')
      return false
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    return response.ok
  } catch (error) {
    console.error('Failed to submit to N8N:', error)
    return false
  }
}

