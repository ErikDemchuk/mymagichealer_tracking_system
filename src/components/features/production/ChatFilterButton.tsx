"use client"

import { MessageCircle } from 'lucide-react'
import { useState } from 'react'

interface ChatFilterButtonProps {
  onClick: () => void
}

export function ChatFilterButton({ onClick }: ChatFilterButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="flex items-center space-x-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
        aria-label="Open chat filter"
      >
        <MessageCircle className="w-4 h-4" />
        <span>Ask AI</span>
      </button>
      
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap">
          Search with natural language
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  )
}



