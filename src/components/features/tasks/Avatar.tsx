"use client"

interface AvatarProps {
  initials: string
  color?: string
  size?: '6' | '8'
  title?: string
}

export function Avatar({ initials, color = 'bg-gray-500', size = '8', title }: AvatarProps) {
  const sizeClasses = {
    '6': 'w-6 h-6 text-xs',
    '8': 'w-8 h-8 text-sm',
  }

  return (
    <div
      title={title}
      className={`${sizeClasses[size]} ${color} rounded-full flex items-center justify-center text-white font-medium ring-2 ring-white -ml-1`}
    >
      {initials}
    </div>
  )
}

