'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Monitor, Clock, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ScreenTimeGaugeProps {
  usedMinutes: number
  totalMinutes: number
  percentage: number
}

export function ScreenTimeGauge({ usedMinutes, totalMinutes, percentage }: ScreenTimeGaugeProps) {
  const remainingMinutes = Math.max(0, totalMinutes - usedMinutes)
  
  const getGaugeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-error'
    if (percentage >= 70) return 'text-warning'
    return 'text-success'
  }

  const getStatusMessage = (percentage: number) => {
    if (percentage >= 100) return "Time's up! 🕐"
    if (percentage >= 90) return "Almost out of time! ⏰"
    if (percentage >= 70) return "Use wisely! 📱"
    return "Plenty of time left! ✨"
  }

  // Create a simple circular progress indicator
  const circumference = 2 * Math.PI * 45 // radius of 45
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-sky-blue/5 to-sky-blue/10 border-sky-blue/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sky-blue">
          <Monitor className="w-5 h-5" />
          Screen Time Meter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <div className="relative w-32 h-32">
            {/* Background circle */}
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-slate-200"
              />
              {/* Progress circle */}
              <circle
                cx="64"
                cy="64"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className={cn(
                  getGaugeColor(percentage),
                  'transition-all duration-500 ease-out'
                )}
                strokeLinecap="round"
              />
            </svg>
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-black">
                {remainingMinutes}
              </div>
              <div className="text-xs font-medium text-black">
                min left
              </div>
            </div>
          </div>
        </div>

        <div className="text-center space-y-1">
          <div className="text-sm font-medium text-black">
            {getStatusMessage(percentage)}
          </div>
          <div className="text-xs text-black">
            {usedMinutes} of {totalMinutes} minutes used
          </div>
        </div>

        {/* Time breakdown */}
        <div className="bg-white/50 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-black" />
              <span className="text-black">Daily Allowance</span>
            </div>
            <span className="font-medium text-black">{totalMinutes}m</span>
          </div>
          
          {usedMinutes > 0 && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-success" />
                <span className="text-black">Used Today</span>
              </div>
              <span className="font-medium text-black">{usedMinutes}m</span>
            </div>
          )}
          
          {/* Bonus time indicator */}
          <div className="flex items-center justify-between text-sm pt-1 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-warning" />
              <span className="text-black">Earn More</span>
            </div>
            <span className="text-xs text-warning font-medium">Complete quests!</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}