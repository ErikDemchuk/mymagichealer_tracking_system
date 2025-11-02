"use client"

import { ChevronRight, MoreHorizontal, Search, Filter, Share2, Plus, List, Calendar, Layout, LayoutDashboard } from 'lucide-react'

interface AvatarProps {
  initials: string
  color: string
}

const Avatar = ({ initials, color }: AvatarProps) => (
  <div className={`w-8 h-8 ${color} rounded-full flex items-center justify-center text-white text-xs font-medium ring-2 ring-white`}>
    {initials}
  </div>
)

interface TabItemProps {
  icon: React.ReactNode
  label: string
  active?: boolean
}

const TabItem = ({ icon, label, active = false }: TabItemProps) => {
  return (
    <button
      className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium ${
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

export function PlanHeader() {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-gray-500">Projects</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 font-medium">Adrian Bert - CRM Dashboard</span>
          <MoreHorizontal className="w-5 h-5 text-gray-400 cursor-pointer" />
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search task..."
              className="pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
          <div className="flex -space-x-2">
            <Avatar initials="DR" color="bg-pink-500" />
            <Avatar initials="S" color="bg-blue-500" />
            <Avatar initials="A" color="bg-purple-500" />
          </div>
          <button className="p-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="px-6 flex items-center space-x-1 border-b border-gray-200">
        <TabItem icon={<List className="w-5 h-5" />} label="Spreadsheet" active />
        <TabItem icon={<Calendar className="w-5 h-5" />} label="Timeline" />
        <TabItem icon={<Layout className="w-5 h-5" />} label="Calendar" />
        <TabItem icon={<LayoutDashboard className="w-5 h-5" />} label="Board" />
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-md">
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
