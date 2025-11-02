"use client"

import {
  ChevronRight,
  MoreHorizontal,
  Search,
  Filter,
  Share2,
  Plus,
  List,
  Calendar,
  LayoutGrid,
  LayoutDashboard,
} from 'lucide-react'
import { Avatar } from './Avatar'

interface TabItemProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick?: () => void
}

function TabItem({ icon, label, active = false, onClick }: TabItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
        active
          ? 'text-blue-600 border-b-2 border-blue-600'
          : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

interface DashboardHeaderProps {
  projectName?: string
  activeTab?: 'spreadsheet' | 'timeline' | 'calendar' | 'board'
  onTabChange?: (tab: 'spreadsheet' | 'timeline' | 'calendar' | 'board') => void
  onChatToggle?: () => void
}

export function DashboardHeader({
  projectName = 'Adrian Bert - CRM Dashboard',
  activeTab = 'spreadsheet',
  onTabChange,
  onChatToggle,
}: DashboardHeaderProps) {
  return null // Remove entire header
}

