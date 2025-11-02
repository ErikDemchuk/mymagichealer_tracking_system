// Ship Command Implementation

import { getSalesService } from '../services';
import { getInventoryService } from '../services';
import { createProductionTask, updateProductionTaskStatus } from '../mongodb/models';
import type { ShipCommandData } from '../types';

export interface ShipCommandResult {
  success: boolean;
  taskId: string;
  shipmentType: 'fba' | 'shopify';
  message: string;
  data?: any;
  error?: string;
}

export async function executeShipCommand(
  data: ShipCommandData
): Promise<ShipCommandResult> {
  const taskId = `SHIP-${Date.now()}`;

  try {
    console.log(`🔵 Executing ship command (${data.shipmentType})`);

    await createProductionTask({
      taskId,
      type: 'ship',
      batchNumber: data.orders[0]?.batchNumber,
      data,
    });

    await updateProductionTaskStatus(taskId, 'in_progress');

    const salesService = getSalesService();
    const inventoryService = getInventoryService();

    if (data.shipmentType === 'fba') {
      // FBA Shipment - Create pallet fulfillment
      const fulfillments = await salesService.createFBAShipment({
        orders: data.orders.map((order) => ({
          orderId: order.orderId,
          batchNumber: order.batchNumber,
          quantity: order.quantity,
        })),
        palletId: data.palletId!,
        trackingNumber: data.trackingNumbers[0],
        carrier: data.carrier,
      });

      console.log(`✅ Created ${fulfillments.length} FBA fulfillments`);

      await updateProductionTaskStatus(taskId, 'synced');

      return {
        success: true,
        taskId,
        shipmentType: 'fba',
        message: `Successfully shipped ${data.orders.length} orders on pallet ${data.palletId}. Total units: ${data.orders.reduce((sum, o) => sum + o.quantity, 0)}.`,
        data: {
          palletId: data.palletId,
          totalOrders: data.orders.length,
          totalUnits: data.orders.reduce((sum, o) => sum + o.quantity, 0),
          trackingNumber: data.trackingNumbers[0],
          carrier: data.carrier,
        },
      };
    } else {
      // Shopify Individual Orders
      const fulfillments = [];

      for (let i = 0; i < data.orders.length; i++) {
        const order = data.orders[i];
        const trackingNumber = data.trackingNumbers[i];

        // Fulfill order
        const so = await salesService.fulfillFullOrder(
          order.orderId,
          trackingNumber,
          data.carrier,
          { [order.orderId]: order.batchNumber }
        );

        fulfillments.push(so);

        // Reduce inventory
        await inventoryService.adjustStockForShipment(
          so.id, // Using SO ID as variant reference - adjust as needed
          order.quantity,
          order.batchNumber,
          order.orderId
        );
      }

      console.log(`✅ Fulfilled ${fulfillments.length} Shopify orders`);

      await updateProductionTaskStatus(taskId, 'synced');

      return {
        success: true,
        taskId,
        shipmentType: 'shopify',
        message: `Successfully fulfilled ${data.orders.length} Shopify orders. Total units: ${data.orders.reduce((sum, o) => sum + o.quantity, 0)}.`,
        data: {
          totalOrders: data.orders.length,
          totalUnits: data.orders.reduce((sum, o) => sum + o.quantity, 0),
          trackingNumbers: data.trackingNumbers,
          carrier: data.carrier,
        },
      };
    }
  } catch (error: any) {
    console.error(`❌ Ship command failed:`, error);

    await updateProductionTaskStatus(taskId, 'error', error.message);

    return {
      success: false,
      taskId,
      shipmentType: data.shipmentType,
      message: `Failed to record shipment: ${error.message}`,
      error: error.message,
    };
  }
}

export async function validateShipCommandData(
  data: Partial<ShipCommandData>
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  if (!data.shipmentType) {
    errors.push('Shipment type is required');
  }

  if (!['fba', 'shopify'].includes(data.shipmentType || '')) {
    errors.push('Shipment type must be either "fba" or "shopify"');
  }

  if (!data.orders || data.orders.length === 0) {
    errors.push('At least one order is required');
  }

  if (!data.trackingNumbers || data.trackingNumbers.length === 0) {
    errors.push('At least one tracking number is required');
  }

  if (data.shipmentType === 'shopify') {
    if (data.orders && data.trackingNumbers) {
      if (data.orders.length !== data.trackingNumbers.length) {
        errors.push(
          'Number of tracking numbers must match number of orders for Shopify shipments'
        );
      }
    }
  }

  if (data.shipmentType === 'fba' && !data.palletId) {
    errors.push('Pallet ID is required for FBA shipments');
  }

  if (!data.carrier) {
    errors.push('Carrier is required');
  }

  if (!data.shipDate) {
    errors.push('Ship date is required');
  }

  if (data.orders) {
    data.orders.forEach((order, index) => {
      if (!order.orderId) {
        errors.push(`Order ${index + 1}: Order ID is required`);
      }
      if (!order.batchNumber) {
        errors.push(`Order ${index + 1}: Batch number is required`);
      }
      if (!order.quantity || order.quantity <= 0) {
        errors.push(`Order ${index + 1}: Quantity must be greater than 0`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

