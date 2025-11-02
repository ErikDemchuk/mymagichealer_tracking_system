import type { InventoryItem } from '@/types/production'

export interface CRUDResult {
  success: boolean
  message: string
  data?: any
}

/**
 * Create a new production batch
 */
export function createBatch(
  batchId: string,
  product: string,
  size: string,
  quantity: number,
  location: string,
  currentInventory: InventoryItem[]
): CRUDResult {
  const newId = (Math.max(...currentInventory.map(i => parseInt(i.id)), 0) + 1).toString()
  
  const newBatch: InventoryItem = {
    id: newId,
    location,
    product: product.toLowerCase(),
    productName: product,
    crateId: `C-${Math.floor(Math.random() * 100) + 50}`,
    itemType: 'Unlabeled',
    batch: batchId.toUpperCase(),
    units: quantity,
    size,
  }
  
  currentInventory.push(newBatch)
  
  return {
    success: true,
    message: `Successfully created batch ${batchId} with ${quantity} units of ${size} ${product} at location ${location}.`,
    data: newBatch,
  }
}

/**
 * Create a new crate
 */
export function createCrate(
  crateId: string,
  location: string,
  product: string,
  size: string,
  batch: string,
  quantity: number,
  currentInventory: InventoryItem[]
): CRUDResult {
  const newId = (Math.max(...currentInventory.map(i => parseInt(i.id)), 0) + 1).toString()
  
  const newCrate: InventoryItem = {
    id: newId,
    location,
    product: product.toLowerCase(),
    productName: product,
    crateId: crateId.toUpperCase(),
    itemType: 'Unlabeled',
    batch: batch.toUpperCase(),
    units: quantity,
    size,
  }
  
  currentInventory.push(newCrate)
  
  return {
    success: true,
    message: `Successfully created crate ${crateId} with ${quantity} units at location ${location}.`,
    data: newCrate,
  }
}

/**
 * Record a cooking session
 */
export function recordCookingSession(
  product: string,
  size: string,
  quantity: number,
  currentInventory: InventoryItem[]
): CRUDResult {
  const batchNumber = `UFC${Math.floor(Math.random() * 900) + 100}`
  const newId = (Math.max(...currentInventory.map(i => parseInt(i.id)), 0) + 1).toString()
  
  const cookingRecord: InventoryItem = {
    id: newId,
    location: 'Kitchen',
    product: product.toLowerCase(),
    productName: product,
    crateId: null,
    itemType: 'Unlabeled',
    batch: batchNumber,
    units: quantity,
    size,
  }
  
  currentInventory.push(cookingRecord)
  
  return {
    success: true,
    message: `Successfully recorded cooking session for ${quantity} units of ${size} ${product}. Batch number: ${batchNumber}.`,
    data: cookingRecord,
  }
}

/**
 * Update location of items
 */
export function updateLocation(
  crateId: string,
  newLocation: string,
  currentInventory: InventoryItem[]
): CRUDResult {
  const item = currentInventory.find(i => i.crateId?.toUpperCase() === crateId.toUpperCase())
  
  if (!item) {
    return {
      success: false,
      message: `Could not find crate ${crateId}. Please check the crate ID and try again.`,
    }
  }
  
  const oldLocation = item.location
  item.location = newLocation.toUpperCase()
  
  return {
    success: true,
    message: `Successfully moved crate ${crateId} from ${oldLocation} to ${newLocation}.`,
    data: item,
  }
}

/**
 * Change item status (labeled/unlabeled)
 */
export function changeStatus(
  crateId: string,
  newStatus: 'Labeled' | 'Unlabeled',
  currentInventory: InventoryItem[]
): CRUDResult {
  const item = currentInventory.find(i => i.crateId?.toUpperCase() === crateId.toUpperCase())
  
  if (!item) {
    return {
      success: false,
      message: `Could not find crate ${crateId}. Please check the crate ID and try again.`,
    }
  }
  
  const oldStatus = item.itemType
  item.itemType = newStatus
  
  return {
    success: true,
    message: `Successfully changed status of crate ${crateId} from ${oldStatus} to ${newStatus}.`,
    data: item,
  }
}

/**
 * Move crate to new location
 */
export function moveCrate(
  crateId: string,
  newLocation: string,
  currentInventory: InventoryItem[]
): CRUDResult {
  return updateLocation(crateId, newLocation, currentInventory)
}

/**
 * Remove a batch
 */
export function removeBatch(
  batchId: string,
  currentInventory: InventoryItem[]
): CRUDResult {
  const initialLength = currentInventory.length
  const itemsToRemove = currentInventory.filter(i => i.batch.toUpperCase() === batchId.toUpperCase())
  
  if (itemsToRemove.length === 0) {
    return {
      success: false,
      message: `Could not find batch ${batchId}. Please check the batch ID and try again.`,
    }
  }
  
  // Remove items with matching batch ID
  for (let i = currentInventory.length - 1; i >= 0; i--) {
    if (currentInventory[i].batch.toUpperCase() === batchId.toUpperCase()) {
      currentInventory.splice(i, 1)
    }
  }
  
  const removedCount = initialLength - currentInventory.length
  
  return {
    success: true,
    message: `Successfully removed batch ${batchId}. Deleted ${removedCount} item(s).`,
  }
}

/**
 * Delete a crate
 */
export function deleteCrate(
  crateId: string,
  currentInventory: InventoryItem[]
): CRUDResult {
  const itemIndex = currentInventory.findIndex(i => i.crateId?.toUpperCase() === crateId.toUpperCase())
  
  if (itemIndex === -1) {
    return {
      success: false,
      message: `Could not find crate ${crateId}. Please check the crate ID and try again.`,
    }
  }
  
  const removedItem = currentInventory.splice(itemIndex, 1)[0]
  
  return {
    success: true,
    message: `Successfully deleted crate ${crateId} containing ${removedItem.units} units of ${removedItem.productName}.`,
    data: removedItem,
  }
}

/**
 * Get all locations
 */
export function getAllLocations(currentInventory: InventoryItem[]): CRUDResult {
  const locations = Array.from(new Set(currentInventory.map(i => i.location))).sort()
  
  return {
    success: true,
    message: `Found ${locations.length} locations: ${locations.join(', ')}`,
    data: locations,
  }
}

/**
 * Get all batches
 */
export function getAllBatches(currentInventory: InventoryItem[]): CRUDResult {
  const batches = Array.from(new Set(currentInventory.map(i => i.batch))).sort()
  
  return {
    success: true,
    message: `Found ${batches.length} batches: ${batches.join(', ')}`,
    data: batches,
  }
}



