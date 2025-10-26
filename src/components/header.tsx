"use client"

import { Button } from "@/components/ui/button"
import { 
  ChevronDown, 
  HelpCircle, 
  Settings,
  Zap
} from "lucide-react"

interface HeaderProps {
  onBackToHome: () => void
}

export function Header({ onBackToHome }: HeaderProps) {
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Left side */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <h1 className="text-lg font-semibold text-gray-900">Production Tracking</h1>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-3">
        <Button 
          variant="outline" 
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 text-white border-purple-600"
        >
          <Zap className="w-4 h-4 mr-2" />
          Upgrade for free
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          className="text-gray-500 hover:text-gray-700"
        >
          <HelpCircle className="w-4 h-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          className="text-gray-500 hover:text-gray-700"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

