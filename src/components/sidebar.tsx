"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Plus, 
  Search, 
  BookOpen, 
  FolderOpen, 
  MessageSquare,
  User,
  Settings
} from "lucide-react"

interface SidebarProps {
  onNewChat: () => void
  onSelectChat: (chatId: string) => void
}

export function Sidebar({ onNewChat, onSelectChat }: SidebarProps) {
  const chatHistory = [
    { id: "1", title: "Production Report", preview: "Generated daily production..." },
    { id: "2", title: "Inventory Check", preview: "Checked warehouse stock..." },
    { id: "3", title: "Quality Control", preview: "Quality inspection results..." },
  ]

  return (
    <div className="w-64 h-screen bg-gray-50 border-r border-gray-200 flex flex-col fixed left-0 top-0 z-40">
      {/* Top Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">MH</span>
          </div>
          <div className="text-sm font-medium">Magic Healer</div>
        </div>
        
        <Button 
          onClick={onNewChat}
          className="w-full justify-start bg-white hover:bg-gray-100 text-gray-700 border border-gray-200"
          variant="outline"
        >
          <Plus className="w-4 h-4 mr-2" />
          New chat
        </Button>
      </div>

      {/* Navigation */}
      <div className="p-4 space-y-2">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-gray-600 hover:bg-gray-100"
        >
          <Search className="w-4 h-4 mr-2" />
          Search chats
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-gray-600 hover:bg-gray-100"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Library
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-gray-600 hover:bg-gray-100"
        >
          <FolderOpen className="w-4 h-4 mr-2" />
          Projects
        </Button>
      </div>

      {/* Chat History */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Recent Chats
        </div>
        <div className="space-y-2">
          {chatHistory.map((chat) => (
            <Card 
              key={chat.id}
              className="p-3 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => onSelectChat(chat.id)}
            >
              <div className="flex items-start space-x-2">
                <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {chat.title}
                  </div>
                  <div className="text-xs text-gray-500 truncate mt-1">
                    {chat.preview}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900">Worker</div>
            <div className="text-xs text-gray-500">Production Staff</div>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full bg-white hover:bg-gray-100 text-gray-700"
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  )
}
