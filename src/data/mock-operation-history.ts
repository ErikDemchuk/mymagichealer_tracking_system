import type { OperationHistory } from '@/types/operation-history'

// Helper to create dates relative to now
const daysAgo = (days: number, hours: number = 0) => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(date.getHours() - hours)
  return date
}

export const mockOperationHistories: Record<string, OperationHistory> = {
  'UFC324': {
    batchId: 'UFC324',
    productName: 'Universal Flare Care',
    size: '4oz',
    color: 'purple',
    events: [
      {
        id: 'ufc324-1',
        stage: 'cooking',
        timestamp: daysAgo(5, 2),
        operator: 'Maria Rodriguez',
        location: 'Kitchen A',
        quantity: 200,
        notes: 'Started the day with batch UFC324. Followed our standard recipe for Universal Flare Care. Temperature stayed nice and steady at 180°F throughout the process. Everything looked great!',
      },
      {
        id: 'ufc324-2',
        stage: 'storage',
        timestamp: daysAgo(5, 0),
        operator: 'James Chen',
        location: 'B-1',
        quantity: 200,
        notes: 'Got all 200 jars moved into crate C-32. They\'re cooling down nicely in the storage area. Should be ready for labeling in a couple days.',
      },
      {
        id: 'ufc324-3',
        stage: 'labeling',
        timestamp: daysAgo(3, 4),
        operator: 'Sarah Johnson',
        location: 'B-1',
        quantity: 200,
        notes: 'Finished labeling all the jars today. Made sure batch info and expiration dates are clear on every single one. Looking good and ready for the next step!',
      },
      {
        id: 'ufc324-4',
        stage: 'packing',
        timestamp: daysAgo(2, 2),
        operator: 'David Kim',
        location: 'B-1',
        quantity: 200,
        notes: 'Packed everything into 3 Uline boxes - 72 units in each. They\'re all sealed up and ready to ship out. Quality check passed with flying colors.',
      },
      {
        id: 'ufc324-5',
        stage: 'shipping',
        timestamp: daysAgo(1, 6),
        operator: 'Emily Watson',
        location: 'Shipping Dock',
        quantity: 200,
        notes: 'All boxes shipped to Amazon FBA this morning. Tracking number is 1Z999AA10123456784. Should arrive at the warehouse in 2-3 days. Another batch done!',
      },
    ],
  },
  'UFC325': {
    batchId: 'UFC325',
    productName: 'Universal Flare Care',
    size: '4oz',
    color: 'purple',
    events: [
      {
        id: 'ufc325-1',
        stage: 'cooking',
        timestamp: daysAgo(4, 3),
        operator: 'Maria Rodriguez',
        location: 'Kitchen A',
        quantity: 231,
        notes: 'Made a bigger batch today since Amazon inventory is running low. Everything went smoothly, just took a bit longer to cook. Quality looks perfect.',
      },
      {
        id: 'ufc325-2',
        stage: 'storage',
        timestamp: daysAgo(4, 1),
        operator: 'James Chen',
        location: 'B-1',
        quantity: 231,
        notes: 'Split this batch between two locations. Put 150 units in crate C-35 here at B-1, and moving the rest to A-2.',
      },
      {
        id: 'ufc325-3',
        stage: 'storage',
        timestamp: daysAgo(3, 23),
        operator: 'James Chen',
        location: 'A-2',
        quantity: 81,
        notes: 'Moved the remaining 81 units (2oz size) to location A-2 in crate C-44. Had to split them up since we didn\'t have enough space in one crate. All organized now.',
      },
      {
        id: 'ufc325-4',
        stage: 'labeling',
        timestamp: daysAgo(2, 5),
        operator: 'Sarah Johnson',
        location: 'B-1 & A-2',
        quantity: 231,
        notes: 'Labeled all units across both storage locations today. Had to move between B-1 and A-2, but got everything done. Ready for packing tomorrow.',
      },
      {
        id: 'ufc325-5',
        stage: 'packing',
        timestamp: daysAgo(1, 8),
        operator: 'David Kim',
        location: 'B-4',
        quantity: 231,
        notes: 'Brought everything together at B-4 and packed into 4 Uline boxes. Nice to have them all in one place now. Ready to ship!',
      },
    ],
  },
  'UFC326': {
    batchId: 'UFC326',
    productName: 'Thyme & Tea Tree Flare Care',
    size: '2oz',
    color: 'green',
    events: [
      {
        id: 'ufc326-1',
        stage: 'cooking',
        timestamp: daysAgo(3, 2),
        operator: 'Maria Rodriguez',
        location: 'Kitchen B',
        quantity: 180,
        notes: 'Cooked up the green formula today. Added a bit more tea tree oil based on the recipe update. Smells amazing! Everything turned out great.',
      },
      {
        id: 'ufc326-2',
        stage: 'storage',
        timestamp: daysAgo(3, 0),
        operator: 'James Chen',
        location: 'B-1',
        quantity: 180,
        notes: 'All 180 jars are now in crate C-40 cooling down. Did a quick quality check and everything looks perfect. Ready for labeling once they cool.',
      },
      {
        id: 'ufc326-3',
        stage: 'labeling',
        timestamp: daysAgo(1, 6),
        operator: 'Sarah Johnson',
        location: 'B-1',
        quantity: 180,
        notes: 'Still working on labeling this batch. Got about 60% done so far. Should finish up tomorrow morning. Taking our time to make sure everything is perfect.',
      },
    ],
  },
  'UFC327': {
    batchId: 'UFC327',
    productName: 'Comfrey & Arnica Relief',
    size: '4oz',
    color: 'blue',
    events: [
      {
        id: 'ufc327-1',
        stage: 'cooking',
        timestamp: daysAgo(2, 3),
        operator: 'Thomas Lee',
        location: 'Kitchen A',
        quantity: 200,
        notes: 'First batch with the new blue formula recipe! We increased the arnica concentration a bit. It came out really well - can\'t wait to get feedback on this one.',
      },
      {
        id: 'ufc327-2',
        stage: 'storage',
        timestamp: daysAgo(2, 1),
        operator: 'James Chen',
        location: 'A-2',
        quantity: 200,
        notes: 'Moved everything to crate C-48 at location A-2. Just waiting for a labeling station to free up. Should be able to start labeling early next week.',
      },
    ],
  },
}

// Helper function to get operation history by batch ID
export function getOperationHistory(batchId: string): OperationHistory | null {
  return mockOperationHistories[batchId.toUpperCase()] || null
}

// Helper function to get all batch IDs
export function getAllBatchIds(): string[] {
  return Object.keys(mockOperationHistories)
}

// Helper function to calculate duration between stages
export function getStageDuration(
  events: OperationHistory['events'],
  fromStage: string,
  toStage: string
): string {
  const fromEvent = events.find(e => e.stage === fromStage)
  const toEvent = events.find(e => e.stage === toStage)
  
  if (!fromEvent || !toEvent) return 'N/A'
  
  const diffMs = toEvent.timestamp.getTime() - fromEvent.timestamp.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)
  const remainingHours = diffHours % 24
  
  if (diffDays > 0) {
    return `${diffDays}d ${remainingHours}h`
  }
  return `${diffHours}h`
}

