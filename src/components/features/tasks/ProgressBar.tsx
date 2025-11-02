"use client"

interface ProgressBarProps {
  progress: number
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-1.5">
      <div
        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

