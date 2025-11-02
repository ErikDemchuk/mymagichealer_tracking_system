"use client"

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  ChevronRight,
  MapPin,
  Package,
  Archive,
  Box,
  MoreHorizontal,
  History,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ProductionTreeTableNode {
  id: string
  label: string
  type: 'location' | 'product' | 'container'
  icon?: React.ReactNode
  children?: ProductionTreeTableNode[]
  data?: {
    location?: string
    product?: string
    productName?: string
    size?: string
    crateId?: string
    batch?: string
    units?: number
    itemType?: string
    stage?: string
    [key: string]: any
  }
}

interface ProductionTreeTableProps {
  data: ProductionTreeTableNode[]
  onNodeClick?: (node: ProductionTreeTableNode) => void
  defaultExpandedIds?: string[]
  className?: string
  highlightedIds?: string[]
  filteredIds?: string[]
  onHistoryClick?: (batchId: string) => void
}

export function ProductionTreeTable({
  data,
  onNodeClick,
  defaultExpandedIds = [],
  className,
  highlightedIds = [],
  filteredIds = [],
  onHistoryClick,
}: ProductionTreeTableProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(defaultExpandedIds)
  )

  // Auto-expand nodes that contain highlighted items
  const autoExpandForHighlights = (nodes: ProductionTreeTableNode[], parentIds: string[] = []): string[] => {
    let idsToExpand: string[] = []
    nodes.forEach(node => {
      const hasHighlightedChild = node.children?.some(child => 
        highlightedIds.includes(child.id) || 
        (child.children?.some(grandchild => highlightedIds.includes(grandchild.id)))
      )
      if (hasHighlightedChild || highlightedIds.includes(node.id)) {
        idsToExpand.push(...parentIds, node.id)
      }
      if (node.children) {
        idsToExpand.push(...autoExpandForHighlights(node.children, [...parentIds, node.id]))
      }
    })
    return idsToExpand
  }

  // Update expanded IDs when highlights change
  useEffect(() => {
    if (highlightedIds.length > 0) {
      const toExpand = autoExpandForHighlights(data)
      setExpandedIds(new Set([...expandedIds, ...toExpand]))
    }
  }, [highlightedIds])

  // Auto-expand all nodes on mount to keep dashboard always open
  useEffect(() => {
    const allIds = new Set<string>()
    const collectIds = (nodes: ProductionTreeTableNode[]) => {
      nodes.forEach(node => {
        allIds.add(node.id)
        if (node.children) {
          collectIds(node.children)
        }
      })
    }
    collectIds(data)
    setExpandedIds(allIds)
  }, [data])

  // Filter and reorder data
  const processedData = useMemo(() => {
    if (filteredIds.length === 0 && highlightedIds.length === 0) {
      return data
    }

    const filterNode = (node: ProductionTreeTableNode): ProductionTreeTableNode | null => {
      if (filteredIds.length > 0 && !filteredIds.includes(node.id) && 
          !node.children?.some(child => filteredIds.includes(child.id) || 
            child.children?.some(grandchild => filteredIds.includes(grandchild.id)))) {
        return null
      }

      const filteredChildren = node.children
        ?.map(child => filterNode(child))
        .filter((child): child is ProductionTreeTableNode => child !== null)

      return {
        ...node,
        children: filteredChildren,
      }
    }

    const filtered = data.map(node => filterNode(node)).filter((node): node is ProductionTreeTableNode => node !== null)

    // Reorder: highlighted items first
    if (highlightedIds.length > 0) {
      return filtered.sort((a, b) => {
        const aHighlighted = highlightedIds.includes(a.id) || 
          a.children?.some(child => highlightedIds.includes(child.id))
        const bHighlighted = highlightedIds.includes(b.id) || 
          b.children?.some(child => highlightedIds.includes(child.id))
        if (aHighlighted && !bHighlighted) return -1
        if (!aHighlighted && bHighlighted) return 1
        return 0
      })
    }

    return filtered
  }, [data, filteredIds, highlightedIds])

  const toggleExpanded = (nodeId: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev)
      newSet.has(nodeId) ? newSet.delete(nodeId) : newSet.add(nodeId)
      return newSet
    })
  }

  const renderNode = (
    node: ProductionTreeTableNode,
    level = 0,
    isLast = false,
    parentPath: boolean[] = []
  ) => {
    const hasChildren = (node.children?.length ?? 0) > 0
    const isExpanded = expandedIds.has(node.id)
    const currentPath = [...parentPath, isLast]

    const getIcon = () => {
      if (node.icon) return node.icon
      
      switch (node.type) {
        case 'location':
          return <MapPin className="w-4 h-4 text-blue-600" />
        case 'product':
          return <Package className={`w-4 h-4 ${getProductColor(node.data?.product)}`} />
        case 'container':
          return node.data?.crateId ? (
            <Archive className="w-4 h-4 text-gray-600" />
          ) : (
            <Box className="w-4 h-4 text-amber-600" />
          )
        default:
          return null
      }
    }

    return (
      <motion.div key={node.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div
          className={cn(
            "group hover:bg-gray-50 transition-colors relative",
            node.type === 'location' && "bg-gray-50/50",
            node.type === 'product' && "bg-white",
            highlightedIds.includes(node.id) && "bg-yellow-50 border-l-4 border-l-yellow-500"
          )}
          onClick={() => onNodeClick?.(node)}
        >
          {/* Tree Lines - Enhanced Visual Style */}
          {level > 0 && (
            <div className="absolute left-0 top-0 bottom-0 pointer-events-none">
              {/* Vertical lines for each level */}
              {currentPath.slice(0, -1).map((_, pathIndex) => (
                <div
                  key={pathIndex}
                  className="absolute top-0 bottom-0 w-px bg-gray-300"
                  style={{
                    left: pathIndex * 24 + 16,
                  }}
                />
              ))}
              
              {/* Current level vertical line (half height if last) */}
              <div
                className="absolute top-0 w-px bg-gray-300"
                style={{
                  left: (level - 1) * 24 + 16,
                  height: isLast ? '50%' : '100%',
                }}
              />
              
              {/* Horizontal connector line */}
              <div
                className="absolute top-1/2 h-px bg-gray-300"
                style={{
                  left: (level - 1) * 24 + 16,
                  width: 24,
                  transform: 'translateY(-0.5px)',
                }}
              />
            </div>
          )}

          <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-200">
            {/* Name Column (spans more for hierarchy) */}
            <div className="col-span-4 flex items-center gap-2 relative" style={{ paddingLeft: `${level * 24}px` }}>
              <motion.div
                className="cursor-pointer flex-shrink-0"
                animate={{ rotate: hasChildren && isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => {
                  e.stopPropagation()
                  if (hasChildren) toggleExpanded(node.id)
                }}
              >
                {hasChildren ? (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                ) : (
                  <div className="w-4 h-4" />
                )}
              </motion.div>

              <div className="flex-shrink-0">{getIcon()}</div>

              {/* History button for containers */}
              {node.type === 'container' && node.data?.batch && onHistoryClick && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onHistoryClick(node.data!.batch!)
                  }}
                  className="flex-shrink-0 p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                  title={`View history for batch ${node.data.batch}`}
                >
                  <History className="w-4 h-4" />
                </button>
              )}

              <span className={cn(
                "font-medium truncate",
                node.type === 'location' && "text-gray-900 font-semibold",
                node.type === 'product' && "text-gray-800",
                node.type === 'container' && "text-gray-700"
              )}>
                {node.label}
              </span>
            </div>

            {/* Container Details (only for container type) */}
            {node.type === 'container' && (
              <>
                <div className="col-span-1 flex items-center text-sm text-gray-600">
                  {node.data?.batch || '-'}
                </div>
                <div className="col-span-1 flex items-center text-sm text-gray-600">
                  {node.data?.units || '-'}
                </div>
                <div className="col-span-1 flex items-center text-sm text-gray-600">
                  {node.data?.size || '-'}
                </div>
                <div className="col-span-2 flex items-center">
                  {node.data?.itemType && (
                    <span className={cn(
                      "px-2 py-1 rounded-md text-xs font-medium",
                      node.data.itemType === 'Labeled' && "bg-green-100 text-green-700",
                      node.data.itemType === 'Unlabeled' && "bg-amber-100 text-amber-700",
                      node.data.itemType.includes('Box') && "bg-blue-100 text-blue-700"
                    )}>
                      {node.data.itemType}
                    </span>
                  )}
                </div>
                <div className="col-span-2 flex items-center text-sm text-gray-600">
                  {node.data?.location || '-'}
                </div>
                <div className="col-span-1 flex items-center justify-end">
                  <button
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      onNodeClick?.(node)
                    }}
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}

            {/* Empty cells for non-container rows */}
            {node.type !== 'container' && (
              <div className="col-span-8" />
            )}
          </div>
        </div>

        {/* Children */}
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              {node.children!.map((child, index) =>
                renderNode(
                  child,
                  level + 1,
                  index === node.children!.length - 1,
                  currentPath
                )
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  return (
    <div className={cn("bg-white border border-gray-200 rounded-lg overflow-hidden", className)}>
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 font-semibold text-xs text-gray-600 uppercase tracking-wider">
        <div className="col-span-4">Name / Location</div>
        <div className="col-span-1">Batch</div>
        <div className="col-span-1">Units</div>
        <div className="col-span-1">Size</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Location</div>
        <div className="col-span-1 text-right">Actions</div>
      </div>

      {/* Table Body */}
      <div>
        {processedData.map((node, index) =>
          renderNode(node, 0, index === processedData.length - 1)
        )}
      </div>
    </div>
  )
}

function getProductColor(product?: string): string {
  switch (product?.toLowerCase()) {
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

