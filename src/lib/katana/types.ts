// Katana API TypeScript Type Definitions

// ==================== Common Types ====================

export interface KatanaAPIResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    has_more?: boolean;
  };
}

export interface KatanaError {
  message: string;
  code?: string;
  status?: number;
}

// ==================== Manufacturing Orders ====================

export interface ManufacturingOrder {
  id: string;
  product_variant_id: string;
  product_name?: string;
  batch_number?: string;
  quantity: number;
  actual_quantity?: number;
  status: 'pending' | 'in_progress' | 'done' | 'cancelled';
  scheduled_start_date?: string;
  actual_start_date?: string;
  deadline?: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ManufacturingOrderOperation {
  id: string;
  manufacturing_order_id: string;
  name: string;
  resource_type?: string;
  resource_id?: string;
  sequence: number;
  duration_minutes?: number;
  actual_duration_minutes?: number;
  status: 'pending' | 'in_progress' | 'done';
  started_at?: string;
  completed_at?: string;
  notes?: string;
}

export interface ManufacturingOrderProduction {
  id: string;
  manufacturing_order_id: string;
  quantity_produced: number;
  production_date: string;
  batch_number?: string;
  notes?: string;
  created_at: string;
}

export interface ManufacturingOrderRecipe {
  id: string;
  manufacturing_order_id: string;
  material_variant_id: string;
  material_name?: string;
  quantity_required: number;
  quantity_consumed?: number;
  unit: string;
  batch_number?: string;
}

// ==================== Inventory ====================

export interface Inventory {
  variant_id: string;
  variant_name: string;
  variant_code?: string;
  in_stock: number;
  allocated: number;
  available: number;
  unit: string;
  location_id?: string;
  batch_number?: string;
  expiration_date?: string;
  reorder_point?: number;
  safety_stock?: number;
  updated_at: string;
}

export interface StockAdjustment {
  id: string;
  variant_id: string;
  location_id?: string;
  batch_number?: string;
  adjustment_type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason?: string;
  notes?: string;
  reference_id?: string;
  created_at: string;
  created_by?: string;
}

export interface Batch {
  id: string;
  batch_number: string;
  variant_id: string;
  quantity: number;
  manufactured_date?: string;
  expiration_date?: string;
  status: 'active' | 'expired' | 'recalled';
  notes?: string;
  created_at: string;
}

// ==================== Stock Transfers ====================

export interface StockTransfer {
  id: string;
  variant_id: string;
  from_location_id: string;
  to_location_id: string;
  quantity: number;
  batch_number?: string;
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  transfer_date?: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
}

// ==================== Purchase Orders ====================

export interface PurchaseOrder {
  id: string;
  po_number?: string;
  supplier_id: string;
  supplier_name?: string;
  status: 'draft' | 'sent' | 'confirmed' | 'partially_received' | 'received' | 'cancelled';
  order_date: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  total_cost?: number;
  currency?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderRow {
  id: string;
  purchase_order_id: string;
  variant_id: string;
  variant_name?: string;
  quantity_ordered: number;
  quantity_received?: number;
  unit_cost?: number;
  total_cost?: number;
  batch_number?: string;
  notes?: string;
}

export interface ReceivePOPayload {
  line_items: Array<{
    purchase_order_row_id: string;
    quantity_received: number;
    batch_number?: string;
    expiration_date?: string;
  }>;
  received_date: string;
  notes?: string;
}

// ==================== Sales Orders ====================

export interface SalesOrder {
  id: string;
  order_number?: string;
  customer_id: string;
  customer_name?: string;
  status: 'draft' | 'pending' | 'in_progress' | 'partially_fulfilled' | 'fulfilled' | 'cancelled';
  order_date: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  total_price?: number;
  currency?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SalesOrderRow {
  id: string;
  sales_order_id: string;
  variant_id: string;
  variant_name?: string;
  quantity_ordered: number;
  quantity_fulfilled?: number;
  unit_price?: number;
  total_price?: number;
  batch_number?: string;
  notes?: string;
}

export interface SalesOrderFulfillment {
  id: string;
  sales_order_id: string;
  fulfillment_date: string;
  tracking_number?: string;
  carrier?: string;
  shipment_type?: 'standard' | 'express' | 'fba';
  notes?: string;
  created_at: string;
}

export interface FulfillOrderPayload {
  line_items: Array<{
    sales_order_row_id: string;
    quantity_fulfilled: number;
    batch_number?: string;
  }>;
  tracking_number?: string;
  carrier?: string;
  shipment_date: string;
  notes?: string;
}

// ==================== Products & Variants ====================

export interface Product {
  id: string;
  name: string;
  code?: string;
  description?: string;
  category?: string;
  type: 'standard' | 'make_to_order' | 'bundle';
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Variant {
  id: string;
  product_id: string;
  name: string;
  code?: string;
  sku?: string;
  size?: string;
  color?: string;
  in_stock: number;
  allocated: number;
  available: number;
  cost?: number;
  price?: number;
  unit: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Material {
  id: string;
  name: string;
  code?: string;
  category?: string;
  unit: string;
  cost_per_unit?: number;
  supplier_id?: string;
  reorder_point?: number;
  lead_time_days?: number;
  status: 'active' | 'inactive';
  created_at: string;
}

// ==================== Locations & Storage ====================

export interface Location {
  id: string;
  name: string;
  code?: string;
  type: 'warehouse' | 'store' | 'production' | 'other';
  address?: string;
  is_default?: boolean;
  status: 'active' | 'inactive';
}

export interface StorageBin {
  id: string;
  name: string;
  location_id: string;
  zone?: string;
  aisle?: string;
  rack?: string;
  shelf?: string;
  capacity?: number;
  status: 'active' | 'inactive';
}

// ==================== Webhooks ====================

export interface Webhook {
  id: string;
  url: string;
  description?: string;
  events: string[];
  status: 'active' | 'inactive';
  secret?: string;
  created_at: string;
}

export interface WebhookEvent {
  id: string;
  event_type: string;
  resource_type: string;
  resource_id: string;
  timestamp: string;
  payload: Record<string, any>;
}

// Manufacturing Order Events
export interface MOCreatedEvent extends WebhookEvent {
  event_type: 'manufacturing_order.created';
  payload: ManufacturingOrder;
}

export interface MOUpdatedEvent extends WebhookEvent {
  event_type: 'manufacturing_order.updated';
  payload: ManufacturingOrder;
}

export interface MOCompletedEvent extends WebhookEvent {
  event_type: 'manufacturing_order.completed';
  payload: ManufacturingOrder;
}

// Inventory Events
export interface InventoryUpdatedEvent extends WebhookEvent {
  event_type: 'inventory.updated';
  payload: {
    variant_id: string;
    old_quantity: number;
    new_quantity: number;
    change_type: string;
  };
}

export interface LowStockEvent extends WebhookEvent {
  event_type: 'inventory.low_stock';
  payload: {
    variant_id: string;
    variant_name: string;
    current_stock: number;
    reorder_point: number;
  };
}

// Purchase Order Events
export interface POReceivedEvent extends WebhookEvent {
  event_type: 'purchase_order.received';
  payload: PurchaseOrder;
}

// Sales Order Events
export interface SOCreatedEvent extends WebhookEvent {
  event_type: 'sales_order.created';
  payload: SalesOrder;
}

export interface SOFulfilledEvent extends WebhookEvent {
  event_type: 'sales_order.fulfilled';
  payload: SalesOrder;
}

// Union type for all webhook events
export type AllWebhookEvents =
  | MOCreatedEvent
  | MOUpdatedEvent
  | MOCompletedEvent
  | InventoryUpdatedEvent
  | LowStockEvent
  | POReceivedEvent
  | SOCreatedEvent
  | SOFulfilledEvent;

// ==================== Command Payloads ====================

export interface CookCommandData {
  manufacturingOrderId: string;
  batchNumber: string;
  actualQuantity: number;
  crateId: string;
  location: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

export interface LabelCommandData {
  manufacturingOrderId: string;
  batchNumber: string;
  sourceCrateId: string;
  sourceLocation: string;
  destinationCrateId: string;
  destinationLocation: string;
  quantityLabeled: number;
  startTime: string;
  endTime: string;
  notes?: string;
}

export interface PackCommandData {
  manufacturingOrderId: string;
  batchNumber: string;
  sourceCrateId: string;
  productSize: '1oz' | '2oz' | '4oz';
  retailBoxesPacked: number;
  ulineBoxesUsed: number;
  guidelinesUsed: number;
  destination: 'fba' | 'shopify';
  packedBy: string;
  notes?: string;
}

export interface ShipCommandData {
  shipmentType: 'fba' | 'shopify';
  orders: Array<{
    orderId: string;
    batchNumber: string;
    quantity: number;
  }>;
  trackingNumbers: string[];
  carrier: string;
  shipDate: string;
  palletId?: string; // For FBA
  notes?: string;
}

export interface ReceiveCommandData {
  purchaseOrderId: string;
  items: Array<{
    variantId: string;
    quantityReceived: number;
    batchNumber?: string;
    expirationDate?: string;
  }>;
  receivedDate: string;
  photoUrl?: string;
  notes?: string;
}

// ==================== AI Integration Types ====================

export interface PurchaseRecommendation {
  variantId: string;
  variantName: string;
  currentStock: number;
  dailyUsage: number;
  daysRemaining: number;
  recommendedQuantity: number;
  estimatedCost: number;
  supplierId?: string;
  supplierName?: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
}

export interface ExtractedPackingSlipData {
  vendor: string;
  poReference?: string;
  date: string;
  items: Array<{
    productName: string;
    sku?: string;
    quantity: number;
    unit?: string;
    batchNumber?: string;
  }>;
  totalItems: number;
  confidence: number; // 0-1 confidence score from AI
}

// ==================== MongoDB Document Types ====================

export interface KatanaEventDocument {
  _id?: string;
  eventId: string;
  eventType: string;
  resourceType: string;
  resourceId: string;
  payload: Record<string, any>;
  processedAt?: Date;
  status: 'pending' | 'processed' | 'failed';
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductionTaskDocument {
  _id?: string;
  taskId: string;
  type: 'cook' | 'label' | 'pack' | 'ship' | 'receive';
  status: 'created' | 'in_progress' | 'pending_sync' | 'synced' | 'closed' | 'error';
  katanaMOId?: string;
  batchNumber?: string;
  assignedTo?: string;
  data: Record<string, any>;
  syncError?: string;
  syncAttempts: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface InventoryCacheDocument {
  _id?: string;
  variantId: string;
  variantName: string;
  variantCode?: string;
  inStock: number;
  allocated: number;
  available: number;
  unit: string;
  needsReorder: boolean;
  reorderPoint?: number;
  lastSyncedAt: Date;
  updatedAt: Date;
}

export interface SyncLogDocument {
  _id?: string;
  syncType: 'full' | 'partial' | 'webhook';
  resourceType: string;
  status: 'success' | 'failed' | 'partial';
  itemsSynced: number;
  errors?: string[];
  startedAt: Date;
  completedAt: Date;
  duration: number; // milliseconds
}

