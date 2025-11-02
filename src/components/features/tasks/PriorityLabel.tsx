"use client"

interface PriorityLabelProps {
  label: string
  color: 'red' | 'blue' | 'green' | 'gray'
}

export function PriorityLabel({ label, color }: PriorityLabelProps) {
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
    <div
      className={`flex items-center space-x-1 px-2.5 py-0.5 rounded-md ${colors[color]}`}
    >
      <div className={`w-2 h-2 rounded-full ${dotColors[color]}`} />
      <span className="text-xs font-medium">{label}</span>
    </div>
  )
}

