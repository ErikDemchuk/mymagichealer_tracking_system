"use client"

import { useState, useEffect } from "react"
import { ChefHat, Package, CheckCircle, Wrench, BarChart3 } from "lucide-react"

interface SlashCommand {
  id: string
  command: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

interface SlashCommandPopupProps {
  isOpen: boolean
  onClose: () => void
  onSelectCommand: (command: string) => void
  inputValue: string
}

const slashCommands: SlashCommand[] = [
  {
    id: "cook",
    command: "/cook",
    title: "Cook Action",
    description: "App - Production Tracking - Track cooking and food preparation activities",
    icon: ChefHat
  },
  {
    id: "production",
    command: "/production",
    title: "Production Tracking",
    description: "App - Production Tracking - Monitor production metrics and batch progress",
    icon: BarChart3
  },
  {
    id: "inventory",
    command: "/inventory",
    title: "Inventory Management",
    description: "App - Production Tracking - Track stock levels and warehouse operations",
    icon: Package
  },
  {
    id: "quality",
    command: "/quality",
    title: "Quality Control",
    description: "App - Production Tracking - Ensure product quality with systematic checks",
    icon: CheckCircle
  },
  {
    id: "maintenance",
    command: "/maintenance",
    title: "Equipment Maintenance",
    description: "App - Production Tracking - Schedule and track equipment maintenance",
    icon: Wrench
  }
]

export function SlashCommandPopup({ isOpen, onClose, onSelectCommand, inputValue }: SlashCommandPopupProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Filter commands based on input
  const filteredCommands = slashCommands.filter(cmd => 
    cmd.command.toLowerCase().includes(inputValue.toLowerCase()) ||
    cmd.title.toLowerCase().includes(inputValue.toLowerCase())
  )

  // Reset selection when commands change
  useEffect(() => {
    setSelectedIndex(0)
  }, [filteredCommands])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          )
          break
        case "ArrowUp":
          e.preventDefault()
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          )
          break
        case "Enter":
          e.preventDefault()
          if (filteredCommands[selectedIndex]) {
            onSelectCommand(filteredCommands[selectedIndex].command)
          }
          break
        case "Escape":
          e.preventDefault()
          onClose()
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, selectedIndex, filteredCommands, onSelectCommand, onClose])

  if (!isOpen || filteredCommands.length === 0) return null

  return (
    <div className="absolute bottom-full left-0 mb-2 w-80 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
      <div className="p-2">
        {filteredCommands.map((command, index) => {
          const IconComponent = command.icon
          return (
            <div
              key={command.id}
              className={`flex items-center p-2 rounded cursor-pointer transition-colors ${
                index === selectedIndex 
                  ? "bg-blue-600 text-white" 
                  : "hover:bg-gray-700 text-gray-200"
              }`}
              onClick={() => onSelectCommand(command.command)}
            >
              <div className="flex-shrink-0 mr-3">
                <IconComponent className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {command.command}
                </div>
                <div className="text-xs opacity-75 truncate">
                  {command.description}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
