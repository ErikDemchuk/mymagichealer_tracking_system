"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { 
  ChevronDown, 
  HelpCircle, 
  Settings,
  Zap,
  LogOut
} from "lucide-react"

export interface HeaderProps {
  onBackToHome: () => void
}

export function Header({ onBackToHome }: HeaderProps) {
  const [user, setUser] = useState<any>(null)
  const [showLogoutMenu, setShowLogoutMenu] = useState(false)

  useEffect(() => {
    // Get user from session
    const loadUser = async () => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
      
      try {
        const response = await fetch('/api/auth/session', {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        })
        clearTimeout(timeoutId)
        
        const data = await response.json()
        
        if (data.authenticated && data.user) {
          setUser({
            email: data.user.email,
            user_metadata: {
              full_name: data.user.name
            }
          })
        }
      } catch (error) {
        clearTimeout(timeoutId)
        console.error('Error loading user:', error)
        // Silently fail - header will just not show user info
      }
    }

    loadUser()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      
      // Redirect to home
      window.location.href = '/'
    } catch (error) {
      console.error('Error logging out:', error)
    }
    setShowLogoutMenu(false)
  }

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
        
        {/* User Avatar/Logout */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowLogoutMenu(!showLogoutMenu)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-gray-700">
                  {user.user_metadata?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            </button>
            
            {showLogoutMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{user.user_metadata?.full_name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        )}
        
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

