"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Edit, Eye, Trash2, Package, MapPin, Archive } from 'lucide-react'

interface QuickPrompt {
  id: string
  label: string
  command: string
  icon: typeof Search
  category: 'filter' | 'add' | 'update' | 'view' | 'delete'
}

interface QuickPromptBoxProps {
  isOpen: boolean
  onClose: () => void
  onSelectCommand: (command: string) => void
}

const QUICK_PROMPTS: QuickPrompt[] = [
  // Filter/Search
  { id: 'search-1', label: 'Find location B-1', command: 'Find location B-1', icon: MapPin, category: 'filter' },
  { id: 'search-2', label: 'Show batch UFC324', command: 'Show batch UFC324', icon: Search, category: 'filter' },
  { id: 'search-3', label: 'Where is crate C-32?', command: 'Where is crate C-32?', icon: Archive, category: 'filter' },
  
  // Add/Create
  { id: 'add-1', label: 'Add new batch', command: 'Add new batch', icon: Plus, category: 'add' },
  { id: 'add-2', label: 'Create new crate', command: 'Create new crate', icon: Plus, category: 'add' },
  { id: 'add-3', label: 'Record cooking session', command: 'Record cooking session', icon: Plus, category: 'add' },
  
  // Update
  { id: 'update-1', label: 'Update location', command: 'Update location', icon: Edit, category: 'update' },
  { id: 'update-2', label: 'Change status', command: 'Change status', icon: Edit, category: 'update' },
  { id: 'update-3', label: 'Move crate', command: 'Move crate', icon: Edit, category: 'update' },
  
  // View
  { id: 'view-1', label: 'Show UFC324 history', command: 'open UFC324 operation data', icon: Eye, category: 'view' },
  { id: 'view-2', label: 'View all locations', command: 'View all locations', icon: Eye, category: 'view' },
  { id: 'view-3', label: 'List all batches', command: 'List all batches', icon: Eye, category: 'view' },
  
  // Delete
  { id: 'delete-1', label: 'Remove batch', command: 'Remove batch', icon: Trash2, category: 'delete' },
  { id: 'delete-2', label: 'Delete crate record', command: 'Delete crate record', icon: Trash2, category: 'delete' },
]

const CATEGORY_CONFIG = {
  filter: { label: 'Filter & Search', color: 'text-blue-600', bgColor: 'bg-blue-50', hoverColor: 'hover:bg-blue-100' },
  add: { label: 'Add New', color: 'text-green-600', bgColor: 'bg-green-50', hoverColor: 'hover:bg-green-100' },
  update: { label: 'Update', color: 'text-amber-600', bgColor: 'bg-amber-50', hoverColor: 'hover:bg-amber-100' },
  view: { label: 'View', color: 'text-purple-600', bgColor: 'bg-purple-50', hoverColor: 'hover:bg-purple-100' },
  delete: { label: 'Delete', color: 'text-red-600', bgColor: 'bg-red-50', hoverColor: 'hover:bg-red-100' },
}

export function QuickPromptBox({ isOpen, onClose, onSelectCommand }: QuickPromptBoxProps) {
  if (!isOpen) return null

  const handleSelectCommand = (command: string) => {
    onSelectCommand(command)
    onClose()
  }

  const categories = ['filter', 'add', 'update', 'view', 'delete'] as const
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={onClose}
          />
          
          {/* Quick Prompt Box */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full right-0 mt-2 z-50 w-[600px] max-h-[80vh] overflow-y-auto bg-white rounded-xl shadow-2xl border border-gray-200"
          >
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Quick Commands</h3>
              
              <div className="space-y-4">
                {categories.map((category) => {
                  const prompts = QUICK_PROMPTS.filter(p => p.category === category)
                  const config = CATEGORY_CONFIG[category]
                  
                  return (
                    <div key={category}>
                      <h4 className={`text-xs font-medium ${config.color} mb-2`}>
                        {config.label}
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {prompts.map((prompt) => {
                          const Icon = prompt.icon
                          return (
                            <button
                              key={prompt.id}
                              onClick={() => handleSelectCommand(prompt.command)}
                              className={`flex items-center gap-2 p-3 rounded-lg border border-gray-200 ${config.bgColor} ${config.hoverColor} transition-colors text-left group`}
                            >
                              <div className={`flex-shrink-0 w-8 h-8 ${config.bgColor} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <Icon className={`w-4 h-4 ${config.color}`} />
                              </div>
                              <span className="text-sm text-gray-700 font-medium truncate">
                                {prompt.label}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}



