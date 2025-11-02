// Transfer Service - Handle stock transfers between locations/crates

import { getKatanaClient } from '../client';
import type {
  StockTransfer,
  KatanaAPIResponse,
} from '../types';

export class TransferService {
  private client = getKatanaClient();

  // ==================== Stock Transfers ====================

  async createStockTransfer(data: {
    variant_id: string;
    from_location_id: string;
    to_location_id: string;
    quantity: number;
    batch_number?: string;
    transfer_date?: string;
    notes?: string;
  }): Promise<StockTransfer> {
    const response = await this.client.post<StockTransfer>('/stock_transfers', {
      ...data,
      status: 'pending',
      transfer_date: data.transfer_date || new Date().toISOString(),
    });
    return response.data;
  }

  async listStockTransfers(filters?: {
    variant_id?: string;
    from_location_id?: string;
    to_location_id?: string;
    batch_number?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
  }): Promise<{ transfers: StockTransfer[]; total: number }> {
    const response = await this.client.get<StockTransfer[]>('/stock_transfers', filters);
    return {
      transfers: response.data,
      total: response.meta?.total || response.data.length,
    };
  }

  async getStockTransfer(id: string): Promise<StockTransfer> {
    const response = await this.client.get<StockTransfer>(`/stock_transfers/${id}`);
    return response.data;
  }

  async updateStockTransfer(
    id: string,
    data: Partial<StockTransfer>
  ): Promise<StockTransfer> {
    const response = await this.client.patch<StockTransfer>(`/stock_transfers/${id}`, data);
    return response.data;
  }

  async updateTransferStatus(
    id: string,
    status: 'pending' | 'in_transit' | 'completed' | 'cancelled'
  ): Promise<StockTransfer> {
    const response = await this.client.patch<StockTransfer>(`/stock_transfers/${id}/status`, {
      status,
      ...(status === 'completed' && { completed_at: new Date().toISOString() }),
    });
    return response.data;
  }

  async deleteStockTransfer(id: string): Promise<void> {
    await this.client.delete(`/stock_transfers/${id}`);
  }

  // ==================== Helper Methods ====================

  async createCrateTransfer(data: {
    variantId: string;
    sourceCrateId: string;
    destinationCrateId: string;
    quantity: number;
    batchNumber?: string;
    stage?: 'cooking' | 'labeling' | 'packing';
    notes?: string;
  }): Promise<StockTransfer> {
    return this.createStockTransfer({
      variant_id: data.variantId,
      from_location_id: data.sourceCrateId,
      to_location_id: data.destinationCrateId,
      quantity: data.quantity,
      batch_number: data.batchNumber,
      notes: data.stage 
        ? `${data.stage} stage: ${data.notes || ''}`
        : data.notes,
    });
  }

  async completeTransfer(
    transferId: string,
    notes?: string
  ): Promise<StockTransfer> {
    return this.updateStockTransfer(transferId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      notes,
    });
  }

  async cancelTransfer(
    transferId: string,
    reason?: string
  ): Promise<StockTransfer> {
    return this.updateStockTransfer(transferId, {
      status: 'cancelled',
      notes: reason ? `Cancelled: ${reason}` : 'Cancelled',
    });
  }

  async getTransferHistory(batchNumber: string): Promise<StockTransfer[]> {
    const response = await this.client.get<StockTransfer[]>('/stock_transfers', {
      batch_number: batchNumber,
    });
    return response.data;
  }

  async getTransfersByLocation(locationId: string, direction: 'from' | 'to' | 'both' = 'both'): Promise<StockTransfer[]> {
    let filters: any = {};
    
    if (direction === 'from') {
      filters.from_location_id = locationId;
    } else if (direction === 'to') {
      filters.to_location_id = locationId;
    } else {
      // For 'both', we need to make two requests and merge
      const [fromTransfers, toTransfers] = await Promise.all([
        this.listStockTransfers({ from_location_id: locationId }),
        this.listStockTransfers({ to_location_id: locationId }),
      ]);
      
      // Merge and deduplicate
      const allTransfers = [...fromTransfers.transfers, ...toTransfers.transfers];
      const uniqueTransfers = Array.from(
        new Map(allTransfers.map(t => [t.id, t])).values()
      );
      
      return uniqueTransfers;
    }

    const response = await this.listStockTransfers(filters);
    return response.transfers;
  }

  async trackBatchMovement(batchNumber: string): Promise<{
    batchNumber: string;
    transfers: StockTransfer[];
    currentLocation?: string;
    movementHistory: Array<{
      from: string;
      to: string;
      quantity: number;
      date: string;
      status: string;
    }>;
  }> {
    const transfers = await this.getTransferHistory(batchNumber);

    // Sort by date
    const sorted = transfers.sort(
      (a, b) =>
        new Date(a.transfer_date || a.created_at).getTime() -
        new Date(b.transfer_date || b.created_at).getTime()
    );

    // Find current location (last completed transfer's destination)
    const lastCompleted = sorted
      .filter(t => t.status === 'completed')
      .pop();

    const movementHistory = sorted.map(t => ({
      from: t.from_location_id,
      to: t.to_location_id,
      quantity: t.quantity,
      date: t.transfer_date || t.created_at,
      status: t.status,
    }));

    return {
      batchNumber,
      transfers: sorted,
      currentLocation: lastCompleted?.to_location_id,
      movementHistory,
    };
  }

  async getPendingTransfers(): Promise<StockTransfer[]> {
    const response = await this.listStockTransfers({ status: 'pending,in_transit' });
    return response.transfers;
  }
}

// Singleton instance
let transferService: TransferService | null = null;

export function getTransferService(): TransferService {
  if (!transferService) {
    transferService = new TransferService();
  }
  return transferService;
}

