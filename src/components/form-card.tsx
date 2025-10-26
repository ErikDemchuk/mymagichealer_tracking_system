"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, CheckCircle, Clock, X, Minus, ChevronDown, ChevronUp } from "lucide-react"

export interface FormData {
  batchNumber?: string
  storageLocation?: string
  productType?: string
  crateId?: string
  jarCount?: string
  jobBoxNumber?: string
  summary: string
  user: string
  timestamp: Date
  status: 'pending' | 'completed' | 'failed'
  taskType?: string // New field for task type
}

interface FormCardProps {
  formData: FormData
}

export function FormCard({ formData }: FormCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const getStatusIcon = () => {
    switch (formData.status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'failed':
        return <X className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusText = () => {
    switch (formData.status) {
      case 'completed':
        return 'Completed'
      case 'pending':
        return 'Processing...'
      case 'failed':
        return 'Failed'
      default:
        return 'Pending'
    }
  }

  const getTaskType = () => {
    return formData.taskType || 'Cook Action' // Default to Cook Action if not specified
  }

  return (
    <div className="w-64 h-20 rounded-lg relative" style={{ backgroundColor: '#eeeeee' }}>
      {/* Left side content */}
      <div className="absolute left-3 top-3 flex flex-col">
        <div className="text-sm font-medium text-gray-700">
          {getTaskType()}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {formData.user}
        </div>
      </div>
      
      {/* Right side expand/collapse button */}
      <div className="absolute right-3 top-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-6 w-6 p-0 hover:bg-gray-300"
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-600" />
          )}
        </Button>
      </div>

      {/* Status indicator */}
      <div className="absolute right-3 bottom-3 flex items-center space-x-1">
        {getStatusIcon()}
        <span className="text-xs text-gray-600">{getStatusText()}</span>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="space-y-2 text-sm">
            {formData.batchNumber && (
              <div className="flex justify-between">
                <span className="text-gray-600">Batch:</span>
                <span className="font-medium">{formData.batchNumber}</span>
              </div>
            )}
            {formData.storageLocation && (
              <div className="flex justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium">{formData.storageLocation}</span>
              </div>
            )}
            {formData.productType && (
              <div className="flex justify-between">
                <span className="text-gray-600">Product:</span>
                <span className="font-medium">{formData.productType}</span>
              </div>
            )}
            {formData.crateId && (
              <div className="flex justify-between">
                <span className="text-gray-600">Crate ID:</span>
                <span className="font-medium">{formData.crateId}</span>
              </div>
            )}
            {formData.jarCount && (
              <div className="flex justify-between">
                <span className="text-gray-600">Jar Count:</span>
                <span className="font-medium">{formData.jarCount}</span>
              </div>
            )}
            {formData.jobBoxNumber && (
              <div className="flex justify-between">
                <span className="text-gray-600">Job Box:</span>
                <span className="font-medium">{formData.jobBoxNumber}</span>
              </div>
            )}
            {formData.summary && (
              <div className="pt-2 border-t border-gray-100">
                <div className="text-gray-600">Summary:</div>
                <div className="text-gray-800 mt-1">{formData.summary}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
