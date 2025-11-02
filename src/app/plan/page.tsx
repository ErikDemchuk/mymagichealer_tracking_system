"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PlanSidebar } from '@/components/features/plan/PlanSidebar'
import { PlanHeader } from '@/components/features/plan/PlanHeader'
import { TaskSection, type Task } from '@/components/features/plan/TaskComponents'
import { LoginModal } from '@/components/login-modal'

export default function PlanPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [showLoginModal, setShowLoginModal] = useState(false)

  // Mock data
  const readyToCheckTasks: Task[] = [
    {
      id: '3',
      name: 'Wireframing',
      type: 'section',
      count: 3,
      assignees: [{ initials: 'A', color: 'bg-purple-500', title: 'Alex' }],
      progress: 95,
      createdBy: 'DR',
      subTasks: [
        {
          id: '31',
          name: 'Onboarding',
          type: 'task',
          checked: true,
          count: 2,
          description: '-',
          assignees: [
            { initials: 'DR', color: 'bg-pink-500', title: 'Darlene' },
            { initials: 'S', color: 'bg-blue-500', title: 'Steve' },
          ],
          dueDate: 'February 8, 2024',
          priority: 'Urgent',
          progress: 100,
          createdBy: 'DR',
        },
        {
          id: '32',
          name: 'Login Screen',
          type: 'task',
          checked: true,
          description: '-',
          assignees: [
            { initials: 'A', color: 'bg-purple-500', title: 'Alex' },
            { initials: 'DR', color: 'bg-pink-500', title: 'Darlene' },
          ],
          dueDate: 'February 8, 2024',
          priority: 'Urgent',
          progress: 95,
          createdBy: 'DR',
        },
        {
          id: '33',
          name: 'Sign Up Screen',
          type: 'task',
          checked: true,
          count: 1,
          description: '-',
          assignees: [{ initials: 'S', color: 'bg-blue-500', title: 'Steve' }],
          dueDate: 'February 8, 2024',
          priority: 'Normal',
          progress: 95,
          createdBy: 'DR',
        },
      ],
    },
    {
      id: '4',
      name: 'Hi-Fi Design',
      type: 'section',
      count: 3,
      assignees: [{ initials: 'DR', color: 'bg-pink-500', title: 'Darlene' }],
      progress: 100,
      createdBy: 'DR',
      subTasks: [
        {
          id: '41',
          name: 'Onboarding',
          type: 'task',
          checked: true,
          count: 2,
          description: 'Create hi-fi a design Onboarding step by step.',
          assignees: [
            { initials: 'DR', color: 'bg-pink-500', title: 'Darlene' },
            { initials: 'S', color: 'bg-blue-500', title: 'Steve' },
          ],
          dueDate: 'February 9, 2024',
          priority: 'Low',
          progress: 100,
          createdBy: 'DR',
        },
        {
          id: '42',
          name: 'Login Screen',
          type: 'task',
          checked: true,
          description: 'Create hi-fi a design a login screen step by step.',
          assignees: [
            { initials: 'A', color: 'bg-purple-500', title: 'Alex' },
            { initials: 'DR', color: 'bg-pink-500', title: 'Darlene' },
          ],
          dueDate: 'February 9, 2024',
          priority: 'Low',
          progress: 100,
          createdBy: 'DR',
        },
        {
          id: '43',
          name: 'Sign Up Screen',
          type: 'task',
          checked: true,
          count: 1,
          description: 'Create hi-fi a design a sign up screen step by step.',
          assignees: [
            { initials: 'S', color: 'bg-blue-500', title: 'Steve' },
            { initials: 'DR', color: 'bg-pink-500', title: 'Darlene' },
          ],
          dueDate: 'February 9, 2024',
          priority: 'Low',
          progress: 100,
          createdBy: 'DR',
        },
      ],
    },
  ]

  // Check authentication
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

  const handleLogin = () => {
    setShowLoginModal(false)
  }

  const handleCloseModal = () => {
    if (!isAuthenticated) {
      router.push('/')
    } else {
      setShowLoginModal(false)
    }
  }

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
    <div className="flex h-screen font-sans antialiased bg-white">
      <PlanSidebar />
      <div className="flex-1 flex flex-col ml-[260px]">
        <PlanHeader />
        <main className="flex-1 overflow-y-auto px-6 bg-white min-h-screen pt-4">
          <TaskSection
            title="Ready to check by PM"
            count="2"
            color="purple"
            tasks={readyToCheckTasks}
          />
        </main>
      </div>
      <LoginModal
        isOpen={showLoginModal}
        onClose={handleCloseModal}
        onLogin={handleLogin}
      />
    </div>
  )
}
