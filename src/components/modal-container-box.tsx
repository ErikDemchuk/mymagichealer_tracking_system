"use client"

import { useRef, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ChefHat, FileText, Maximize2, X } from "lucide-react"

interface ModalContainerBoxProps {
  modals: Array<{ id: string; type: string; isCollapsed?: boolean; position?: { x: number; y: number } }>
  children: React.ReactNode
  zIndex?: number
  onModalReorder?: (modalIds: string[]) => void
  onModalClick?: (modalId: string) => void
  onModalClose?: (modalId: string) => void
}

export function ModalContainerBox({ modals, children, zIndex = 50, onModalReorder, onModalClick, onModalClose }: ModalContainerBoxProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState(150)
  
  // Calculate container dimensions
  const cardHeight = 60 // Height of each artifact card
  const gapBetweenCards = 8
  const padding = 12 // Match p-3 (12px = 0.75rem * 16)
  const headerHeight = 0 // No header anymore
  const containerWidth = 320 // Width of the sidebar panel
  
  // Container position (right side) - calculate once
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080
  // Right side positioning: fixed position on right side, centered vertically
  // Use fixed positioning from top-right corner instead of center translation
  const rightOffset = padding // Distance from right edge
  const topOffset = (viewportHeight / 2) - (containerHeight / 2) // Center vertically based on container height
  
  // Check if a modal position is inside the container bounds
  function isInsideContainer(position?: { x: number; y: number }): boolean {
    if (!position) return false
    
    // Calculate container position dynamically
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1920
    const vh = typeof window !== 'undefined' ? window.innerHeight : 1080
    const containerPadding = 16 // Padding for container positioning
    const containerWidth = 320
    
    // Calculate position relative to viewport center (for modal coordinate system)
    const cx = (vw / 2) - containerWidth - containerPadding
    const cy = 0
    
    // Magnetic zone: check if modal is near container position (±50px tolerance)
    const tolerance = 50
    const modalX = position.x
    const modalY = position.y
    
    // Calculate current container height based on collapsed modals
    const collapsedModals = modals.filter(m => m.isCollapsed)
    const cardHeight = 60
    const gapBetweenCards = 8
    const headerHeight = 0
    // Use the padding from outer scope (12px) for height calculation
    const currentHeight = Math.max(100, headerHeight + (cardHeight + gapBetweenCards) * collapsedModals.length + padding * 2)
    
    const isWithinX = Math.abs(modalX - cx) < tolerance
    const isWithinY = modalY >= cy - tolerance && modalY <= cy + currentHeight + tolerance
    
    return isWithinX && isWithinY
  }
  
  // Get all collapsed modals (regardless of position)
  const allCollapsedModals = modals.filter(m => m.isCollapsed)
  
  // Calculate container size based on number of collapsed modals inside
  const collapsedModalsInContainer = modals.filter(m => m.isCollapsed && isInsideContainer(m.position))
  
  // Show container when 1+ modals are collapsed
  // Show if any modal is collapsed, even if not yet positioned inside
  const shouldShow = allCollapsedModals.length >= 1
  
  // Calculate height based on number of collapsed modals (use all collapsed if none positioned yet)
  const numberOfModalsInContainer = collapsedModalsInContainer.length > 0 
    ? collapsedModalsInContainer.length 
    : allCollapsedModals.length
  const minHeight = Math.max(100, headerHeight + (cardHeight + gapBetweenCards) * numberOfModalsInContainer + padding * 2)
  
  // Update container height when modals change
  useEffect(() => {
    if (shouldShow) {
      setContainerHeight(minHeight)
    }
  }, [minHeight, shouldShow])
  
  // Update container size when window resizes
  useEffect(() => {
    if (!shouldShow) return
    
    const handleResize = () => {
      // Force re-render to update container position
      if (containerRef.current) {
        containerRef.current.style.display = 'none'
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.style.display = 'block'
          }
        }, 0)
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [shouldShow])
  
  if (!shouldShow) return <>{children}</>
  
  // Get modal titles/types for display
  const getModalTitle = (modal: typeof modals[0]) => {
    if (modal.type === 'cook') return 'Cook Action'
    return 'Modal'
  }
  
  const getModalIcon = (modal: typeof modals[0]) => {
    if (modal.type === 'cook') return ChefHat
    return FileText
  }
  
  return (
    <>
      {/* Container Box - No header, grey outline */}
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, x: 20 }}
        animate={{ 
          opacity: 1, 
          x: 0,
          height: containerHeight,
        }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ 
          duration: 0.5, 
          ease: [0.25, 0.1, 0.25, 1], // Smooth easing
          height: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
        }}
        className="fixed inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex }}
      >
        <div
          className="absolute rounded-lg bg-gray-100/50 border border-black overflow-hidden"
          style={{
            width: containerWidth,
            height: containerHeight,
            right: `${rightOffset}px`,
            top: `${topOffset}px`,
            pointerEvents: 'auto',
          }}
        >
          {/* Modal Cards - No header */}
          <div className="py-3 px-3 space-y-2 overflow-y-auto" style={{ maxHeight: containerHeight }}>
            {allCollapsedModals.map((modal, index) => {
              const Icon = getModalIcon(modal)
              const title = getModalTitle(modal)
              
              return (
                <motion.div
                  key={modal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: index * 0.08,
                    duration: 0.4,
                    ease: [0.25, 0.1, 0.25, 1]
                  }}
                  className="bg-white rounded-lg border border-gray-200 p-3 hover:border-gray-300 transition-all flex items-center gap-3"
                >
                  {/* Icon */}
                  <div className="w-8 h-8 rounded bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-orange-600" />
                  </div>
                  
                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
                    <p className="text-xs text-gray-500">Form · Collapsed</p>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-0.5 flex-shrink-0 -mt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onModalClick?.(modal.id)
                      }}
                      className="p-0.5 hover:bg-gray-100 rounded transition-colors"
                      title="Expand"
                    >
                      <Maximize2 className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onModalClose?.(modal.id)
                      }}
                      className="p-0.5 hover:bg-gray-100 rounded transition-colors"
                      title="Close"
                    >
                      <X className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.div>
      
      {/* Render children */}
      {children}
    </>
  )
}

// Export helper function to check if position is inside container
export function getContainerBounds() {
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080
  const padding = 16
  const containerWidth = 320
  const containerX = (viewportWidth / 2) - containerWidth - padding
  const containerY = 0 // Centered vertically
  
  return { x: containerX, y: containerY, width: containerWidth, tolerance: 50 }
}
