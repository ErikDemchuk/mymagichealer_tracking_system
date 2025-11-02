"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { LoginModal } from "@/components/login-modal"
import { DashboardHeader } from "@/components/features/tasks/DashboardHeader"
import { 
  ProductionTreeTable,
  InlineChat,
  OperationTimelineModal,
  transformInventoryToTree,
  transformInventoryToTreeTable, 
  getTreeStatistics 
} from "@/components/features/production"
import type { ProductionTreeTableNode } from "@/components/features/production"
import { parseChatQuery, generateResponseMessage } from "@/lib/chat-filter-parser"
import { getOperationHistory } from "@/data/mock-operation-history"
import type { OperationHistory } from "@/types/operation-history"
import type { InventoryItem } from "@/types/production"
import {
  createBatch,
  createCrate,
  recordCookingSession,
  updateLocation,
  changeStatus,
  moveCrate,
  removeBatch,
  deleteCrate,
  getAllLocations,
  getAllBatches,
} from "@/lib/production-crud"

// Mock data for testing - converted to state for dynamic updates
const initialInventory: InventoryItem[] = [
  // Location B-1
  { id: "1", location: "B-1", product: "purple", productName: "Universal Flare", crateId: "C-32", itemType: "Unlabeled", batch: "UFC324", units: 200, size: "4oz" },
  { id: "2", location: "B-1", product: "purple", productName: "Universal Flare", crateId: "C-35", itemType: "Labeled", batch: "UFC325", units: 150, size: "4oz" },
  { id: "3", location: "B-1", product: "green", productName: "Thyme & Tea Tree", crateId: "C-40", itemType: "Unlabeled", batch: "UFC326", units: 180, size: "2oz" },
  
  // Location A-2
  { id: "4", location: "A-2", product: "purple", productName: "Universal Flare", crateId: "C-44", itemType: "Labeled", batch: "UFC325", units: 231, size: "2oz" },
  { id: "5", location: "A-2", product: "blue", productName: "Comfrey & Arnica", crateId: "C-48", itemType: "Unlabeled", batch: "UFC327", units: 200, size: "4oz" },
  
  // Location B-4
  { id: "6", location: "B-4", product: "boxes", productName: "Amazon Boxes", crateId: null, itemType: "Amazon_Box", batch: "UFC325", units: 72, size: "4oz" },
  { id: "7", location: "B-4", product: "boxes", productName: "Amazon Boxes", crateId: null, itemType: "Amazon_Box", batch: "UFC326", units: 72, size: "4oz" },
  { id: "8", location: "B-4", product: "boxes", productName: "Amazon Boxes", crateId: null, itemType: "Amazon_Box", batch: "UFC327", units: 72, size: "4oz" },
]

export default function DashboardPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [activeView, setActiveView] = useState<"spreadsheet" | "timeline" | "calendar" | "board">("spreadsheet")
  
  // Inventory state for dynamic updates
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory)
  
  // Inline chat state - always open
  const [showInlineChat, setShowInlineChat] = useState(true)
  const [highlightedIds, setHighlightedIds] = useState<string[]>([])
  const [filteredIds, setFilteredIds] = useState<string[]>([])
  
  // Operation timeline state
  const [showOperationTimeline, setShowOperationTimeline] = useState(false)
  const [selectedOperationHistory, setSelectedOperationHistory] = useState<OperationHistory | null>(null)
  
  // Check authentication first
  useEffect(() => {
    const checkAuth = async () => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      try {
        const response = await fetch('/api/auth/session', {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        })
        clearTimeout(timeoutId)
        
        const data = await response.json()
        
        if (data.authenticated) {
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
          setShowLoginModal(true)
        }
      } catch (error) {
        clearTimeout(timeoutId)
        setIsAuthenticated(false)
        setShowLoginModal(true)
      } finally {
        setIsCheckingAuth(false)
      }
    }
    
    checkAuth()
  }, [])

  const handleNewChat = () => {
    const newChatId = crypto.randomUUID()
    router.push(`/chat?id=${newChatId}`)
  }

  const handleSelectChat = (chatId: string) => {
    router.push(`/chat?id=${chatId}`)
  }

  const handleBackToHome = () => {
    router.push("/")
  }

  const handleLogin = () => {
    setShowLoginModal(false)
  }
  
  const handleCloseModal = () => {
    if (!isAuthenticated) {
      router.push("/")
    } else {
      setShowLoginModal(false)
    }
  }

  // Transform inventory data to tree table structure
  const treeData = transformInventoryToTreeTable(inventory)
  const treeStats = getTreeStatistics(transformInventoryToTree(inventory))

  // State for tree node selection and detail view
  const [selectedNode, setSelectedNode] = useState<ProductionTreeTableNode | null>(null)

  // Handle node click
  const handleNodeClick = (node: ProductionTreeTableNode) => {
    setSelectedNode(node)
  }

  // Handle history button click
  const handleHistoryClick = (batchId: string) => {
    const history = getOperationHistory(batchId)
    if (history) {
      setSelectedOperationHistory(history)
      setShowOperationTimeline(true)
    }
  }

  // Handle chat query with CRUD operations
  const handleChatQuery = async (query: string): Promise<string> => {
    const parsedQuery = parseChatQuery(query)
    
    try {
      // Check if user wants to open operation data
      if (parsedQuery.type === 'operation_data' && parsedQuery.batchForOperation) {
        handleHistoryClick(parsedQuery.batchForOperation)
        return `Opening operation history for batch ${parsedQuery.batchForOperation}...`
      }
      
      // Handle CREATE operations
      if (parsedQuery.type === 'create') {
        let result
        
        switch (parsedQuery.action) {
          case 'add_batch':
            result = createBatch(
              parsedQuery.parameters?.batchId || `UFC${Math.floor(Math.random() * 900) + 100}`,
              parsedQuery.parameters?.product || 'Universal Flare',
              parsedQuery.parameters?.size || '4oz',
              parsedQuery.parameters?.quantity || 200,
              parsedQuery.parameters?.location || 'A-1',
              inventory
            )
            break
            
          case 'add_crate':
            result = createCrate(
              parsedQuery.parameters?.crateId || `C-${Math.floor(Math.random() * 100) + 50}`,
              parsedQuery.parameters?.location || 'A-1',
              parsedQuery.parameters?.product || 'Universal Flare',
              parsedQuery.parameters?.size || '4oz',
              parsedQuery.parameters?.batchId || `UFC${Math.floor(Math.random() * 900) + 100}`,
              parsedQuery.parameters?.quantity || 200,
              inventory
            )
            break
            
          case 'record_cooking':
            result = recordCookingSession(
              parsedQuery.parameters?.product || 'Universal Flare',
              parsedQuery.parameters?.size || '4oz',
              parsedQuery.parameters?.quantity || 200,
              inventory
            )
            break
            
          default:
            return "I'm not sure how to create that. Could you be more specific? Try: 'add new batch UFC330' or 'record cooking session'"
        }
        
        if (result.success) {
          setInventory([...inventory])
          return result.message
        }
        return result.message
      }
      
      // Handle UPDATE operations
      if (parsedQuery.type === 'update') {
        let result
        
        switch (parsedQuery.action) {
          case 'update_location':
          case 'move_crate':
            result = moveCrate(
              parsedQuery.parameters?.crateId || '',
              parsedQuery.parameters?.newLocation || '',
              inventory
            )
            break
            
          case 'change_status':
            result = changeStatus(
              parsedQuery.parameters?.crateId || '',
              (parsedQuery.parameters?.status as 'Labeled' | 'Unlabeled') || 'Labeled',
              inventory
            )
            break
            
          default:
            return "I'm not sure how to update that. Try: 'move crate C-32 to location A-3' or 'change status of C-32 to labeled'"
        }
        
        if (result.success) {
          setInventory([...inventory])
          return result.message
        }
        return result.message
      }
      
      // Handle DELETE operations
      if (parsedQuery.type === 'delete') {
        let result
        
        switch (parsedQuery.action) {
          case 'remove_batch':
            result = removeBatch(
              parsedQuery.parameters?.batchId || '',
              inventory
            )
            break
            
          case 'delete_crate':
            result = deleteCrate(
              parsedQuery.parameters?.crateId || '',
              inventory
            )
            break
            
          default:
            return "I'm not sure what to delete. Try: 'remove batch UFC324' or 'delete crate C-32'"
        }
        
        if (result.success) {
          setInventory([...inventory])
          return result.message
        }
        return result.message
      }
      
      // Handle VIEW operations
      if (parsedQuery.type === 'search' && parsedQuery.action) {
        let result
        
        switch (parsedQuery.action) {
          case 'view_all_locations':
            result = getAllLocations(inventory)
            break
            
          case 'list_batches':
            result = getAllBatches(inventory)
            break
            
          default:
            break
        }
        
        if (result) {
          return result.message
        }
      }
      
      // Otherwise, filter and highlight items
      const matchingIds: string[] = []
      
      // Helper to check if node matches any search term
      const nodeMatchesSearch = (node: ProductionTreeTableNode): boolean => {
        const searchableText = [
          node.label,
          node.data?.crateId,
          node.data?.batch,
          node.data?.location,
          node.data?.productName,
          node.data?.size,
          node.data?.itemType,
        ].filter(Boolean).join(' ').toLowerCase()
        
        return parsedQuery.searchTerms.some(term => 
          searchableText.includes(term.toLowerCase())
        )
      }
      
      // Recursively find matching nodes
      const findMatches = (nodes: ProductionTreeTableNode[]) => {
        nodes.forEach(node => {
          if (nodeMatchesSearch(node)) {
            matchingIds.push(node.id)
          }
          if (node.children) {
            findMatches(node.children)
          }
        })
      }
      
      findMatches(treeData)
      
      setHighlightedIds(matchingIds)
      setFilteredIds(matchingIds)
      
      return generateResponseMessage(parsedQuery, matchingIds.length)
    } catch (error) {
      console.error('Error handling chat query:', error)
      return "I encountered an error processing your request. Please try again."
    }
  }

  // Toggle inline chat
  const handleChatToggle = () => {
    setShowInlineChat(!showInlineChat)
  }

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen gap-0" style={{ backgroundColor: '#F7F7F7' }}>
      {/* Sidebar */}
      <Sidebar 
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        currentChatId={null}
        updateTrigger={0}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Inline Chat - Always Open */}
        <InlineChat
          isOpen={showInlineChat}
          onClose={() => {}}
          onQuery={handleChatQuery}
        />

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
                  {activeView === 'spreadsheet' ? (
                    <>
                      {/* Production TreeView Section */}
                      <div>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Production Tracking</h2>
                  <p className="text-sm text-gray-600">
                    {treeStats.totalLocations} locations • {treeStats.totalContainers} containers • {treeStats.totalJars} jars
                  </p>
                </div>
                
                        <ProductionTreeTable
                          data={treeData}
                          onNodeClick={handleNodeClick}
                          defaultExpandedIds={treeData.map(node => node.id)}
                          className=""
                          highlightedIds={highlightedIds}
                          filteredIds={filteredIds}
                          onHistoryClick={handleHistoryClick}
                        />

                {selectedNode && selectedNode.data?.type === 'container' && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2">Container Details</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Container ID:</span>
                        <span className="ml-2 font-medium">{selectedNode.data.crateId || selectedNode.data.id}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Batch:</span>
                        <span className="ml-2 font-medium">{selectedNode.data.batch}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Jar Count:</span>
                        <span className="ml-2 font-medium">{selectedNode.data.units}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Size:</span>
                        <span className="ml-2 font-medium">{selectedNode.data.size}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Location:</span>
                        <span className="ml-2 font-medium">{selectedNode.data.location}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Product:</span>
                        <span className="ml-2 font-medium">{selectedNode.data.productName}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>{activeView.charAt(0).toUpperCase() + activeView.slice(1)} view coming soon...</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={handleCloseModal}
        onLogin={handleLogin}
      />

      {/* Operation Timeline Modal */}
      <OperationTimelineModal
        isOpen={showOperationTimeline}
        onClose={() => setShowOperationTimeline(false)}
        history={selectedOperationHistory}
      />
    </div>
  )
}

