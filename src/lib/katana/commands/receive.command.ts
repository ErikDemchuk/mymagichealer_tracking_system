// Receive Command Implementation (with Photo Processing)

import { getPurchaseService } from '../services';
import { createProductionTask, updateProductionTaskStatus } from '../mongodb/models';
import type { ReceiveCommandData, ExtractedPackingSlipData } from '../types';

export interface ReceiveCommandResult {
  success: boolean;
  taskId: string;
  poId?: string;
  message: string;
  data?: any;
  error?: string;
}

export async function executeReceiveCommand(
  data: ReceiveCommandData,
  extractedData?: ExtractedPackingSlipData
): Promise<ReceiveCommandResult> {
  const taskId = `RECEIVE-${Date.now()}`;

  try {
    console.log(`🔵 Executing receive command for PO: ${data.purchaseOrderId}`);

    await createProductionTask({
      taskId,
      type: 'receive',
      data: {
        ...data,
        extractedData,
      },
    });

    await updateProductionTaskStatus(taskId, 'in_progress');

    const purchaseService = getPurchaseService();

    // 1. Get Purchase Order details
    const po = await purchaseService.getPurchaseOrder(data.purchaseOrderId);

    if (!po) {
      throw new Error(`Purchase Order ${data.purchaseOrderId} not found`);
    }

    // 2. Get PO rows
    const poRows = await purchaseService.listPurchaseOrderRows(data.purchaseOrderId);

    // 3. Match items from photo data to PO rows (if photo was used)
    const itemsToReceive = data.items.map((item) => {
      const matchingRow = poRows.find((row) => row.variant_id === item.variantId);

      if (!matchingRow) {
        console.warn(`⚠️ No PO row found for variant ${item.variantId}`);
        return null;
      }

      return {
        purchase_order_row_id: matchingRow.id,
        quantity_received: item.quantityReceived,
        batch_number: item.batchNumber,
        expiration_date: item.expirationDate,
      };
    }).filter((item) => item !== null);

    if (itemsToReceive.length === 0) {
      throw new Error('No valid items to receive');
    }

    // 4. Receive items in Katana
    await purchaseService.receivePurchaseOrder(data.purchaseOrderId, {
      line_items: itemsToReceive as any,
      received_date: data.receivedDate,
      notes: data.notes,
    });

    console.log(`✅ Received ${itemsToReceive.length} items for PO: ${data.purchaseOrderId}`);

    // 5. Update task status
    await updateProductionTaskStatus(taskId, 'synced');

    // 6. Calculate confidence if photo was used
    let confidence: number | undefined;
    if (extractedData) {
      confidence = extractedData.confidence;
    }

    return {
      success: true,
      taskId,
      poId: data.purchaseOrderId,
      message: `Successfully received ${itemsToReceive.length} items for PO ${po.po_number || data.purchaseOrderId}. Inventory has been updated.`,
      data: {
        poNumber: po.po_number,
        itemsReceived: itemsToReceive.length,
        totalItems: data.items.reduce((sum, item) => sum + item.quantityReceived, 0),
        receivedDate: data.receivedDate,
        photoUsed: !!extractedData,
        confidence: confidence,
      },
    };
  } catch (error: any) {
    console.error(`❌ Receive command failed:`, error);

    await updateProductionTaskStatus(taskId, 'error', error.message);

    return {
      success: false,
      taskId,
      poId: data.purchaseOrderId,
      message: `Failed to receive items: ${error.message}`,
      error: error.message,
    };
  }
}

export async function validateReceiveCommandData(
  data: Partial<ReceiveCommandData>
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  if (!data.purchaseOrderId) {
    errors.push('Purchase Order ID is required');
  }

  if (!data.items || data.items.length === 0) {
    errors.push('At least one item is required');
  }

  if (!data.receivedDate) {
    errors.push('Received date is required');
  }

  if (data.items) {
    data.items.forEach((item, index) => {
      if (!item.variantId) {
        errors.push(`Item ${index + 1}: Variant ID is required`);
      }
      if (!item.quantityReceived || item.quantityReceived <= 0) {
        errors.push(`Item ${index + 1}: Quantity received must be greater than 0`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// AI Vision helper to extract packing slip data from photo
export async function extractPackingSlipFromPhoto(
  photoBase64: string,
  anthropicApiKey?: string
): Promise<ExtractedPackingSlipData> {
  // This would use Claude Vision API to extract data from packing slip photo
  // For now, this is a placeholder that returns mock data
  
  console.log('🔍 Extracting packing slip data from photo...');

  // In production, this would call:
  // const response = await fetch('https://api.anthropic.com/v1/messages', {
  //   method: 'POST',
  //   headers: {
  //     'x-api-key': anthropicApiKey || process.env.ANTHROPIC_API_KEY,
  //     'anthropic-version': '2023-06-01',
  //     'content-type': 'application/json'
  //   },
  //   body: JSON.stringify({
  //     model: 'claude-3-sonnet-20240229',
  //     max_tokens: 1024,
  //     messages: [{
  //       role: 'user',
  //       content: [
  //         {
  //           type: 'image',
  //           source: {
  //             type: 'base64',
  //             media_type: 'image/jpeg',
  //             data: photoBase64,
  //           },
  //         },
  //         {
  //           type: 'text',
  //           text: 'Extract vendor name, items, quantities, and any PO reference from this packing slip. Return as JSON.',
  //         },
  //       ],
  //     }],
  //   }),
  // });

  // Mock extracted data for testing
  return {
    vendor: 'Bulk Natural Oils Inc.',
    poReference: 'PO-12345',
    date: new Date().toISOString(),
    items: [
      {
        productName: 'Olive Oil',
        sku: 'D-OIL',
        quantity: 450,
        unit: 'kg',
        batchNumber: '2501030626',
      },
    ],
    totalItems: 1,
    confidence: 0.85,
  };
}

