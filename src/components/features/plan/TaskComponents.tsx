"use client"

import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  GripVertical,
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
  ChevronRight,
  MoreHorizontal,
  List,
  Calendar,
  Layout,
  CheckSquare,
  MessageSquare,
  Search,
  Filter,
  Share2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Task {
  id: string
  name: string
  type: 'section' | 'task' | 'subtask' | 'page' | 'chat'
  count?: number
  description?: string
  assignees: Array<{ initials: string; color: string; title: string }>
  dueDate?: string
  priority?: 'Urgent' | 'Normal' | 'Low'
  progress: number
  createdBy: string
  checked?: boolean
  subTasks?: Task[]
}

interface TaskRowProps {
  task: Task
  level?: number
  isLast?: boolean
}

interface TaskSectionProps {
  title: string
  count: string
  color: 'yellow' | 'purple'
  tasks: Task[]
}

interface TabItemProps {
  icon: ReactNode
  label: string
  active?: boolean
}

interface AvatarProps {
  initials: string
  color?: string
  size?: string
}

interface AssigneeAvatarProps {
  initials: string
  color?: string
  title?: string
}

interface PriorityLabelProps {
  label: string
  color: 'red' | 'blue' | 'green' | 'gray'
}

interface ProgressBarProps {
  progress: number
}

const TabItem = ({ icon, label, active = false }: TabItemProps) => {
  return (
    <button
      className={cn(
        'flex items-center space-x-2 px-4 py-3 text-sm font-medium',
        active
          ? 'text-blue-600 border-b-2 border-blue-600'
          : 'text-gray-500 hover:text-gray-700'
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

const Avatar = ({ initials, color = 'bg-gray-500', size = '8' }: AvatarProps) => {
  const sizeClasses: Record<string, string> = {
    '6': 'w-6 h-6',
    '8': 'w-8 h-8',
  }
  return (
    <div
      className={cn(
        sizeClasses[size] || sizeClasses['8'],
        color,
        'rounded-full flex items-center justify-center text-white text-xs font-medium ring-2 ring-white'
      )}
    >
      {initials}
    </div>
  )
}

const AssigneeAvatar = ({ initials, color = 'bg-gray-500', title }: AssigneeAvatarProps) => (
  <div
    title={title}
    className={cn(
      'w-6 h-6',
      color,
      'rounded-full flex items-center justify-center text-white text-xs font-medium ring-2 ring-white -ml-1'
    )}
  >
    {initials}
  </div>
)

const PriorityLabel = ({ label, color }: PriorityLabelProps) => {
  const colors = {
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    gray: 'bg-gray-100 text-gray-700',
  }

  const dotColors = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    gray: 'bg-gray-500',
  }

  return (
    <div className={cn('flex items-center space-x-1 px-2.5 py-0.5 rounded-md', colors[color])}>
      <div className={cn('w-2 h-2 rounded-full', dotColors[color])}></div>
      <span className="text-xs font-medium">{label}</span>
    </div>
  )
}

const ProgressBar = ({ progress }: ProgressBarProps) => (
  <div className="w-full bg-gray-200 rounded-full h-1.5">
    <div
      className="bg-blue-600 h-1.5 rounded-full transition-all"
      style={{ width: `${progress}%` }}
    ></div>
  </div>
)

export const TaskRow = ({ task, level = 0, isLast = false }: TaskRowProps) => {
  const priorityMap = {
    Urgent: { label: 'Urgent', color: 'red' as const },
    Normal: { label: 'Normal', color: 'blue' as const },
    Low: { label: 'Low', color: 'gray' as const },
  }

  const getIcon = () => {
    if (task.type === 'section') return <List className="w-4 h-4 text-gray-400" />
    if (task.type === 'task') return <CheckSquare className="w-4 h-4 text-gray-400" />
    if (task.type === 'subtask') return <CheckSquare className="w-4 h-4 text-gray-400" />
    if (task.type === 'page') return <File className="w-4 h-4 text-gray-400" />
    if (task.type === 'chat') return <MessageSquare className="w-4 h-4 text-gray-400" />
    return <CheckSquare className="w-4 h-4 text-gray-400" />
  }

  const [isChecked, setIsChecked] = useState(task.checked || false)

  return (
    <>
      <tr className="border-b border-gray-200 hover:bg-gray-50 relative">
        <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap relative">
          {level > 0 && (
            <div
              className="absolute top-0"
              style={{
                left: `${(level - 1) * 24 + 16 + 8}px`,
                height: '100%',
                zIndex: 0,
              }}
            >
              <div
                className="absolute top-0 left-0 w-px"
                style={{
                  height: isLast ? 'calc(50% + 1px)' : '100%',
                  borderLeft: '1px dotted #cbd5e1',
                }}
              ></div>
              <div
                className="absolute top-1/2 left-0 h-px"
                style={{
                  width: '17px',
                  borderTop: '1px dotted #cbd5e1',
                }}
              ></div>
            </div>
          )}

          <div className="flex items-center space-x-2 relative z-10" style={{ paddingLeft: `${level * 24}px` }}>
            {task.subTasks ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <div className="w-4 h-4"></div>
            )}

            <GripVertical className="w-4 h-4 text-gray-300 cursor-move" />
            <input
              type="checkbox"
              className="rounded-sm border-gray-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
              checked={isChecked}
              onChange={() => setIsChecked(!isChecked)}
            />
            {getIcon()}
            <span className="font-medium text-gray-800">{task.name}</span>
            {task.count && (
              <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
                {task.count}
              </span>
            )}
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{task.description || '-'}</td>
        <td className="px-4 py-3">
          <div className="flex items-center">
            {task.assignees.map((a, i) => (
              <AssigneeAvatar key={i} {...a} />
            ))}
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{task.dueDate || '-'}</td>
        <td className="px-4 py-3">
          {task.priority && <PriorityLabel {...priorityMap[task.priority]} />}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 w-8 text-right">{task.progress}%</span>
            <ProgressBar progress={task.progress} />
          </div>
        </td>
        <td className="px-4 py-3">
          <Avatar initials={task.createdBy} color="bg-yellow-500" size="6" />
        </td>
        <td className="px-4 py-3 text-right">
          <button className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </td>
      </tr>
      {task.subTasks &&
        task.subTasks.map((subTask, index) => (
          <TaskRow
            key={subTask.id}
            task={subTask}
            level={level + 1}
            isLast={index === task.subTasks!.length - 1}
          />
        ))}
    </>
  )
}

export const TaskSection = ({ title, count, color, tasks }: TaskSectionProps) => {
  const colorClasses = {
    yellow: 'bg-yellow-100 text-yellow-800',
    purple: 'bg-purple-100 text-purple-800',
  }

  return (
    <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div className="flex items-center space-x-2 mb-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
        <ChevronDown className="w-5 h-5 text-gray-500" />
        <div className={cn('px-2.5 py-0.5 rounded-md text-sm font-medium', colorClasses[color])}>
          {title}
        </div>
        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
          {count}
        </span>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
              Task
            </th>
            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Assignee
            </th>
            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Due Date
            </th>
            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Priority
            </th>
            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Progress
            </th>
            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created by
            </th>
            <th scope="col" className="relative px-4 py-2">
              <span className="sr-only">More</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tasks.map((task, index) => (
            <TaskRow key={task.id} task={task} isLast={index === tasks.length - 1} />
          ))}
        </tbody>
      </table>
      <a
        href="#"
        className="ml-8 mt-2 flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700 w-max py-2"
      >
        <Plus className="w-4 h-4" />
        <span>Add task</span>
      </a>
    </div>
  )
}
