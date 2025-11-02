// Cook Command Implementation

import { getManufacturingService } from '../services';
import { getInventoryService } from '../services';
import { getTransferService } from '../services';
import { createProductionTask, updateProductionTaskStatus } from '../mongodb/models';
import type { CookCommandData } from '../types';

export interface CookCommandResult {
  success: boolean;
  taskId: string;
  moId: string;
  batchNumber: string;
  message: string;
  data?: any;
  error?: string;
}

export async function executeCookCommand(
  data: CookCommandData
): Promise<CookCommandResult> {
  const taskId = `COOK-${Date.now()}`;
  
  try {
    console.log(`🔵 Executing cook command for MO: ${data.manufacturingOrderId}`);

    // Create task in MongoDB
    await createProductionTask({
      taskId,
      type: 'cook',
      katanaMOId: data.manufacturingOrderId,
      batchNumber: data.batchNumber,
      data,
    });

    // Update task status
    await updateProductionTaskStatus(taskId, 'in_progress');

    const manufacturingService = getManufacturingService();
    const inventoryService = getInventoryService();
    const transferService = getTransferService();

    // 1. Get Manufacturing Order details
    const mo = await manufacturingService.getManufacturingOrder(
      data.manufacturingOrderId
    );

    if (!mo) {
      throw new Error(`Manufacturing Order ${data.manufacturingOrderId} not found`);
    }

    // 2. Start MO if not already started
    if (mo.status === 'pending') {
      await manufacturingService.startMO(data.manufacturingOrderId);
    }

    // 3. Get operations and find cooking operation
    const operations = await manufacturingService.listOperations(
      data.manufacturingOrderId
    );

    const cookingOperation = operations.find(
      (op) =>
        op.name.toLowerCase().includes('cook') ||
        op.name.toLowerCase().includes('prep') ||
        op.name.toLowerCase().includes('fill')
    );

    if (!cookingOperation) {
      throw new Error('Cooking operation not found in manufacturing order');
    }

    // 4. Calculate duration
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);
    const durationMinutes = Math.floor(
      (endTime.getTime() - startTime.getTime()) / 60000
    );

    // 5. Complete cooking operation
    await manufacturingService.completeOperation(cookingOperation.id, {
      actual_duration_minutes: durationMinutes,
      completed_at: data.endTime,
      notes: `Batch: ${data.batchNumber}, Crate: ${data.crateId}, Location: ${data.location}`,
    });

    // 6. Get ingredients and calculate consumption
    const ingredients = await manufacturingService.listRecipeIngredients(
      data.manufacturingOrderId
    );

    // Calculate multiplier based on planned vs actual
    const multiplier = data.actualQuantity / mo.quantity;

    // 7. Update ingredient consumption
    const ingredientUpdates = ingredients.map((ingredient) => ({
      id: ingredient.id,
      quantity_consumed: ingredient.quantity_required * multiplier,
      batch_number: ingredient.batch_number,
    }));

    if (ingredientUpdates.length > 0) {
      await manufacturingService.updateMultipleIngredients(ingredientUpdates);
    }

    // 8. Update MO with actual quantity
    await manufacturingService.updateManufacturingOrder(
      data.manufacturingOrderId,
      {
        actual_quantity: data.actualQuantity,
      }
    );

    // 9. Record crate location (using stock transfer system)
    // Note: This creates a record of where the cooked product is stored
    await transferService.createCrateTransfer({
      variantId: mo.product_variant_id,
      sourceCrateId: 'PRODUCTION', // Virtual source
      destinationCrateId: data.crateId,
      quantity: data.actualQuantity,
      batchNumber: data.batchNumber,
      stage: 'cooking',
      notes: `Stored at ${data.location}`,
    });

    // 10. Update task status to synced
    await updateProductionTaskStatus(taskId, 'synced');

    // 11. Create labeling task (next stage)
    await createProductionTask({
      taskId: `LABEL-${Date.now()}`,
      type: 'label',
      katanaMOId: data.manufacturingOrderId,
      batchNumber: data.batchNumber,
      data: {
        sourceCrateId: data.crateId,
        sourceLocation: data.location,
        batchNumber: data.batchNumber,
        quantityToLabel: data.actualQuantity,
      },
    });

    console.log(`✅ Cook command completed successfully for batch: ${data.batchNumber}`);

    return {
      success: true,
      taskId,
      moId: data.manufacturingOrderId,
      batchNumber: data.batchNumber,
      message: `Successfully recorded cooking for batch ${data.batchNumber}. ${data.actualQuantity} units produced and stored in ${data.crateId} at ${data.location}.`,
      data: {
        durationMinutes,
        ingredientsConsumed: ingredientUpdates.length,
        nextStage: 'labeling',
      },
    };
  } catch (error: any) {
    console.error(`❌ Cook command failed:`, error);

    // Update task status to error
    await updateProductionTaskStatus(taskId, 'error', error.message);

    return {
      success: false,
      taskId,
      moId: data.manufacturingOrderId,
      batchNumber: data.batchNumber,
      message: `Failed to record cooking: ${error.message}`,
      error: error.message,
    };
  }
}

export async function validateCookCommandData(
  data: Partial<CookCommandData>
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  if (!data.manufacturingOrderId) {
    errors.push('Manufacturing Order ID is required');
  }

  if (!data.batchNumber) {
    errors.push('Batch number is required');
  }

  if (!data.actualQuantity || data.actualQuantity <= 0) {
    errors.push('Actual quantity must be greater than 0');
  }

  if (!data.crateId) {
    errors.push('Crate ID is required');
  }

  if (!data.location) {
    errors.push('Location is required');
  }

  if (!data.startTime) {
    errors.push('Start time is required');
  }

  if (!data.endTime) {
    errors.push('End time is required');
  }

  if (data.startTime && data.endTime) {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    if (end <= start) {
      errors.push('End time must be after start time');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

