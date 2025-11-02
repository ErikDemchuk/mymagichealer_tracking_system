export type ProductColor = 'purple' | 'green' | 'blue' | 'essential-oil-free'

export type ProductSize = '4oz' | '2oz' | '1oz'

export type ProductionStage = 'cooked' | 'labeled' | 'packed' | 'shipped'

export type ContainerType = 'crate' | 'uline_box'

export interface ProductType {
  id: string
  name: string // "Universal Flare Care", "Thyme & Tea Tree", etc.
  color: ProductColor
  sizes: ProductSize[]
}

export interface Container {
  id: string // Crate ID or Box ID
  type: ContainerType
  productType: string
  size: ProductSize
  jarCount: number
  batch: string
  stage: ProductionStage
  location: string
  createdAt: Date
  updatedAt?: Date
}

export interface InventoryItem {
  id: string
  location: string
  product: string
  productName: string
  crateId: string | null
  itemType: string
  batch: string
  units: number
  size: string
}

// Product definitions based on mymagichealer.com
export const PRODUCT_TYPES: ProductType[] = [
  {
    id: 'universal-flare-care',
    name: 'Universal Flare Care',
    color: 'purple',
    sizes: ['4oz', '2oz', '1oz'],
  },
  {
    id: 'thyme-tea-tree',
    name: 'Thyme & Tea Tree Flare Care',
    color: 'green',
    sizes: ['4oz', '2oz', '1oz'],
  },
  {
    id: 'comfrey-arnica',
    name: 'Comfrey & Arnica Relief',
    color: 'blue',
    sizes: ['4oz', '2oz', '1oz'],
  },
  {
    id: 'universal-essential-oil-free',
    name: 'Universal Flare Care Essential Oil Free',
    color: 'essential-oil-free',
    sizes: ['4oz', '2oz', '1oz'],
  },
]

// U-line box capacities
export const ULINE_BOX_CAPACITIES: Record<ProductSize, number> = {
  '4oz': 72,
  '2oz': 114,
  '1oz': 150,
}

// Maximum jar count per crate
export const MAX_JARS_PER_CRATE = 222

// Stage display names
export const STAGE_NAMES: Record<ProductionStage, string> = {
  cooked: 'Cooked',
  labeled: 'Labeled',
  packed: 'Packed',
  shipped: 'Shipped',
}

