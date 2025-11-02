// Webhook Event Processor

import { createKatanaEvent, updateKatanaEventStatus, createProductionTask } from '../mongodb/models';
import type { AllWebhookEvents } from '../types';

export async function processWebhookEvent(event: AllWebhookEvents): Promise<void> {
  console.log(`🔵 Processing webhook event: ${event.event_type}`);

  try {
    // Store event in MongoDB
    await createKatanaEvent({
      eventId: event.id,
      eventType: event.event_type,
      resourceType: event.resource_type,
      resourceId: event.resource_id,
      payload: event.payload,
    });

    // Process based on event type
    switch (event.event_type) {
      case 'manufacturing_order.created':
        await handleMOCreated(event);
        break;

      case 'manufacturing_order.updated':
        await handleMOUpdated(event);
        break;

      case 'manufacturing_order.completed':
        await handleMOCompleted(event);
        break;

      case 'inventory.updated':
        await handleInventoryUpdated(event);
        break;

      case 'inventory.low_stock':
        await handleLowStock(event);
        break;

      case 'purchase_order.received':
        await handlePOReceived(event);
        break;

      case 'sales_order.created':
        await handleSOCreated(event);
        break;

      case 'sales_order.fulfilled':
        await handleSOFulfilled(event);
        break;

      default:
        console.log(`⚠️ Unhandled event type: ${event.event_type}`);
    }

    // Mark event as processed
    await updateKatanaEventStatus(event.id, 'processed');
    console.log(`✅ Event ${event.id} processed successfully`);
  } catch (error: any) {
    console.error(`❌ Failed to process event ${event.id}:`, error);
    await updateKatanaEventStatus(event.id, 'failed', error.message);
    throw error;
  }
}

// ==================== Event Handlers ====================

async function handleMOCreated(event: AllWebhookEvents & { event_type: 'manufacturing_order.created' }) {
  const mo = event.payload;

  console.log(`📦 New MO created: ${mo.id} - ${mo.product_name}`);

  // Create cooking task automatically
  await createProductionTask({
    taskId: `COOK-${mo.id}-${Date.now()}`,
    type: 'cook',
    katanaMOId: mo.id,
    batchNumber: mo.batch_number,
    data: {
      manufacturingOrderId: mo.id,
      productName: mo.product_name,
      plannedQuantity: mo.quantity,
      scheduledStartDate: mo.scheduled_start_date,
      deadline: mo.deadline,
    },
  });

  console.log(`✅ Created cook task for MO: ${mo.id}`);
}

async function handleMOUpdated(event: AllWebhookEvents & { event_type: 'manufacturing_order.updated' }) {
  const mo = event.payload;
  console.log(`🔄 MO updated: ${mo.id} - Status: ${mo.status}`);

  // Update dashboard or send notifications
  // This could trigger real-time updates to connected clients
}

async function handleMOCompleted(event: AllWebhookEvents & { event_type: 'manufacturing_order.completed' }) {
  const mo = event.payload;
  console.log(`✅ MO completed: ${mo.id} - ${mo.actual_quantity} units produced`);

  // Send completion notification
  // Update production metrics
}

async function handleInventoryUpdated(event: AllWebhookEvents & { event_type: 'inventory.updated' }) {
  const { variant_id, old_quantity, new_quantity } = event.payload;
  const change = new_quantity - old_quantity;

  console.log(`📊 Inventory updated: Variant ${variant_id} changed by ${change}`);

  // Update inventory cache in MongoDB
  // Trigger dashboard refresh
}

async function handleLowStock(event: AllWebhookEvents & { event_type: 'inventory.low_stock' }) {
  const { variant_id, variant_name, current_stock, reorder_point } = event.payload;

  console.log(`🚨 Low stock alert: ${variant_name} (${current_stock} units remaining)`);

  // Send AI purchase recommendation to chat
  // Create notification for purchasing team
  // Could trigger automatic PO creation based on rules
}

async function handlePOReceived(event: AllWebhookEvents & { event_type: 'purchase_order.received' }) {
  const po = event.payload;

  console.log(`📦 PO received: ${po.id} - ${po.po_number}`);

  // Notify warehouse team
  // Update inventory cache
  // Send confirmation notification
}

async function handleSOCreated(event: AllWebhookEvents & { event_type: 'sales_order.created' }) {
  const so = event.payload;

  console.log(`🛒 New sales order: ${so.id} - ${so.order_number}`);

  // Create fulfillment task if items are in stock
  // Or create production task if make-to-order
}

async function handleSOFulfilled(event: AllWebhookEvents & { event_type: 'sales_order.fulfilled' }) {
  const so = event.payload;

  console.log(`📦 Order fulfilled: ${so.id} - ${so.order_number}`);

  // Send shipping confirmation
  // Update customer
  // Update sales metrics
}

// ==================== Batch Event Processing ====================

export async function processPendingEvents(): Promise<{
  processed: number;
  failed: number;
}> {
  const { getPendingKatanaEvents } = await import('../mongodb/models');
  const pendingEvents = await getPendingKatanaEvents();

  console.log(`🔄 Processing ${pendingEvents.length} pending events`);

  let processed = 0;
  let failed = 0;

  for (const eventDoc of pendingEvents) {
    try {
      const event: AllWebhookEvents = {
        id: eventDoc.eventId,
        event_type: eventDoc.eventType as any,
        resource_type: eventDoc.resourceType,
        resource_id: eventDoc.resourceId,
        timestamp: eventDoc.createdAt.toISOString(),
        payload: eventDoc.payload,
      };

      await processWebhookEvent(event);
      processed++;
    } catch (error) {
      console.error(`Failed to process event ${eventDoc.eventId}:`, error);
      failed++;
    }
  }

  console.log(`✅ Processed ${processed} events, ${failed} failed`);

  return { processed, failed };
}

