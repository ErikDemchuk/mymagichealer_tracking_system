// Manufacturing Service - Handle all manufacturing operations

import { getKatanaClient } from '../client';
import type {
  ManufacturingOrder,
  ManufacturingOrderOperation,
  ManufacturingOrderProduction,
  ManufacturingOrderRecipe,
  KatanaAPIResponse,
} from '../types';

export class ManufacturingService {
  private client = getKatanaClient();

  // ==================== Manufacturing Orders ====================

  async createManufacturingOrder(data: {
    product_variant_id: string;
    quantity: number;
    batch_number?: string;
    scheduled_start_date?: string;
    deadline?: string;
    notes?: string;
  }): Promise<ManufacturingOrder> {
    const response = await this.client.post<ManufacturingOrder>('/manufacturing_orders', data);
    return response.data;
  }

  async getManufacturingOrder(id: string): Promise<ManufacturingOrder> {
    const response = await this.client.get<ManufacturingOrder>(`/manufacturing_orders/${id}`);
    return response.data;
  }

  async listManufacturingOrders(filters?: {
    status?: string;
    batch_number?: string;
    product_variant_id?: string;
    limit?: number;
    page?: number;
  }): Promise<{ orders: ManufacturingOrder[]; total: number }> {
    const response = await this.client.get<ManufacturingOrder[]>('/manufacturing_orders', filters);
    return {
      orders: response.data,
      total: response.meta?.total || response.data.length,
    };
  }

  async updateManufacturingOrder(
    id: string,
    data: Partial<ManufacturingOrder>
  ): Promise<ManufacturingOrder> {
    const response = await this.client.patch<ManufacturingOrder>(`/manufacturing_orders/${id}`, data);
    return response.data;
  }

  async deleteManufacturingOrder(id: string): Promise<void> {
    await this.client.delete(`/manufacturing_orders/${id}`);
  }

  // ==================== Manufacturing Order Operations ====================

  async createOperation(data: {
    manufacturing_order_id: string;
    name: string;
    resource_type?: string;
    resource_id?: string;
    sequence: number;
    duration_minutes?: number;
    notes?: string;
  }): Promise<ManufacturingOrderOperation> {
    const response = await this.client.post<ManufacturingOrderOperation>(
      '/manufacturing_order_operations',
      data
    );
    return response.data;
  }

  async getOperation(id: string): Promise<ManufacturingOrderOperation> {
    const response = await this.client.get<ManufacturingOrderOperation>(
      `/manufacturing_order_operations/${id}`
    );
    return response.data;
  }

  async listOperations(manufacturingOrderId: string): Promise<ManufacturingOrderOperation[]> {
    const response = await this.client.get<ManufacturingOrderOperation[]>(
      '/manufacturing_order_operations',
      {
        manufacturing_order_id: manufacturingOrderId,
      }
    );
    return response.data;
  }

  async updateOperation(
    id: string,
    data: Partial<ManufacturingOrderOperation>
  ): Promise<ManufacturingOrderOperation> {
    const response = await this.client.patch<ManufacturingOrderOperation>(
      `/manufacturing_order_operations/${id}`,
      data
    );
    return response.data;
  }

  async completeOperation(
    operationId: string,
    data: {
      actual_duration_minutes?: number;
      completed_at?: string;
      notes?: string;
    } = {}
  ): Promise<ManufacturingOrderOperation> {
    return this.updateOperation(operationId, {
      status: 'done',
      completed_at: data.completed_at || new Date().toISOString(),
      actual_duration_minutes: data.actual_duration_minutes,
      notes: data.notes,
    });
  }

  async deleteOperation(id: string): Promise<void> {
    await this.client.delete(`/manufacturing_order_operations/${id}`);
  }

  // ==================== Manufacturing Order Productions ====================

  async createProduction(data: {
    manufacturing_order_id: string;
    quantity_produced: number;
    production_date: string;
    batch_number?: string;
    notes?: string;
  }): Promise<ManufacturingOrderProduction> {
    const response = await this.client.post<ManufacturingOrderProduction>(
      '/manufacturing_order_productions',
      data
    );
    return response.data;
  }

  async getProduction(id: string): Promise<ManufacturingOrderProduction> {
    const response = await this.client.get<ManufacturingOrderProduction>(
      `/manufacturing_order_productions/${id}`
    );
    return response.data;
  }

  async updateProduction(
    id: string,
    data: Partial<ManufacturingOrderProduction>
  ): Promise<ManufacturingOrderProduction> {
    const response = await this.client.patch<ManufacturingOrderProduction>(
      `/manufacturing_order_productions/${id}`,
      data
    );
    return response.data;
  }

  async deleteProduction(id: string): Promise<void> {
    await this.client.delete(`/manufacturing_order_productions/${id}`);
  }

  // ==================== Manufacturing Order Recipe (Ingredients) ====================

  async listRecipeIngredients(manufacturingOrderId: string): Promise<ManufacturingOrderRecipe[]> {
    const response = await this.client.get<ManufacturingOrderRecipe[]>(
      '/manufacturing_order_recipes',
      {
        manufacturing_order_id: manufacturingOrderId,
      }
    );
    return response.data;
  }

  async updateIngredientConsumption(
    ingredientId: string,
    data: {
      quantity_consumed: number;
      batch_number?: string;
    }
  ): Promise<ManufacturingOrderRecipe> {
    const response = await this.client.patch<ManufacturingOrderRecipe>(
      `/manufacturing_order_production_ingredients/${ingredientId}`,
      data
    );
    return response.data;
  }

  async updateMultipleIngredients(
    ingredients: Array<{
      id: string;
      quantity_consumed: number;
      batch_number?: string;
    }>
  ): Promise<ManufacturingOrderRecipe[]> {
    // Katana API may not support bulk updates, so we update one by one
    const results = await Promise.all(
      ingredients.map((ingredient) =>
        this.updateIngredientConsumption(ingredient.id, {
          quantity_consumed: ingredient.quantity_consumed,
          batch_number: ingredient.batch_number,
        })
      )
    );
    return results;
  }

  // ==================== Helper Methods ====================

  async getManufacturingOrderByBatchNumber(batchNumber: string): Promise<ManufacturingOrder | null> {
    const response = await this.client.get<ManufacturingOrder[]>('/manufacturing_orders', {
      batch_number: batchNumber,
      limit: 1,
    });
    
    return response.data.length > 0 ? response.data[0] : null;
  }

  async finalizeMO(
    moId: string,
    actualQuantity?: number
  ): Promise<ManufacturingOrder> {
    const updateData: Partial<ManufacturingOrder> = {
      status: 'done',
      completed_at: new Date().toISOString(),
    };

    if (actualQuantity !== undefined) {
      updateData.actual_quantity = actualQuantity;
    }

    return this.updateManufacturingOrder(moId, updateData);
  }

  async startMO(moId: string): Promise<ManufacturingOrder> {
    return this.updateManufacturingOrder(moId, {
      status: 'in_progress',
      actual_start_date: new Date().toISOString(),
    });
  }

  async getMOWithDetails(moId: string): Promise<{
    mo: ManufacturingOrder;
    operations: ManufacturingOrderOperation[];
    ingredients: ManufacturingOrderRecipe[];
  }> {
    const [mo, operations, ingredients] = await Promise.all([
      this.getManufacturingOrder(moId),
      this.listOperations(moId),
      this.listRecipeIngredients(moId),
    ]);

    return { mo, operations, ingredients };
  }
}

// Singleton instance
let manufacturingService: ManufacturingService | null = null;

export function getManufacturingService(): ManufacturingService {
  if (!manufacturingService) {
    manufacturingService = new ManufacturingService();
  }
  return manufacturingService;
}



