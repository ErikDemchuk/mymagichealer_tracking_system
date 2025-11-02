// Label Command Implementation

import { getManufacturingService } from '../services';
import { getTransferService } from '../services';
import { createProductionTask, updateProductionTaskStatus } from '../mongodb/models';
import type { LabelCommandData } from '../types';

export interface LabelCommandResult {
  success: boolean;
  taskId: string;
  moId: string;
  batchNumber: string;
  message: string;
  data?: any;
  error?: string;
}

export async function executeLabelCommand(
  data: LabelCommandData
): Promise<LabelCommandResult> {
  const taskId = `LABEL-${Date.now()}`;

  try {
    console.log(`🔵 Executing label command for batch: ${data.batchNumber}`);

    // Create task in MongoDB
    await createProductionTask({
      taskId,
      type: 'label',
      katanaMOId: data.manufacturingOrderId,
      batchNumber: data.batchNumber,
      data,
    });

    await updateProductionTaskStatus(taskId, 'in_progress');

    const manufacturingService = getManufacturingService();
    const transferService = getTransferService();

    // 1. Get Manufacturing Order
    const mo = await manufacturingService.getManufacturingOrder(
      data.manufacturingOrderId
    );

    if (!mo) {
      throw new Error(`Manufacturing Order ${data.manufacturingOrderId} not found`);
    }

    // 2. Get operations and find labeling operation
    const operations = await manufacturingService.listOperations(
      data.manufacturingOrderId
    );

    const labelingOperation = operations.find(
      (op) =>
        op.name.toLowerCase().includes('label') ||
        op.name.toLowerCase().includes('clos') ||
        op.name.toLowerCase().includes('stor')
    );

    if (!labelingOperation) {
      throw new Error('Labeling operation not found in manufacturing order');
    }

    // 3. Calculate duration
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);
    const durationMinutes = Math.floor(
      (endTime.getTime() - startTime.getTime()) / 60000
    );

    // 4. Create stock transfer (crate to crate movement)
    await transferService.createCrateTransfer({
      variantId: mo.product_variant_id,
      sourceCrateId: data.sourceCrateId,
      destinationCrateId: data.destinationCrateId,
      quantity: data.quantityLabeled,
      batchNumber: data.batchNumber,
      stage: 'labeling',
      notes: `From ${data.sourceLocation} to ${data.destinationLocation}`,
    });

    // 5. Complete labeling operation
    await manufacturingService.completeOperation(labelingOperation.id, {
      actual_duration_minutes: durationMinutes,
      completed_at: data.endTime,
      notes: `Labeled ${data.quantityLabeled} units. Moved from ${data.sourceCrateId} to ${data.destinationCrateId}`,
    });

    // 6. Calculate cook-to-label duration
    const cookOperation = operations.find(
      (op) =>
        op.name.toLowerCase().includes('cook') ||
        op.name.toLowerCase().includes('prep')
    );

    let cookToLabelDuration: number | undefined;
    if (cookOperation?.completed_at) {
      const cookCompleted = new Date(cookOperation.completed_at);
      const labelStarted = new Date(data.startTime);
      cookToLabelDuration = Math.floor(
        (labelStarted.getTime() - cookCompleted.getTime()) / 60000
      );
    }

    // 7. Update task status
    await updateProductionTaskStatus(taskId, 'synced');

    // 8. Create packing task (next stage)
    await createProductionTask({
      taskId: `PACK-${Date.now()}`,
      type: 'pack',
      katanaMOId: data.manufacturingOrderId,
      batchNumber: data.batchNumber,
      data: {
        sourceCrateId: data.destinationCrateId,
        sourceLocation: data.destinationLocation,
        batchNumber: data.batchNumber,
        quantityToPack: data.quantityLabeled,
      },
    });

    console.log(`✅ Label command completed for batch: ${data.batchNumber}`);

    return {
      success: true,
      taskId,
      moId: data.manufacturingOrderId,
      batchNumber: data.batchNumber,
      message: `Successfully labeled ${data.quantityLabeled} units. Moved from ${data.sourceCrateId} (${data.sourceLocation}) to ${data.destinationCrateId} (${data.destinationLocation}).`,
      data: {
        durationMinutes,
        cookToLabelDuration,
        nextStage: 'packing',
      },
    };
  } catch (error: any) {
    console.error(`❌ Label command failed:`, error);

    await updateProductionTaskStatus(taskId, 'error', error.message);

    return {
      success: false,
      taskId,
      moId: data.manufacturingOrderId,
      batchNumber: data.batchNumber,
      message: `Failed to record labeling: ${error.message}`,
      error: error.message,
    };
  }
}

export async function validateLabelCommandData(
  data: Partial<LabelCommandData>
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

  if (!data.sourceLocation) {
    errors.push('Source location is required');
  }

  if (!data.destinationCrateId) {
    errors.push('Destination crate ID is required');
  }

  if (!data.destinationLocation) {
    errors.push('Destination location is required');
  }

  if (!data.quantityLabeled || data.quantityLabeled <= 0) {
    errors.push('Quantity labeled must be greater than 0');
  }

  if (!data.startTime) {
    errors.push('Start time is required');
  }

  if (!data.endTime) {
    errors.push('End time is required');
  }

  if (data.sourceCrateId === data.destinationCrateId) {
    errors.push('Source and destination crate must be different');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}



