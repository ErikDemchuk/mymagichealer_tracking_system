// MongoDB Schemas for Katana Integration

import mongoose from 'mongoose';

// ==================== Katana Event Schema ====================

const KatanaEventSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  eventType: {
    type: String,
    required: true,
    index: true,
  },
  resourceType: {
    type: String,
    required: true,
  },
  resourceId: {
    type: String,
    required: true,
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  processedAt: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'failed'],
    default: 'pending',
    index: true,
  },
  error: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update updatedAt on save
KatanaEventSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// ==================== Production Task Schema ====================

const ProductionTaskSchema = new mongoose.Schema({
  taskId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['cook', 'label', 'pack', 'ship', 'receive'],
    required: true,
  },
  status: {
    type: String,
    enum: ['created', 'in_progress', 'pending_sync', 'synced', 'closed', 'error'],
    default: 'created',
    index: true,
  },
  katanaMOId: {
    type: String,
    index: true,
  },
  batchNumber: {
    type: String,
    index: true,
  },
  assignedTo: {
    type: String,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  syncError: {
    type: String,
  },
  syncAttempts: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
});

// Update updatedAt on save
ProductionTaskSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// ==================== Inventory Cache Schema ====================

const InventoryCacheSchema = new mongoose.Schema({
  variantId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  variantName: {
    type: String,
    required: true,
  },
  variantCode: {
    type: String,
  },
  inStock: {
    type: Number,
    required: true,
    default: 0,
  },
  allocated: {
    type: Number,
    default: 0,
  },
  available: {
    type: Number,
    required: true,
    default: 0,
  },
  unit: {
    type: String,
    required: true,
  },
  needsReorder: {
    type: Boolean,
    default: false,
    index: true,
  },
  reorderPoint: {
    type: Number,
  },
  safetyStock: {
    type: Number,
  },
  lastSyncedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update updatedAt on save
InventoryCacheSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// ==================== Sync Log Schema ====================

const SyncLogSchema = new mongoose.Schema({
  syncType: {
    type: String,
    enum: ['full', 'partial', 'webhook'],
    required: true,
  },
  resourceType: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'partial'],
    required: true,
  },
  itemsSynced: {
    type: Number,
    default: 0,
  },
  errors: [{
    type: String,
  }],
  startedAt: {
    type: Date,
    required: true,
  },
  completedAt: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number, // milliseconds
    required: true,
  },
});

// ==================== Export Models ====================

export const KatanaEvent = mongoose.models.KatanaEvent || 
  mongoose.model('KatanaEvent', KatanaEventSchema);

export const ProductionTask = mongoose.models.ProductionTask || 
  mongoose.model('ProductionTask', ProductionTaskSchema);

export const InventoryCache = mongoose.models.InventoryCache || 
  mongoose.model('InventoryCache', InventoryCacheSchema);

export const SyncLog = mongoose.models.SyncLog || 
  mongoose.model('SyncLog', SyncLogSchema);

// ==================== Helper Functions ====================

export async function createKatanaEvent(data: {
  eventId: string;
  eventType: string;
  resourceType: string;
  resourceId: string;
  payload: any;
}) {
  const event = new KatanaEvent(data);
  await event.save();
  return event;
}

export async function updateKatanaEventStatus(
  eventId: string,
  status: 'pending' | 'processed' | 'failed',
  error?: string
) {
  return await KatanaEvent.findOneAndUpdate(
    { eventId },
    {
      status,
      processedAt: status !== 'pending' ? new Date() : undefined,
      error,
      updatedAt: new Date(),
    },
    { new: true }
  );
}

export async function createProductionTask(data: {
  taskId: string;
  type: 'cook' | 'label' | 'pack' | 'ship' | 'receive';
  katanaMOId?: string;
  batchNumber?: string;
  assignedTo?: string;
  data: any;
}) {
  const task = new ProductionTask(data);
  await task.save();
  return task;
}

export async function updateProductionTaskStatus(
  taskId: string,
  status: 'created' | 'in_progress' | 'pending_sync' | 'synced' | 'closed' | 'error',
  syncError?: string
) {
  return await ProductionTask.findOneAndUpdate(
    { taskId },
    {
      status,
      syncError,
      completedAt: status === 'closed' ? new Date() : undefined,
      updatedAt: new Date(),
      $inc: { syncAttempts: status === 'error' ? 1 : 0 },
    },
    { new: true }
  );
}

export async function updateInventoryCache(data: {
  variantId: string;
  variantName: string;
  variantCode?: string;
  inStock: number;
  allocated: number;
  available: number;
  unit: string;
  reorderPoint?: number;
  safetyStock?: number;
}) {
  const needsReorder = 
    data.reorderPoint !== undefined ? data.available <= data.reorderPoint : false;

  return await InventoryCache.findOneAndUpdate(
    { variantId: data.variantId },
    {
      ...data,
      needsReorder,
      lastSyncedAt: new Date(),
      updatedAt: new Date(),
    },
    { upsert: true, new: true }
  );
}

export async function getLowStockItems(limit: number = 50) {
  return await InventoryCache.find({ needsReorder: true })
    .sort({ available: 1 })
    .limit(limit);
}

export async function createSyncLog(data: {
  syncType: 'full' | 'partial' | 'webhook';
  resourceType: string;
  status: 'success' | 'failed' | 'partial';
  itemsSynced: number;
  errors?: string[];
  startedAt: Date;
  completedAt: Date;
}) {
  const duration = data.completedAt.getTime() - data.startedAt.getTime();
  
  const log = new SyncLog({
    ...data,
    duration,
  });
  
  await log.save();
  return log;
}

export async function getRecentSyncLogs(limit: number = 10) {
  return await SyncLog.find()
    .sort({ completedAt: -1 })
    .limit(limit);
}

export async function getPendingKatanaEvents() {
  return await KatanaEvent.find({ status: 'pending' })
    .sort({ createdAt: 1 });
}

export async function getActiveTasks() {
  return await ProductionTask.find({
    status: { $in: ['created', 'in_progress', 'pending_sync'] },
  }).sort({ createdAt: 1 });
}

export async function getTasksByBatchNumber(batchNumber: string) {
  return await ProductionTask.find({ batchNumber })
    .sort({ createdAt: 1 });
}

