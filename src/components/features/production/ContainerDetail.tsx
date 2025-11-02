"use client"

import { Package, Archive, Box, MapPin, Calendar, Hash } from 'lucide-react'
import type { TreeNode } from './TreeView'

interface ContainerDetailProps {
  node: TreeNode
  onClose?: () => void
}

export function ContainerDetail({ node, onClose }: ContainerDetailProps) {
  if (!node.data) return null

  const { type, data } = { type: node.data.type, data: node.data }

  // Render container details
  if (type === 'container') {
    const containerType = data.crateId ? 'Crate' : 'U-line Box'
    const containerId = data.crateId || data.id

    return (
      <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            {data.crateId ? (
              <Archive className="w-5 h-5 text-gray-600" />
            ) : (
              <Box className="w-5 h-5 text-amber-600" />
            )}
            {containerType} {containerId}
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ×
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <DetailItem
            icon={<Hash className="w-4 h-4" />}
            label="Batch Number"
            value={data.batch}
          />
          <DetailItem
            icon={<Package className="w-4 h-4" />}
            label="Jar Count"
            value={`${data.units} jars`}
          />
          <DetailItem
            icon={<Package className="w-4 h-4" />}
            label="Size"
            value={data.size}
          />
          <DetailItem
            icon={<MapPin className="w-4 h-4" />}
            label="Location"
            value={data.location}
          />
          <DetailItem
            icon={<Package className="w-4 h-4" />}
            label="Product"
            value={data.productName}
            className="col-span-2"
          />
          <DetailItem
            icon={<Package className="w-4 h-4" />}
            label="Item Type"
            value={data.itemType}
          />
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-2">
          <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            Move to Next Stage
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
            Edit
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
            Print Label
          </button>
        </div>
      </div>
    )
  }

  // Render product summary
  if (type === 'product') {
    return (
      <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5" />
            {data.size} {data.productName}
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ×
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <DetailItem
            icon={<MapPin className="w-4 h-4" />}
            label="Location"
            value={data.location}
          />
          <DetailItem
            icon={<Package className="w-4 h-4" />}
            label="Product Type"
            value={data.product}
          />
        </div>
      </div>
    )
  }

  // Render location summary
  if (type === 'location') {
    return (
      <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Location {data.location}
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ×
            </button>
          )}
        </div>

        <p className="text-sm text-gray-600">
          Storage area for production inventory
        </p>
      </div>
    )
  }

  return null
}

interface DetailItemProps {
  icon: React.ReactNode
  label: string
  value: string
  className?: string
}

function DetailItem({ icon, label, value, className }: DetailItemProps) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-gray-900 font-medium">{value}</div>
    </div>
  )
}

