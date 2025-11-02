"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion"
import { X, ChefHat, Package, MapPin, Boxes, FileText, Hash, Maximize2, Minimize2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export interface CookFormData {
  batchNumber: string
  storageLocation: string
  productType: string
  crateId: string
  jarCount: string
  jobBoxNumber: string
  summary: string
  user: string
  timestamp: Date
  status: 'pending' | 'completed' | 'failed'
  taskType: string
}

interface CookFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CookFormData) => void
  zIndex?: number
  onPositionChange?: (x: number, y: number, isCollapsed: boolean) => void
  externalCollapsed?: boolean // External control for collapsed state
  stackIndex?: number // Position in the stack when collapsed
}

export function CookForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  zIndex = 50,
  onPositionChange,
  externalCollapsed = false,
  stackIndex = 0
}: CookFormProps) {
  const [batchNumber, setBatchNumber] = useState("")
  const [storageLocation, setStorageLocation] = useState("")
  const [productType, setProductType] = useState("")
  const [crateId, setCrateId] = useState("")
  const [jarCount, setJarCount] = useState("")
  const [jobBoxNumber, setJobBoxNumber] = useState("")
  const [summary, setSummary] = useState("")
  const constraintsRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const [modalSize, setModalSize] = useState({ width: 672, height: 540 })
  const [isMinimized, setIsMinimized] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [hasBeenDragged, setHasBeenDragged] = useState(false) // Track if user has manually dragged
  const onPositionChangeRef = useRef(onPositionChange) // Store callback in ref to avoid dependency issues
  const lastPositionRef = useRef({ x: 0, y: 0 }) // Track last notified position
  const justCollapsedRef = useRef(false) // Track if modal just collapsed to prevent position updates
  
  // Motion values for animation (must be before useEffect)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  // Update ref when callback changes
  useEffect(() => {
    onPositionChangeRef.current = onPositionChange
  }, [onPositionChange])
  
  // Handle external collapse/expand control
  useEffect(() => {
    if (externalCollapsed && !isCollapsed) {
      // External request to collapse - do it smoothly
      setIsCollapsed(true)
      setIsMinimized(true)
      justCollapsedRef.current = true
      setTimeout(() => {
        justCollapsedRef.current = false
      }, 300)
    } else if (!externalCollapsed && isCollapsed) {
      // External request to expand - restore to center
      setIsCollapsed(false)
      setIsMinimized(false)
      justCollapsedRef.current = false
      setPosition({ x: 0, y: 0 })
      
      // Notify parent
      if (onPositionChangeRef.current) {
        onPositionChangeRef.current(0, 0, false)
      }
    }
  }, [externalCollapsed, isCollapsed])

  const storageLocations = [
    "B-1", "B-2", "B-3", "B-4", "B-5", "B-6", "B-7", "B-8", "B-9", "B-10", "B-11", "B-12"
  ]

  const productTypes = [
    "1oz", "2oz", "4oz"
  ]

  const isNarrow = modalSize.width < 600

  // Handle minimize/maximize with animation to right side
  const handleMinimize = () => {
    if (!isMinimized) {
      // Collapse: instantly set position and hide - no landing animation
      // Calculate container position on right side with stacking
      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920
      const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080
      const containerWidth = 320
      const padding = 16
      const cardHeight = 60
      const gapBetweenCards = 8
      
      // Calculate target position to snap into container with vertical stacking
      const targetX = (viewportWidth / 2) - containerWidth - padding
      const baseY = 0 // Center vertically
      const stackOffset = stackIndex * (cardHeight + gapBetweenCards)
      const targetY = baseY + stackOffset
      
      // Set position instantly (no animation)
      setPosition({ x: targetX, y: targetY })
      
      // Set collapsed state immediately
      setIsCollapsed(true)
      setIsMinimized(true)
      setHasBeenDragged(false)
      justCollapsedRef.current = true
      
      // Notify parent immediately
      if (onPositionChangeRef.current) {
        onPositionChangeRef.current(targetX, targetY, true)
      }
      
      // Clear the just-collapsed flag
      setTimeout(() => {
        justCollapsedRef.current = false
      }, 300)
    } else {
      // Expand: restore to center
      setIsCollapsed(false)
      setIsMinimized(false)
      setHasBeenDragged(false) // Reset drag flag
      justCollapsedRef.current = false
      // Reset position to center
      setPosition({ x: 0, y: 0 })
      
      // Notify parent
      if (onPositionChangeRef.current) {
        onPositionChangeRef.current(0, 0, false)
      }
    }
  }


  // Handle drag start - track that user is dragging
  const handleDragStart = () => {
    setIsDragging(true)
    setHasBeenDragged(true) // Mark that user has manually positioned the modal
  }

  // Handle drag end - update position with proper constraints and magnetic snapping
  const handleDragEnd = (event: any, info: any) => {
    setIsDragging(false)
    
    if (!constraintsRef.current || !modalRef.current) return
    
    const containerRect = constraintsRef.current.getBoundingClientRect()
    const modalRect = modalRef.current.getBoundingClientRect()
    
    // Calculate bounds relative to center of container
    const containerCenterX = containerRect.width / 2
    const containerCenterY = containerRect.height / 2
    const modalWidth = isMinimized ? 280 : modalSize.width
    const modalHeight = isMinimized ? modalRect.height : modalSize.height
    
    // Calculate constraints (half container size minus half modal size + padding)
    const padding = 16
    const maxX = containerCenterX - modalWidth / 2 - padding
    const minX = -containerCenterX + modalWidth / 2 + padding
    const maxY = containerCenterY - modalHeight / 2 - padding
    const minY = -containerCenterY + modalHeight / 2 + padding
    
    // Get current position from motion values
    const currentX = position.x
    const currentY = position.y
    
    // Calculate new position based on drag offset
    let newX = currentX + info.offset.x
    let newY = currentY + info.offset.y
    
    // Clamp position to stay within bounds
    const clampedX = Math.max(minX, Math.min(maxX, newX))
    const clampedY = Math.max(minY, Math.min(maxY, newY))
    
    // Check if modal was dragged out of container (when collapsed)
    if (isCollapsed && isMinimized) {
      // Container bounds
      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920
      const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080
      const containerWidth = 320
      const containerX = (viewportWidth / 2) - containerWidth - padding
      const containerY = 0 // Centered vertically
      const tolerance = 100 // Increased tolerance for drag-out detection
      
      // Check if dragged outside container zone
      const draggedOut = Math.abs(clampedX - containerX) > tolerance || 
                        Math.abs(clampedY - containerY) > tolerance
      
      if (draggedOut) {
        // Auto-expand when dragged out
        setIsCollapsed(false)
        setIsMinimized(false)
        // Keep position where dragged to
        setPosition({ x: clampedX, y: clampedY })
        
        // Notify parent of expansion
        if (onPositionChangeRef.current) {
          onPositionChangeRef.current(clampedX, clampedY, false)
        }
        return
      }
    }
    
    // Don't update position if modal just collapsed (prevent landing adjustment)
    if (justCollapsedRef.current && isCollapsed) {
      return
    }
    
    // Update position state (this will trigger animation via animate prop)
    setPosition({ x: clampedX, y: clampedY })
    
    // Notify parent of position change only if position actually changed significantly
    const positionChanged = Math.abs(lastPositionRef.current.x - clampedX) > 1 || 
                            Math.abs(lastPositionRef.current.y - clampedY) > 1
    if (positionChanged && onPositionChangeRef.current) {
      lastPositionRef.current = { x: clampedX, y: clampedY }
      onPositionChangeRef.current(clampedX, clampedY, isCollapsed)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!batchNumber.trim() || !storageLocation || !productType || !crateId.trim() || !jarCount.trim()) return

    const formData: CookFormData = {
      batchNumber,
      storageLocation,
      productType,
      crateId,
      jarCount,
      jobBoxNumber,
      summary,
      user: "Erik Demchuk",
      timestamp: new Date(),
      status: 'pending',
      taskType: 'Cook Action'
    }
    onSubmit(formData)
    
    // Reset form
    setBatchNumber("")
    setStorageLocation("")
    setProductType("")
    setCrateId("")
    setJarCount("")
    setJobBoxNumber("")
    setSummary("")
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - transparent, allows pointer events through */}
          <motion.div
            ref={constraintsRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ zIndex, pointerEvents: 'none' }}
          >
            <div className="fixed inset-0 bg-transparent" style={{ pointerEvents: 'none' }} />
            
            {/* Modal - draggable (hidden when collapsed and in container) */}
            {!isCollapsed && (
            <motion.div
              ref={modalRef}
              drag // Always draggable, but sticky when collapsed
              dragMomentum={false}
              dragConstraints={constraintsRef}
              dragElastic={0.1}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              initial={{ opacity: 0, scale: 0.95, y: 20, x: 0 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                x: position.x,
                y: position.y,
              }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ 
                default: { duration: 0.2, ease: "linear" },
                opacity: { duration: 0.15, ease: "linear" },
                scale: { duration: 0.2, ease: "linear" },
                x: { 
                  duration: 0, // No animation
                  ease: "linear"
                },
                y: { 
                  duration: 0, // No animation
                  ease: "linear"
                },
              }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-2xl border border-gray-300 overflow-hidden flex flex-col"
              style={{ 
                width: isMinimized ? 280 : `${modalSize.width}px`, // Shorter horizontally when collapsed
                height: isMinimized ? 'auto' : `${modalSize.height}px`,
                minWidth: isMinimized ? 280 : 400, // Different minWidth when collapsed
                maxHeight: '90vh',
                zIndex: zIndex + 1,
                cursor: isMinimized ? 'default' : 'move',
                pointerEvents: 'auto', // Allow interaction with modal itself
                boxShadow: 'none',
                transition: 'width 0.5s ease, height 0.5s ease',
              }}
            >

              {/* Header */}
              <div 
                className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50/50 flex-shrink-0"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <ChefHat className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-gray-900 truncate">Cook Action</h2>
                    <p className={`text-xs text-gray-500 ${isNarrow ? 'hidden' : ''}`}>Fill in the details below</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMinimize()
                    }}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded p-1 transition-colors cursor-pointer"
                  >
                    {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onClose()
                    }}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded p-1 transition-colors cursor-pointer z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Content */}
              {!isMinimized && (
                <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2" style={{ minHeight: 0 }}>
      <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Grid Layout - responsive based on modal width */}
                    <div className={`grid ${isNarrow ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
        {/* Batch Number */}
                      <div className="space-y-2">
                        <label htmlFor="batchNumber" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Hash className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className={isNarrow ? 'text-xs' : 'text-sm'}>Batch Number</span>
          </label>
          <Input
            id="batchNumber"
            type="text"
            value={batchNumber}
            onChange={(e) => setBatchNumber(e.target.value)}
            placeholder="e.g. C-32"
            required
                          className="h-9 text-sm"
          />
        </div>

        {/* Storage Location */}
                      <div className="space-y-2">
                        <label htmlFor="storageLocation" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className={isNarrow ? 'text-xs' : 'text-sm'}>Storage Location</span>
          </label>
          <select
            id="storageLocation"
            value={storageLocation}
            onChange={(e) => setStorageLocation(e.target.value)}
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            required
          >
            <option value="">Select location</option>
            {storageLocations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        {/* Product Type */}
                      <div className="space-y-2">
                        <label htmlFor="productType" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className={isNarrow ? 'text-xs' : 'text-sm'}>Product Type</span>
          </label>
          <select
            id="productType"
            value={productType}
            onChange={(e) => setProductType(e.target.value)}
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            required
          >
            <option value="">Select jar size</option>
            {productTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Crate ID */}
                      <div className="space-y-2">
                        <label htmlFor="crateId" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Boxes className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className={isNarrow ? 'text-xs' : 'text-sm'}>Crate ID</span>
          </label>
          <Input
            id="crateId"
            type="text"
            value={crateId}
            onChange={(e) => setCrateId(e.target.value)}
            placeholder="e.g. 12345"
            required
                          className="h-9 text-sm"
          />
        </div>

        {/* Jar Count */}
                      <div className="space-y-2">
                        <label htmlFor="jarCount" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className={isNarrow ? 'text-xs' : 'text-sm'}>Jar Count</span>
          </label>
          <Input
            id="jarCount"
            type="number"
            value={jarCount}
            onChange={(e) => setJarCount(e.target.value)}
            placeholder="e.g. 50"
            required
                          className="h-9 text-sm"
          />
        </div>

        {/* Job/Box Number */}
                      <div className="space-y-2">
                        <label htmlFor="jobBoxNumber" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className={isNarrow ? 'text-xs' : 'text-sm'}>Job/Box Number</span>
          </label>
          <Input
            id="jobBoxNumber"
            type="text"
            value={jobBoxNumber}
            onChange={(e) => setJobBoxNumber(e.target.value)}
            placeholder="Optional - e.g., JOB-001"
                          className="h-9 text-sm"
          />
                      </div>
        </div>

                    {/* Summary - Full Width */}
                    <div className="space-y-2">
                      <label htmlFor="summary" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className={isNarrow ? 'text-xs' : 'text-sm'}>Summary</span>
          </label>
          <textarea
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Enter a short summary of the cooking action"
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
            rows={3}
          />
        </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-3 pb-2 border-t border-gray-200">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={(e) => {
                          e.stopPropagation()
                          onClose()
                        }}
                        className="h-9 text-sm"
                      >
            Cancel
          </Button>
                      <Button 
                        type="submit" 
                        className="h-9 bg-gray-900 hover:bg-gray-800 text-white text-sm"
                      >
                        Submit Cook Action
          </Button>
        </div>
      </form>
                </div>
              )}
            </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
