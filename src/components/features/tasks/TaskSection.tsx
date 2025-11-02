"use client"

import { ChevronDown, Plus } from 'lucide-react'
import { TaskRow } from './TaskRow'
import type { Task } from './TaskRow'

interface TaskSectionProps {
  title: string
  count: string
  color: 'yellow' | 'purple'
  tasks: Task[]
}

export function TaskSection({ title, count, color, tasks }: TaskSectionProps) {
  const colorClasses = {
    yellow: 'bg-yellow-100 text-yellow-800',
    purple: 'bg-purple-100 text-purple-800',
  }

  return (
    <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div className="flex items-center space-x-2 mb-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
        <ChevronDown className="w-5 h-5 text-gray-500" />
        <div
          className={`px-2.5 py-0.5 rounded-md text-sm font-medium ${colorClasses[color]}`}
        >
          {title}
        </div>
        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
          {count}
        </span>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3"
            >
              Task
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Description
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Assignee
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Due Date
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Priority
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Progress
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
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

