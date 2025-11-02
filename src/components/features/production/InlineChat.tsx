"use client"

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InlineChatProps {
  isOpen: boolean
  onClose: () => void
  onQuery: (query: string) => Promise<string>
}

const QUICK_PROMPTS = [
  "Find location B-1",
  "Show batch UFC324",
  "Add new batch UFC330",
  "Move crate C-32 to A-3",
  "View all locations",
]

export function InlineChat({ isOpen, onClose, onQuery }: InlineChatProps) {
  const [inputValue, setInputValue] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPrompts, setShowPrompts] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Close prompts when clicking outside the chat area
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatContainerRef.current && !chatContainerRef.current.contains(event.target as Node)) {
        setShowPrompts(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSubmit = async () => {
    if (!inputValue.trim() || isProcessing) return

    setIsProcessing(true)
    setShowPrompts(false)

    try {
      await onQuery(inputValue)
      setInputValue('')
      
      // Auto-close prompts after successful operation
      setTimeout(() => {
        setShowPrompts(false)
      }, 1000)
    } catch (error) {
      console.error('Error handling query:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit()
    } else if (e.key === 'Escape') {
      setShowPrompts(false)
    }
  }

  const handlePromptClick = (prompt: string) => {
    // Just set the value and restore color, don't execute
    setInputValue(prompt)
    if (inputRef.current) {
      inputRef.current.style.color = '#18181b' // zinc-900
      inputRef.current.focus() // Focus input so user can press Enter
    }
    setShowPrompts(false)
  }

  const handleInputFocus = () => {
    setShowPrompts(true)
  }

  const handlePromptHover = (prompt: string) => {
    setInputValue(prompt)
    if (inputRef.current) {
      inputRef.current.style.color = '#9ca3af' // gray-400
    }
  }

  const handlePromptLeave = () => {
    if (inputRef.current) {
      inputRef.current.style.color = '#18181b' // zinc-900
    }
  }

  return (
    <motion.div
      initial={false}
      animate={{ height: 'auto' }}
      className="bg-[#fbfaf9] border-b border-zinc-200"
    >
      <div className="flex w-full items-start justify-center p-8">
        <motion.div 
          ref={chatContainerRef}
          className="w-full max-w-4xl space-y-4"
          layout
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          
          {/* Search Bar */}
          <div className="relative w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Search size={20} className="text-zinc-400" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleInputFocus}
              placeholder="Search projects..."
              disabled={isProcessing}
              className="w-full rounded-lg border border-zinc-200 bg-white p-3 pl-12 pr-12 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 transition-all"
            />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!inputValue.trim() || isProcessing}
              className={cn(
                "absolute inset-y-0 right-0 flex items-center justify-center w-10 mr-1 my-1 rounded-lg transition-colors",
                isProcessing
                  ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                  : inputValue.trim()
                  ? "bg-black text-white hover:bg-zinc-800"
                  : "bg-transparent text-zinc-300"
              )}
            >
              {isProcessing ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
              ) : (
                <ArrowUp size={18} />
              )}
            </button>
          </div>

          {/* Quick Prompts Box */}
          <AnimatePresence mode="wait">
            {showPrompts && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="w-full rounded-lg bg-white border border-zinc-200 overflow-hidden"
                onMouseDown={(e) => e.preventDefault()} // Prevent blur when clicking prompts
              >
                <div className="flex flex-col">
                  {QUICK_PROMPTS.map((prompt, index) => (
                    <button
                      key={index}
                      type="button"
                      onMouseEnter={() => handlePromptHover(prompt)}
                      onMouseLeave={handlePromptLeave}
                      onClick={() => handlePromptClick(prompt)}
                      disabled={isProcessing}
                      className={cn(
                        "border-b border-zinc-100 px-4 py-3 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50",
                        index === QUICK_PROMPTS.length - 1 && "border-b-0"
                      )}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
        </motion.div>
      </div>
    </motion.div>
  )
}

