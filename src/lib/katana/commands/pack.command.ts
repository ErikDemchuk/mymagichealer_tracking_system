// Pack Command Implementation

import { getManufacturingService } from '../services';
import { getInventoryService } from '../services';
import { createProductionTask, updateProductionTaskStatus } from '../mongodb/models';
import type { PackCommandData } from '../types';

export interface PackCommandResult {
  success: boolean;
  taskId: string;
  moId: string;
  batchNumber: string;
  message: string;
  data?: any;
  error?: string;
}

export async function executePackCommand(
  data: PackCommandData
): Promise<PackCommandResult> {
  const taskId = `PACK-${Date.now()}`;

  try {
    console.log(`🔵 Executing pack command for batch: ${data.batchNumber}`);

    await createProductionTask({
      taskId,
      type: 'pack',
      katanaMOId: data.manufacturingOrderId,
      batchNumber: data.batchNumber,
      data,
    });

    await updateProductionTaskStatus(taskId, 'in_progress');

    const manufacturingService = getManufacturingService();
    const inventoryService = getInventoryService();

    // 1. Get Manufacturing Order
    const mo = await manufacturingService.getManufacturingOrder(
      data.manufacturingOrderId
    );

    if (!mo) {
      throw new Error(`Manufacturing Order ${data.manufacturingOrderId} not found`);
    }

    // 2. Finalize Manufacturing Order
    await manufacturingService.finalizeMO(
      data.manufacturingOrderId,
      data.retailBoxesPacked
    );

    // 3. Add finished goods to inventory
    await inventoryService.adjustStockForProduction(
      mo.product_variant_id,
      data.retailBoxesPacked,
      data.batchNumber,
      data.manufacturingOrderId
    );

    // 4. Deduct packing materials from inventory
    // Retail boxes
    // Uline boxes
    // Guidelines
    // Note: These would need variant IDs from your Katana setup

    // 5. Calculate total production time
    const moDetails = await manufacturingService.getMOWithDetails(
      data.manufacturingOrderId
    );

    let totalProductionTime: number | undefined;
    if (mo.actual_start_date) {
      const start = new Date(mo.actual_start_date);
      const end = new Date();
      totalProductionTime = Math.floor((end.getTime() - start.getTime()) / 60000);
    }

    // 6. Update task status
    await updateProductionTaskStatus(taskId, 'synced');

    // 7. Create shipping task based on destination
    const nextTaskType = data.destination === 'fba' ? 'FBA Shipment' : 'Shopify Fulfillment';
    
    await createProductionTask({
      taskId: `SHIP-${Date.now()}`,
      type: 'ship',
      katanaMOId: data.manufacturingOrderId,
      batchNumber: data.batchNumber,
      data: {
        batchNumber: data.batchNumber,
        quantity: data.retailBoxesPacked,
        destination: data.destination,
        productSize: data.productSize,
      },
    });

    console.log(`✅ Pack command completed for batch: ${data.batchNumber}`);

    return {
      success: true,
      taskId,
      moId: data.manufacturingOrderId,
      batchNumber: data.batchNumber,
      message: `Successfully packed ${data.retailBoxesPacked} retail boxes into ${data.ulineBoxesUsed} Uline boxes for ${data.destination.toUpperCase()}. Manufacturing order completed.`,
      data: {
        totalProductionTime,
        retailBoxesPacked: data.retailBoxesPacked,
        ulineBoxesUsed: data.ulineBoxesUsed,
        destination: data.destination,
        nextStage: nextTaskType,
      },
    };
  } catch (error: any) {
    console.error(`❌ Pack command failed:`, error);

    await updateProductionTaskStatus(taskId, 'error', error.message);

    return {
      success: false,
      taskId,
      moId: data.manufacturingOrderId,
      batchNumber: data.batchNumber,
      message: `Failed to record packing: ${error.message}`,
      error: error.message,
    };
  }
}

export async function validatePackCommandData(
  data: Partial<PackCommandData>
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  if (!data.manufacturingOrderId) {
    errors.push('Manufacturing Order ID is required');
  }

  if (!data.batchNumber) {
    errors.push('Batch number is required');
  }

  if (!data.sourceCrateId) {
    errors.push('Source crate ID is required');
  }

  if (!data.productSize) {
    errors.push('Product size is required');
  }

  if (!['1oz', '2oz', '4oz'].includes(data.productSize || '')) {
    errors.push('Product size must be 1oz, 2oz, or 4oz');
  }

  if (!data.retailBoxesPacked || data.retailBoxesPacked <= 0) {
    errors.push('Retail boxes packed must be greater than 0');
  }

  if (!data.ulineBoxesUsed || data.ulineBoxesUsed <= 0) {
    errors.push('Uline boxes used must be greater than 0');
  }

  if (!data.guidelinesUsed || data.guidelinesUsed <= 0) {
    errors.push('Guidelines used must be greater than 0');
  }

  if (!data.destination) {
    errors.push('Destination is required');
  }

  if (!['fba', 'shopify'].includes(data.destination || '')) {
    errors.push('Destination must be either "fba" or "shopify"');
  }

  if (!data.packedBy) {
    errors.push('Packed by is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}



