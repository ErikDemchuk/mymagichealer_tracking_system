// Purchase Service - Handle purchase orders and receiving

import { getKatanaClient } from '../client';
import type {
  PurchaseOrder,
  PurchaseOrderRow,
  ReceivePOPayload,
  KatanaAPIResponse,
  ExtractedPackingSlipData,
} from '../types';

export class PurchaseService {
  private client = getKatanaClient();

  // ==================== Purchase Orders ====================

  async createPurchaseOrder(data: {
    supplier_id: string;
    order_date?: string;
    expected_delivery_date?: string;
    notes?: string;
    line_items: Array<{
      variant_id: string;
      quantity: number;
      unit_cost?: number;
    }>;
  }): Promise<PurchaseOrder> {
    // Create PO
    const poResponse = await this.client.post<PurchaseOrder>('/purchase_orders', {
      supplier_id: data.supplier_id,
      order_date: data.order_date || new Date().toISOString(),
      expected_delivery_date: data.expected_delivery_date,
      notes: data.notes,
    });

    const po = poResponse.data;

    // Add line items
    await Promise.all(
      data.line_items.map((item) =>
        this.client.post('/purchase_order_rows', {
          purchase_order_id: po.id,
          variant_id: item.variant_id,
          quantity_ordered: item.quantity,
          unit_cost: item.unit_cost,
        })
      )
    );

    return po;
  }

  async listPurchaseOrders(filters?: {
    status?: string;
    supplier_id?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
  }): Promise<{ orders: PurchaseOrder[]; total: number }> {
    const response = await this.client.get<PurchaseOrder[]>('/purchase_orders', filters);
    return {
      orders: response.data,
      total: response.meta?.total || response.data.length,
    };
  }

  async getPurchaseOrder(id: string): Promise<PurchaseOrder> {
    const response = await this.client.get<PurchaseOrder>(`/purchase_orders/${id}`);
    return response.data;
  }

  async getOpenPurchaseOrders(): Promise<PurchaseOrder[]> {
    const response = await this.client.get<PurchaseOrder[]>('/purchase_orders', {
      status: 'sent,confirmed',
    });
    return response.data;
  }

  async updatePurchaseOrder(
    id: string,
    data: Partial<PurchaseOrder>
  ): Promise<PurchaseOrder> {
    const response = await this.client.patch<PurchaseOrder>(`/purchase_orders/${id}`, data);
    return response.data;
  }

  async deletePurchaseOrder(id: string): Promise<void> {
    await this.client.delete(`/purchase_orders/${id}`);
  }

  // ==================== Purchase Order Rows ====================

  async listPurchaseOrderRows(purchaseOrderId: string): Promise<PurchaseOrderRow[]> {
    const response = await this.client.get<PurchaseOrderRow[]>('/purchase_order_rows', {
      purchase_order_id: purchaseOrderId,
    });
    return response.data;
  }

  async createPurchaseOrderRow(data: {
    purchase_order_id: string;
    variant_id: string;
    quantity_ordered: number;
    unit_cost?: number;
    notes?: string;
  }): Promise<PurchaseOrderRow> {
    const response = await this.client.post<PurchaseOrderRow>('/purchase_order_rows', data);
    return response.data;
  }

  async updatePurchaseOrderRow(
    id: string,
    data: Partial<PurchaseOrderRow>
  ): Promise<PurchaseOrderRow> {
    const response = await this.client.patch<PurchaseOrderRow>(`/purchase_order_rows/${id}`, data);
    return response.data;
  }

  async deletePurchaseOrderRow(id: string): Promise<void> {
    await this.client.delete(`/purchase_order_rows/${id}`);
  }

  // ==================== Receiving ====================

  async receivePurchaseOrder(
    poId: string,
    receiveData: ReceivePOPayload
  ): Promise<PurchaseOrder> {
    const response = await this.client.post<PurchaseOrder>(
      `/purchase_orders/${poId}/receive`,
      receiveData
    );
    return response.data;
  }

  async receiveFullPO(
    poId: string,
    batchNumbers?: Record<string, string>
  ): Promise<PurchaseOrder> {
    // Get all PO rows
    const rows = await this.listPurchaseOrderRows(poId);

    // Create receive payload
    const receiveData: ReceivePOPayload = {
      line_items: rows.map((row) => ({
        purchase_order_row_id: row.id,
        quantity_received: row.quantity_ordered - (row.quantity_received || 0),
        batch_number: batchNumbers?.[row.variant_id],
      })),
      received_date: new Date().toISOString(),
    };

    return this.receivePurchaseOrder(poId, receiveData);
  }

  // ==================== Helper Methods ====================

  async getPOWithDetails(poId: string): Promise<{
    po: PurchaseOrder;
    rows: PurchaseOrderRow[];
  }> {
    const [po, rows] = await Promise.all([
      this.getPurchaseOrder(poId),
      this.listPurchaseOrderRows(poId),
    ]);

    return { po, rows };
  }

  async matchPOFromPhoto(
    extractedData: ExtractedPackingSlipData
  ): Promise<{
    matchedPO: PurchaseOrder | null;
    confidence: number;
    suggestions: PurchaseOrder[];
  }> {
    // Get open purchase orders
    const openPOs = await this.getOpenPurchaseOrders();

    if (openPOs.length === 0) {
      return {
        matchedPO: null,
        confidence: 0,
        suggestions: [],
      };
    }

    // Try to match by PO reference
    if (extractedData.poReference) {
      const exactMatch = openPOs.find((po) =>
        po.po_number?.includes(extractedData.poReference!)
      );
      if (exactMatch) {
        return {
          matchedPO: exactMatch,
          confidence: 0.95,
          suggestions: [exactMatch],
        };
      }
    }

    // Try to match by vendor and date
    const vendorMatches = openPOs.filter(
      (po) =>
        po.supplier_name?.toLowerCase() === extractedData.vendor.toLowerCase()
    );

    if (vendorMatches.length === 1) {
      return {
        matchedPO: vendorMatches[0],
        confidence: 0.8,
        suggestions: vendorMatches,
      };
    }

    if (vendorMatches.length > 1) {
      // Return most recent
      const sorted = vendorMatches.sort(
        (a, b) =>
          new Date(b.order_date).getTime() - new Date(a.order_date).getTime()
      );
      return {
        matchedPO: sorted[0],
        confidence: 0.6,
        suggestions: sorted,
      };
    }

    // No good match found
    return {
      matchedPO: null,
      confidence: 0,
      suggestions: openPOs.slice(0, 5),
    };
  }

  async getReceivingHistory(filters?: {
    start_date?: string;
    end_date?: string;
    supplier_id?: string;
    limit?: number;
  }): Promise<PurchaseOrder[]> {
    const response = await this.client.get<PurchaseOrder[]>('/purchase_orders', {
      ...filters,
      status: 'received,partially_received',
    });
    return response.data;
  }
}

// Singleton instance
let purchaseService: PurchaseService | null = null;

export function getPurchaseService(): PurchaseService {
  if (!purchaseService) {
    purchaseService = new PurchaseService();
  }
  return purchaseService;
}

