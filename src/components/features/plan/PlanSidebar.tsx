"use client"

import {
  LayoutDashboard,
  Inbox,
  Users,
  File,
  Star,
  Folder,
  Plus,
  Settings,
  HelpCircle,
  ChevronDown,
  MoreHorizontal,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export function PlanSidebar() {
  return (
    <div className="w-[260px] bg-[#1A1D21] text-gray-300 h-screen flex flex-col fixed">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-md bg-purple-600 flex items-center justify-center text-white font-bold">
            A
          </div>
          <span className="text-white font-semibold text-lg">AutomatePro</span>
        </div>
      </div>

      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center text-white font-bold">
              K
            </div>
            <span className="text-white font-medium">Keiloto Studio</span>
          </div>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <Link
          href="/plan"
          className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-700 hover:text-white"
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </Link>
        <Link
          href="#"
          className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-700 hover:text-white"
        >
          <Inbox className="w-5 h-5" />
          <span>Inbox</span>
        </Link>
        <Link
          href="#"
          className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-700 hover:text-white"
        >
          <Users className="w-5 h-5" />
          <span>Teams</span>
        </Link>
        <Link
          href="#"
          className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-700 hover:text-white"
        >
          <File className="w-5 h-5" />
          <span>Assigned to me</span>
        </Link>
        <Link
          href="#"
          className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-700 hover:text-white"
        >
          <Star className="w-5 h-5" />
          <span>Created by me</span>
        </Link>

        <div className="pt-4">
          <div className="flex items-center justify-between text-gray-400 px-3">
            <span className="text-xs font-semibold uppercase">Favorites</span>
            <Plus className="w-4 h-4 cursor-pointer" />
          </div>
        </div>

        <div className="pt-4">
          <div className="flex items-center justify-between text-gray-400 px-3 mb-2">
            <span className="text-xs font-semibold uppercase">Projects</span>
            <Plus className="w-4 h-4 cursor-pointer" />
          </div>
          <Link
            href="/plan"
            className="flex items-center space-x-3 px-3 py-2 rounded-md bg-gray-700 text-white"
          >
            <Folder className="w-5 h-5" />
            <span>Adrian Bert - CRM Da...</span>
            <MoreHorizontal className="w-4 h-4 ml-auto" />
          </Link>
          <Link
            href="#"
            className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-700 hover:text-white"
          >
            <Folder className="w-5 h-5" />
            <span>Trust - SaaS Dashbo...</span>
          </Link>
          <Link
            href="#"
            className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-700 hover:text-white"
          >
            <Folder className="w-5 h-5" />
            <span>Pertamina Project</span>
          </Link>
          <Link
            href="#"
            className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-700 hover:text-white"
          >
            <Folder className="w-5 h-5" />
            <span>Garuda Project</span>
          </Link>
          <Link
            href="#"
            className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-400 hover:text-white"
          >
            <Plus className="w-5 h-5" />
            <span>New</span>
          </Link>
        </div>
      </nav>

      <div className="p-4 border-t border-gray-700 space-y-2">
        <Link
          href="#"
          className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-700 hover:text-white"
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Link>
        <Link
          href="#"
          className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-700 hover:text-white"
        >
          <HelpCircle className="w-5 h-5" />
          <span>Help Center</span>
        </Link>
        <div className="flex items-center space-x-3 pt-2">
          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white font-medium text-sm">
            DR
          </div>
          <div>
            <div className="text-white text-sm font-medium">Darlene Robertson</div>
            <div className="text-gray-400 text-xs">darktime@gmail.com</div>
          </div>
        </div>
      </div>
    </div>
  )
}



