"use client"

import { MapPin, Package, Archive, Box } from 'lucide-react'
import type { TreeNode } from './TreeView'
import type { ProductionTreeTableNode } from './ProductionTreeTable'
import type { Container, InventoryItem, ProductSize } from '@/types/production'

/**
 * Transform inventory data into TreeNode structure for table view
 * Hierarchy: Location → Product Type/Size → Containers
 */
export function transformInventoryToTreeTable(inventory: InventoryItem[]): ProductionTreeTableNode[] {
  // Group by location
  const locationMap = new Map<string, InventoryItem[]>()
  
  inventory.forEach((item) => {
    if (!locationMap.has(item.location)) {
      locationMap.set(item.location, [])
    }
    locationMap.get(item.location)!.push(item)
  })
  
  // Build tree nodes
  const treeNodes: ProductionTreeTableNode[] = []
  
  locationMap.forEach((items, location) => {
    const locationNode: ProductionTreeTableNode = {
      id: `location-${location}`,
      label: `Location ${location}`,
      type: 'location',
      icon: <MapPin className="w-4 h-4 text-blue-600" />,
      children: [],
      data: { type: 'location', location },
    }
    
    // Group by product + size
    const productMap = new Map<string, InventoryItem[]>()
    
    items.forEach((item) => {
      const productKey = `${item.product}-${item.size}`
      if (!productMap.has(productKey)) {
        productMap.set(productKey, [])
      }
      productMap.get(productKey)!.push(item)
    })
    
    // Create product nodes
    productMap.forEach((productItems, productKey) => {
      const firstItem = productItems[0]
      const colorClass = getProductColorClass(firstItem.product)
      
      const productNode: ProductionTreeTableNode = {
        id: `product-${location}-${productKey}`,
        label: `${firstItem.size} ${firstItem.productName}`,
        type: 'product',
        icon: <Package className={`w-4 h-4 ${colorClass}`} />,
        children: [],
        data: {
          type: 'product',
          product: firstItem.product,
          productName: firstItem.productName,
          size: firstItem.size,
          location,
        },
      }
      
      // Create container nodes
      productItems.forEach((item) => {
        const containerIcon = item.crateId ? (
          <Archive className="w-4 h-4 text-gray-600" />
        ) : (
          <Box className="w-4 h-4 text-amber-600" />
        )
        
        const containerType = item.crateId ? 'Crate' : 'Box'
        const containerId = item.crateId || item.id
        
        const containerNode: ProductionTreeTableNode = {
          id: `container-${item.id}`,
          label: `${containerType} ${containerId}`,
          type: 'container',
          icon: containerIcon,
          data: {
            type: 'container',
            ...item,
            containerType: item.crateId ? 'crate' : 'uline_box',
          },
        }
        
        productNode.children!.push(containerNode)
      })
      
      locationNode.children!.push(productNode)
    })
    
    treeNodes.push(locationNode)
  })
  
  return treeNodes
}

/**
 * Transform inventory data into TreeNode structure
 * Hierarchy: Location → Product Type/Size → Containers
 */
export function transformInventoryToTree(inventory: InventoryItem[]): TreeNode[] {
  // Group by location
  const locationMap = new Map<string, InventoryItem[]>()
  
  inventory.forEach((item) => {
    if (!locationMap.has(item.location)) {
      locationMap.set(item.location, [])
    }
    locationMap.get(item.location)!.push(item)
  })
  
  // Build tree nodes
  const treeNodes: TreeNode[] = []
  
  locationMap.forEach((items, location) => {
    const locationNode: TreeNode = {
      id: `location-${location}`,
      label: `Location ${location}`,
      icon: <MapPin className="w-4 h-4 text-blue-600" />,
      children: [],
      data: { type: 'location', location },
    }
    
    // Group by product + size
    const productMap = new Map<string, InventoryItem[]>()
    
    items.forEach((item) => {
      const productKey = `${item.product}-${item.size}`
      if (!productMap.has(productKey)) {
        productMap.set(productKey, [])
      }
      productMap.get(productKey)!.push(item)
    })
    
    // Create product nodes
    productMap.forEach((productItems, productKey) => {
      const firstItem = productItems[0]
      const colorClass = getProductColorClass(firstItem.product)
      
      const productNode: TreeNode = {
        id: `product-${location}-${productKey}`,
        label: `${firstItem.size} ${firstItem.productName}`,
        icon: <Package className={`w-4 h-4 ${colorClass}`} />,
        children: [],
        data: {
          type: 'product',
          product: firstItem.product,
          productName: firstItem.productName,
          size: firstItem.size,
          location,
        },
      }
      
      // Create container nodes
      productItems.forEach((item) => {
        const containerIcon = item.crateId ? (
          <Archive className="w-4 h-4 text-gray-600" />
        ) : (
          <Box className="w-4 h-4 text-amber-600" />
        )
        
        const containerType = item.crateId ? 'Crate' : 'Box'
        const containerId = item.crateId || item.id
        
        const containerNode: TreeNode = {
          id: `container-${item.id}`,
          label: `${containerType} ${containerId} - ${item.units} jars - Batch ${item.batch}`,
          icon: containerIcon,
          data: {
            type: 'container',
            ...item,
            containerType: item.crateId ? 'crate' : 'uline_box',
          },
        }
        
        productNode.children!.push(containerNode)
      })
      
      locationNode.children!.push(productNode)
    })
    
    treeNodes.push(locationNode)
  })
  
  return treeNodes
}

/**
 * Get color class based on product type
 */
function getProductColorClass(product: string): string {
  switch (product.toLowerCase()) {
    case 'purple':
      return 'text-purple-600'
    case 'green':
      return 'text-green-600'
    case 'blue':
      return 'text-blue-600'
    default:
      return 'text-gray-600'
  }
}

/**
 * Transform container data into tree nodes
 * For more detailed production tracking
 */
export function transformContainersToTree(containers: Container[]): TreeNode[] {
  // Group by location
  const locationMap = new Map<string, Container[]>()
  
  containers.forEach((container) => {
    if (!locationMap.has(container.location)) {
      locationMap.set(container.location, [])
    }
    locationMap.get(container.location)!.push(container)
  })
  
  const treeNodes: TreeNode[] = []
  
  locationMap.forEach((items, location) => {
    const locationNode: TreeNode = {
      id: `location-${location}`,
      label: `Location ${location}`,
      icon: <MapPin className="w-4 h-4 text-blue-600" />,
      children: [],
      data: { type: 'location', location },
    }
    
    // Group by product type + size
    const productMap = new Map<string, Container[]>()
    
    items.forEach((container) => {
      const productKey = `${container.productType}-${container.size}`
      if (!productMap.has(productKey)) {
        productMap.set(productKey, [])
      }
      productMap.get(productKey)!.push(container)
    })
    
    // Create product nodes
    productMap.forEach((containers, productKey) => {
      const firstContainer = containers[0]
      const colorClass = getProductColorClass(firstContainer.productType)
      
      const productNode: TreeNode = {
        id: `product-${location}-${productKey}`,
        label: `${firstContainer.size} ${firstContainer.productType}`,
        icon: <Package className={`w-4 h-4 ${colorClass}`} />,
        children: [],
        data: {
          type: 'product',
          productType: firstContainer.productType,
          size: firstContainer.size,
          location,
        },
      }
      
      // Create container nodes
      containers.forEach((container) => {
        const containerIcon = container.type === 'crate' ? (
          <Archive className="w-4 h-4 text-gray-600" />
        ) : (
          <Box className="w-4 h-4 text-amber-600" />
        )
        
        const containerType = container.type === 'crate' ? 'Crate' : 'Box'
        const stageLabel = getStageLabel(container.stage)
        
        const containerNode: TreeNode = {
          id: `container-${container.id}`,
          label: `${containerType} ${container.id} - ${container.jarCount} jars - ${stageLabel}`,
          icon: containerIcon,
          data: {
            type: 'container',
            ...container,
          },
        }
        
        productNode.children!.push(containerNode)
      })
      
      locationNode.children!.push(productNode)
    })
    
    treeNodes.push(locationNode)
  })
  
  return treeNodes
}

/**
 * Get display label for production stage
 */
function getStageLabel(stage: string): string {
  const stageLabels: Record<string, string> = {
    cooked: 'Cooked',
    labeled: 'Labeled',
    packed: 'Packed',
    shipped: 'Shipped',
  }
  
  return stageLabels[stage] || stage
}

/**
 * Get summary statistics from tree data
 */
export function getTreeStatistics(nodes: TreeNode[]): {
  totalLocations: number
  totalProducts: number
  totalContainers: number
  totalJars: number
} {
  let totalProducts = 0
  let totalContainers = 0
  let totalJars = 0
  
  nodes.forEach((locationNode) => {
    if (locationNode.children) {
      totalProducts += locationNode.children.length
      
      locationNode.children.forEach((productNode) => {
        if (productNode.children) {
          totalContainers += productNode.children.length
          
          productNode.children.forEach((containerNode) => {
            if (containerNode.data?.units) {
              totalJars += containerNode.data.units
            } else if (containerNode.data?.jarCount) {
              totalJars += containerNode.data.jarCount
            }
          })
        }
      })
    }
  })
  
  return {
    totalLocations: nodes.length,
    totalProducts,
    totalContainers,
    totalJars,
  }
}

