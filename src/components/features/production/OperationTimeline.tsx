"use client"

import { Factory, Warehouse, Tag, Package, Truck } from 'lucide-react'
import type { OperationHistory, OperationEvent, OperationStage } from '@/types/operation-history'
import { getStageDuration } from '@/data/mock-operation-history'

interface OperationTimelineProps {
  history: OperationHistory
}

const STAGE_CONFIG: Record<OperationStage, { icon: typeof Factory; color: string }> = {
  cooking: { icon: Factory, color: 'text-orange-600' },
  storage: { icon: Warehouse, color: 'text-blue-600' },
  labeling: { icon: Tag, color: 'text-green-600' },
  packing: { icon: Package, color: 'text-purple-600' },
  shipping: { icon: Truck, color: 'text-red-600' },
}

/**
 * A single entry in the timeline with time chip and content
 */
function TimelineEntry({ 
  time, 
  event, 
  nextEvent 
}: { 
  time: string; 
  event: OperationEvent; 
  nextEvent?: OperationEvent 
}) {
  const config = STAGE_CONFIG[event.stage]
  const Icon = config.icon
  const duration = nextEvent 
    ? getStageDuration([event, nextEvent], event.stage, nextEvent.stage)
    : null

  return (
    <div className="relative pl-20">
      {/* Timestamp Chip: Positioned over the timeline line */}
      <div className="absolute left-8 top-0 -translate-x-1/2 z-10">
        <span className="text-xs text-neutral-400 font-normal px-3 py-1 border-2 border-dotted border-neutral-300 rounded-full bg-white whitespace-nowrap">
          {time}
        </span>
      </div>
      
      {/* Content */}
      <div className="pt-0.5">
        <div className="space-y-3">
          {/* Stage Header with Icon */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
              <Icon className={`w-4 h-4 ${config.color}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-neutral-800 capitalize">{event.stage}</h3>
              <p className="text-xs text-neutral-500">{event.operator}</p>
            </div>
          </div>

          {/* Details Card */}
          <div className="ml-11">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              {/* Quick Info */}
              <div className="flex items-center gap-4 mb-3 text-xs">
                {event.location && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-neutral-400">Location:</span>
                    <span className="font-medium text-neutral-700">{event.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <span className="text-neutral-400">Quantity:</span>
                  <span className="font-medium text-neutral-700">{event.quantity} units</span>
                </div>
              </div>

              {/* Notes */}
              {event.notes && (
                <p className="text-sm text-gray-700 leading-relaxed">
                  {event.notes}
                </p>
              )}

              {/* Duration Tag */}
              {duration && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs font-semibold px-2.5 py-0.5 bg-neutral-800 text-white rounded-full">
                    {duration}
                  </span>
                  <span className="text-xs text-neutral-400">to next stage</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function OperationTimeline({ history }: OperationTimelineProps) {
  const currentStage = history.events[history.events.length - 1]?.stage || 'storage'
  const totalEvents = history.events.length
  
  return (
    <div className="bg-neutral-100 rounded-3xl shadow-lg overflow-visible">
      {/* Header Section */}
      <header className="p-6 pb-4 rounded-t-3xl">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-neutral-500 font-medium">
              Batch {history.batchId}
            </p>
            <h1 className="text-3xl font-bold text-neutral-800 font-mono tracking-wide">
              {history.productName}
            </h1>
            <p className="text-sm text-neutral-600 mt-1">{history.size}</p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border-2 border-dotted border-neutral-300">
              <div className={`w-2 h-2 rounded-full ${
                currentStage === 'shipping' ? 'bg-green-500' : 'bg-blue-500'
              } animate-pulse`} />
              <span className="text-xs font-medium text-neutral-700 capitalize">
                {currentStage === 'shipping' ? 'Shipped' : currentStage}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1.5">{totalEvents}/5 stages</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-neutral-800 transition-all duration-500"
              style={{ width: `${(totalEvents / 5) * 100}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Content Card with all corners rounded */}
      <main className="bg-white rounded-3xl p-6">
        <div className="relative">
          {/* Dotted Timeline: Positioned at left-8 */}
          <div className="absolute left-8 top-0 bottom-0 w-0 border-l-2 border-dotted border-neutral-300" />
          
          {/* Timeline Entries Container */}
          <div className="space-y-8">
            {history.events.map((event, index) => (
              <TimelineEntry
                key={event.id}
                time={event.timestamp.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                }).toUpperCase()}
                event={event}
                nextEvent={history.events[index + 1]}
              />
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 pt-6 border-t-2 border-dotted border-neutral-200">
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="text-neutral-400">Started:</span>
              <span className="ml-2 font-medium text-neutral-700">
                {history.events[0]?.timestamp.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
            {history.events.length > 1 && (
              <div>
                <span className="text-neutral-400">Last Updated:</span>
                <span className="ml-2 font-medium text-neutral-700">
                  {history.events[history.events.length - 1]?.timestamp.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

