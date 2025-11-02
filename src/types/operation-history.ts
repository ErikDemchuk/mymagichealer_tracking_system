export type OperationStage = 'cooking' | 'storage' | 'labeling' | 'packing' | 'shipping'

export interface OperationEvent {
  id: string
  stage: OperationStage
  timestamp: Date
  operator: string // Person who performed action
  location?: string
  quantity: number
  notes?: string
}

export interface OperationHistory {
  batchId: string
  productName: string
  size: string
  color: string // Product color identifier
  events: OperationEvent[]
}

export const STAGE_ICONS: Record<OperationStage, string> = {
  cooking: '🍳',
  storage: '📦',
  labeling: '🏷️',
  packing: '📦',
  shipping: '🚚',
}

export const STAGE_LABELS: Record<OperationStage, string> = {
  cooking: 'Cooking',
  storage: 'Storage',
  labeling: 'Labeling',
  packing: 'Packing',
  shipping: 'Shipping',
}

