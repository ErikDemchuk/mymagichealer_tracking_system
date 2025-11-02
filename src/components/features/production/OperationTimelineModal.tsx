"use client"

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { OperationTimeline } from './OperationTimeline'
import type { OperationHistory } from '@/types/operation-history'

interface OperationTimelineModalProps {
  isOpen: boolean
  onClose: () => void
  history: OperationHistory | null
}

export function OperationTimelineModal({ isOpen, onClose, history }: OperationTimelineModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen || !history) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl flex flex-col"
        >
          {/* Close Button - Floating in top right */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 text-neutral-400 hover:text-neutral-600 rounded-full hover:bg-white/80 backdrop-blur-sm transition-colors shadow-lg"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content - Scrollable with padding to keep rounded corners visible */}
          <div className="max-h-[90vh] overflow-y-auto py-4 px-4 scrollbar-hide">
            <OperationTimeline history={history} />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

