// Sales Service - Handle sales orders and fulfillment

import { getKatanaClient } from '../client';
import type {
  SalesOrder,
  SalesOrderRow,
  SalesOrderFulfillment,
  FulfillOrderPayload,
  KatanaAPIResponse,
} from '../types';

export class SalesService {
  private client = getKatanaClient();

  // ==================== Sales Orders ====================

  async createSalesOrder(data: {
    customer_id: string;
    order_date?: string;
    expected_delivery_date?: string;
    notes?: string;
    line_items: Array<{
      variant_id: string;
      quantity: number;
      unit_price?: number;
    }>;
  }): Promise<SalesOrder> {
    // Create SO
    const soResponse = await this.client.post<SalesOrder>('/sales_orders', {
      customer_id: data.customer_id,
      order_date: data.order_date || new Date().toISOString(),
      expected_delivery_date: data.expected_delivery_date,
      notes: data.notes,
    });

    const so = soResponse.data;

    // Add line items
    await Promise.all(
      data.line_items.map((item) =>
        this.client.post('/sales_order_rows', {
          sales_order_id: so.id,
          variant_id: item.variant_id,
          quantity_ordered: item.quantity,
          unit_price: item.unit_price,
        })
      )
    );

    return so;
  }

  async listSalesOrders(filters?: {
    status?: string;
    customer_id?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
  }): Promise<{ orders: SalesOrder[]; total: number }> {
    const response = await this.client.get<SalesOrder[]>('/sales_orders', filters);
    return {
      orders: response.data,
      total: response.meta?.total || response.data.length,
    };
  }

  async getSalesOrder(id: string): Promise<SalesOrder> {
    const response = await this.client.get<SalesOrder>(`/sales_orders/${id}`);
    return response.data;
  }

  async getPendingOrders(): Promise<SalesOrder[]> {
    const response = await this.client.get<SalesOrder[]>('/sales_orders', {
      status: 'pending,in_progress',
    });
    return response.data;
  }

  async updateSalesOrder(
    id: string,
    data: Partial<SalesOrder>
  ): Promise<SalesOrder> {
    const response = await this.client.patch<SalesOrder>(`/sales_orders/${id}`, data);
    return response.data;
  }

  async deleteSalesOrder(id: string): Promise<void> {
    await this.client.delete(`/sales_orders/${id}`);
  }

  // ==================== Sales Order Rows ====================

  async listSalesOrderRows(salesOrderId: string): Promise<SalesOrderRow[]> {
    const response = await this.client.get<SalesOrderRow[]>('/sales_order_rows', {
      sales_order_id: salesOrderId,
    });
    return response.data;
  }

  async createSalesOrderRow(data: {
    sales_order_id: string;
    variant_id: string;
    quantity_ordered: number;
    unit_price?: number;
    notes?: string;
  }): Promise<SalesOrderRow> {
    const response = await this.client.post<SalesOrderRow>('/sales_order_rows', data);
    return response.data;
  }

  async updateSalesOrderRow(
    id: string,
    data: Partial<SalesOrderRow>
  ): Promise<SalesOrderRow> {
    const response = await this.client.patch<SalesOrderRow>(`/sales_order_rows/${id}`, data);
    return response.data;
  }

  async deleteSalesOrderRow(id: string): Promise<void> {
    await this.client.delete(`/sales_order_rows/${id}`);
  }

  // ==================== Fulfillment ====================

  async createFulfillment(data: {
    sales_order_id: string;
    fulfillment_date?: string;
    tracking_number?: string;
    carrier?: string;
    shipment_type?: 'standard' | 'express' | 'fba';
    line_items: Array<{
      sales_order_row_id: string;
      quantity_fulfilled: number;
      batch_number?: string;
    }>;
    notes?: string;
  }): Promise<SalesOrderFulfillment> {
    const response = await this.client.post<SalesOrderFulfillment>(
      '/sales_order_fulfillments',
      {
        sales_order_id: data.sales_order_id,
        fulfillment_date: data.fulfillment_date || new Date().toISOString(),
        tracking_number: data.tracking_number,
        carrier: data.carrier,
        notes: data.notes,
        line_items: data.line_items,
      }
    );
    return response.data;
  }

  async listFulfillments(salesOrderId: string): Promise<SalesOrderFulfillment[]> {
    const response = await this.client.get<SalesOrderFulfillment[]>(
      '/sales_order_fulfillments',
      {
        sales_order_id: salesOrderId,
      }
    );
    return response.data;
  }

  async getFulfillment(id: string): Promise<SalesOrderFulfillment> {
    const response = await this.client.get<SalesOrderFulfillment>(
      `/sales_order_fulfillments/${id}`
    );
    return response.data;
  }

  async updateFulfillment(
    id: string,
    data: Partial<SalesOrderFulfillment>
  ): Promise<SalesOrderFulfillment> {
    const response = await this.client.patch<SalesOrderFulfillment>(
      `/sales_order_fulfillments/${id}`,
      data
    );
    return response.data;
  }

  async deleteFulfillment(id: string): Promise<void> {
    await this.client.delete(`/sales_order_fulfillments/${id}`);
  }

  // ==================== Helper Methods ====================

  async fulfillOrder(
    orderId: string,
    fulfillData: FulfillOrderPayload
  ): Promise<SalesOrder> {
    // Create fulfillment
    await this.createFulfillment({
      sales_order_id: orderId,
      fulfillment_date: fulfillData.shipment_date,
      tracking_number: fulfillData.tracking_number,
      carrier: fulfillData.carrier,
      line_items: fulfillData.line_items,
      notes: fulfillData.notes,
    });

    // Get updated order
    return this.getSalesOrder(orderId);
  }

  async fulfillFullOrder(
    orderId: string,
    trackingNumber?: string,
    carrier?: string,
    batchNumbers?: Record<string, string>
  ): Promise<SalesOrder> {
    // Get all order rows
    const rows = await this.listSalesOrderRows(orderId);

    // Create fulfill payload
    const fulfillData: FulfillOrderPayload = {
      line_items: rows.map((row) => ({
        sales_order_row_id: row.id,
        quantity_fulfilled: row.quantity_ordered - (row.quantity_fulfilled || 0),
        batch_number: batchNumbers?.[row.variant_id],
      })),
      tracking_number: trackingNumber,
      carrier: carrier,
      shipment_date: new Date().toISOString(),
    };

    return this.fulfillOrder(orderId, fulfillData);
  }

  async getSOWithDetails(soId: string): Promise<{
    so: SalesOrder;
    rows: SalesOrderRow[];
    fulfillments: SalesOrderFulfillment[];
  }> {
    const [so, rows, fulfillments] = await Promise.all([
      this.getSalesOrder(soId),
      this.listSalesOrderRows(soId),
      this.listFulfillments(soId),
    ]);

    return { so, rows, fulfillments };
  }

  async createFBAShipment(data: {
    orders: Array<{
      orderId: string;
      batchNumber: string;
      quantity: number;
    }>;
    palletId: string;
    trackingNumber?: string;
    carrier?: string;
  }): Promise<SalesOrderFulfillment[]> {
    // Create fulfillment for each order
    const fulfillments = await Promise.all(
      data.orders.map(async (order) => {
        const rows = await this.listSalesOrderRows(order.orderId);
        
        return this.createFulfillment({
          sales_order_id: order.orderId,
          shipment_type: 'fba',
          tracking_number: data.trackingNumber,
          carrier: data.carrier,
          line_items: rows.map((row) => ({
            sales_order_row_id: row.id,
            quantity_fulfilled: order.quantity,
            batch_number: order.batchNumber,
          })),
          notes: `FBA Pallet: ${data.palletId}`,
        });
      })
    );

    return fulfillments;
  }

  async getShipmentHistory(filters?: {
    start_date?: string;
    end_date?: string;
    customer_id?: string;
    carrier?: string;
    limit?: number;
  }): Promise<SalesOrderFulfillment[]> {
    const response = await this.client.get<SalesOrderFulfillment[]>(
      '/sales_order_fulfillments',
      filters
    );
    return response.data;
  }
}

// Singleton instance
let salesService: SalesService | null = null;

export function getSalesService(): SalesService {
  if (!salesService) {
    salesService = new SalesService();
  }
  return salesService;
}



