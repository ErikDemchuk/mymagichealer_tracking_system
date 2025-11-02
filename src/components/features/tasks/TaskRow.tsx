"use client"

import { useState } from 'react'
import {
  GripVertical,
  ChevronDown,
  List,
  CheckSquare2,
  File,
  MessageSquare,
  MoreHorizontal,
} from 'lucide-react'
import { Avatar } from './Avatar'
import { PriorityLabel } from './PriorityLabel'
import { ProgressBar } from './ProgressBar'

export interface Assignee {
  initials: string
  color: string
  title: string
}

export interface Task {
  id: string
  name: string
  type: 'section' | 'task' | 'subtask' | 'page' | 'chat'
  count?: number
  description?: string
  assignees: Assignee[]
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

export function TaskRow({ task, level = 0, isLast = false }: TaskRowProps) {
  const [isChecked, setIsChecked] = useState(task.checked || false)

  const priorityMap = {
    Urgent: { label: 'Urgent', color: 'red' },
    Normal: { label: 'Normal', color: 'blue' },
    Low: { label: 'Low', color: 'gray' },
  }

  const getIcon = () => {
    switch (task.type) {
      case 'section':
        return <List className="w-4 h-4 text-gray-400" />
      case 'task':
      case 'subtask':
        return <CheckSquare2 className="w-4 h-4 text-gray-400" />
      case 'page':
        return <File className="w-4 h-4 text-gray-400" />
      case 'chat':
        return <MessageSquare className="w-4 h-4 text-gray-400" />
      default:
        return <CheckSquare2 className="w-4 h-4 text-gray-400" />
    }
  }

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
              />
              <div
                className="absolute top-1/2 left-0 h-px"
                style={{
                  width: '17px',
                  borderTop: '1px dotted #cbd5e1',
                }}
              />
            </div>
          )}
          <div
            className="flex items-center space-x-2 relative z-10"
            style={{ paddingLeft: `${level * 24}px` }}
          >
            {task.subTasks ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <div className="w-4 h-4" />
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
        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
          {task.description || '-'}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center">
            {task.assignees.map((a, i) => (
              <Avatar key={i} initials={a.initials} color={a.color} title={a.title} />
            ))}
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
          {task.dueDate || '-'}
        </td>
        <td className="px-4 py-3">
          {task.priority && (
            <PriorityLabel
              label={priorityMap[task.priority].label}
              color={priorityMap[task.priority].color}
            />
          )}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 w-8 text-right">
              {task.progress}%
            </span>
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

