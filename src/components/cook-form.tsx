"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/modal"
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
}

export function CookForm({ isOpen, onClose, onSubmit }: CookFormProps) {
  const [batchNumber, setBatchNumber] = useState("")
  const [storageLocation, setStorageLocation] = useState("")
  const [productType, setProductType] = useState("")
  const [crateId, setCrateId] = useState("")
  const [jarCount, setJarCount] = useState("")
  const [jobBoxNumber, setJobBoxNumber] = useState("")
  const [summary, setSummary] = useState("")

  const storageLocations = [
    "B-1", "B-2", "B-3", "B-4", "B-5", "B-6", "B-7", "B-8", "B-9", "B-10", "B-11", "B-12"
  ]

  const productTypes = [
    "1oz", "2oz", "4oz"
  ]

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
      user: "Erik Demchuk", // Hardcoded for now
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
    <Modal isOpen={isOpen} onClose={onClose} title="Cook Action">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Batch Number */}
        <div>
          <label htmlFor="batchNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Batch Number
          </label>
          <Input
            id="batchNumber"
            type="text"
            value={batchNumber}
            onChange={(e) => setBatchNumber(e.target.value)}
            placeholder="e.g. C-32"
            required
          />
        </div>

        {/* Storage Location */}
        <div>
          <label htmlFor="storageLocation" className="block text-sm font-medium text-gray-700 mb-1">
            Storage Location
          </label>
          <select
            id="storageLocation"
            value={storageLocation}
            onChange={(e) => setStorageLocation(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
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
        <div>
          <label htmlFor="productType" className="block text-sm font-medium text-gray-700 mb-1">
            Product Type
          </label>
          <select
            id="productType"
            value={productType}
            onChange={(e) => setProductType(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
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
        <div>
          <label htmlFor="crateId" className="block text-sm font-medium text-gray-700 mb-1">
            Crate ID
          </label>
          <Input
            id="crateId"
            type="text"
            value={crateId}
            onChange={(e) => setCrateId(e.target.value)}
            placeholder="e.g. 12345"
            required
          />
        </div>

        {/* Jar Count */}
        <div>
          <label htmlFor="jarCount" className="block text-sm font-medium text-gray-700 mb-1">
            Jar Count
          </label>
          <Input
            id="jarCount"
            type="number"
            value={jarCount}
            onChange={(e) => setJarCount(e.target.value)}
            placeholder="e.g. 50"
            required
          />
        </div>

        {/* Job/Box Number */}
        <div>
          <label htmlFor="jobBoxNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Job/Box Number
          </label>
          <Input
            id="jobBoxNumber"
            type="text"
            value={jobBoxNumber}
            onChange={(e) => setJobBoxNumber(e.target.value)}
            placeholder="Optional - e.g., JOB-001"
          />
        </div>

        {/* Summary */}
        <div>
          <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
            Summary
          </label>
          <textarea
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Enter a short summary of the cooking action"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90">
            Submit
          </Button>
        </div>
      </form>
    </Modal>
  )
}