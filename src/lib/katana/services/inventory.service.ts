// Inventory Service - Handle inventory management

import { getKatanaClient } from '../client';
import type {
  Inventory,
  StockAdjustment,
  Batch,
  KatanaAPIResponse,
} from '../types';

export class InventoryService {
  private client = getKatanaClient();

  // ==================== Inventory ====================

  async getCurrentStock(filters?: {
    variant_id?: string;
    location_id?: string;
    batch_number?: string;
    limit?: number;
  }): Promise<{ items: Inventory[]; total: number }> {
    const response = await this.client.get<Inventory[]>('/inventory', filters);
    return {
      items: response.data,
      total: response.meta?.total || response.data.length,
    };
  }

  async getVariantStock(variantId: string): Promise<Inventory | null> {
    const response = await this.client.get<Inventory[]>('/inventory', {
      variant_id: variantId,
      limit: 1,
    });
    return response.data.length > 0 ? response.data[0] : null;
  }

  async getLowStockItems(threshold?: number): Promise<Inventory[]> {
    const response = await this.client.get<Inventory[]>('/inventory');
    const allItems = response.data;

    // Filter items where available is less than reorder point or threshold
    return allItems.filter((item) => {
      if (item.reorder_point) {
        return item.available <= item.reorder_point;
      }
      if (threshold) {
        return item.available <= threshold;
      }
      return false;
    });
  }

  async getNegativeStockItems(): Promise<Inventory[]> {
    const response = await this.client.get<Inventory[]>('/variants/negative-stock');
    return response.data;
  }

  async updateReorderPoint(
    variantId: string,
    reorderPoint: number
  ): Promise<void> {
    await this.client.post('/inventory/reorder-point', {
      variant_id: variantId,
      reorder_point: reorderPoint,
    });
  }

  async updateSafetyStock(
    variantId: string,
    safetyStock: number
  ): Promise<void> {
    await this.client.post('/inventory/safety-stock', {
      variant_id: variantId,
      safety_stock: safetyStock,
    });
  }

  // ==================== Stock Adjustments ====================

  async createStockAdjustment(data: {
    variant_id: string;
    location_id?: string;
    batch_number?: string;
    adjustment_type: 'in' | 'out' | 'adjustment';
    quantity: number;
    reason?: string;
    notes?: string;
    reference_id?: string;
  }): Promise<StockAdjustment> {
    const response = await this.client.post<StockAdjustment>('/stock_adjustments', data);
    return response.data;
  }

  async listStockAdjustments(filters?: {
    variant_id?: string;
    location_id?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
  }): Promise<{ adjustments: StockAdjustment[]; total: number }> {
    const response = await this.client.get<StockAdjustment[]>('/stock_adjustments', filters);
    return {
      adjustments: response.data,
      total: response.meta?.total || response.data.length,
    };
  }

  async updateStockAdjustment(
    id: string,
    data: Partial<StockAdjustment>
  ): Promise<StockAdjustment> {
    const response = await this.client.patch<StockAdjustment>(`/stock_adjustments/${id}`, data);
    return response.data;
  }

  async deleteStockAdjustment(id: string): Promise<void> {
    await this.client.delete(`/stock_adjustments/${id}`);
  }

  // ==================== Batches ====================

  async createBatch(data: {
    batch_number: string;
    variant_id: string;
    quantity: number;
    manufactured_date?: string;
    expiration_date?: string;
    notes?: string;
  }): Promise<Batch> {
    const response = await this.client.post<Batch>('/batches', data);
    return response.data;
  }

  async getBatchStock(batchNumber?: string): Promise<Batch[]> {
    const response = await this.client.get<Batch[]>('/batches/stock', {
      batch_number: batchNumber,
    });
    return response.data;
  }

  async updateBatch(
    id: string,
    data: Partial<Batch>
  ): Promise<Batch> {
    const response = await this.client.patch<Batch>(`/batches/${id}`, data);
    return response.data;
  }

  // ==================== Inventory Movements ====================

  async getInventoryMovements(filters?: {
    variant_id?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
  }): Promise<any[]> {
    const response = await this.client.get('/inventory/movements', filters);
    return response.data;
  }

  // ==================== Helper Methods ====================

  async adjustStockForProduction(
    variantId: string,
    quantity: number,
    batchNumber?: string,
    moId?: string
  ): Promise<StockAdjustment> {
    return this.createStockAdjustment({
      variant_id: variantId,
      batch_number: batchNumber,
      adjustment_type: 'in',
      quantity,
      reason: 'Production completed',
      reference_id: moId,
      notes: moId ? `Manufacturing Order: ${moId}` : undefined,
    });
  }

  async adjustStockForShipment(
    variantId: string,
    quantity: number,
    batchNumber?: string,
    orderId?: string
  ): Promise<StockAdjustment> {
    return this.createStockAdjustment({
      variant_id: variantId,
      batch_number: batchNumber,
      adjustment_type: 'out',
      quantity: -quantity, // Negative for outgoing
      reason: 'Shipped to customer',
      reference_id: orderId,
      notes: orderId ? `Sales Order: ${orderId}` : undefined,
    });
  }

  async getStockSummary(): Promise<{
    totalVariants: number;
    totalStockValue: number;
    lowStockCount: number;
    negativeStockCount: number;
  }> {
    const [allStock, lowStock, negativeStock] = await Promise.all([
      this.getCurrentStock({ limit: 10000 }),
      this.getLowStockItems(),
      this.getNegativeStockItems(),
    ]);

    return {
      totalVariants: allStock.total,
      totalStockValue: allStock.items.reduce((sum, item) => sum + item.available, 0),
      lowStockCount: lowStock.length,
      negativeStockCount: negativeStock.length,
    };
  }
}

// Singleton instance
let inventoryService: InventoryService | null = null;

export function getInventoryService(): InventoryService {
  if (!inventoryService) {
    inventoryService = new InventoryService();
  }
  return inventoryService;
}



