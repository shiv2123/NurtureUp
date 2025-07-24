'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  Play, 
  Pause, 
  Gamepad2, 
  Tv, 
  Smartphone,
  Star,
  Gift,
  AlertTriangle
} from 'lucide-react'

interface ScreenTimeData {
  dailyLimit: number        // minutes
  bonusMinutes: number      // earned through tasks
  usedToday: number        // minutes used today
  lastReset: string        // when daily limit was reset
  isActive: boolean        // currently using screen time
  sessionStart?: string    // when current session started
}

interface ScreenTimeTrackerProps {
  initialData: ScreenTimeData
  onTimeUpdate?: (data: ScreenTimeData) => void
}

export function ScreenTimeTracker({ initialData, onTimeUpdate }: ScreenTimeTrackerProps) {
  const [screenTime, setScreenTime] = useState<ScreenTimeData>(initialData)
  const [currentSession, setCurrentSession] = useState(0) // minutes in current session
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)

  // Calculate totals
  const totalAvailable = screenTime.dailyLimit + screenTime.bonusMinutes
  const remainingMinutes = Math.max(0, totalAvailable - screenTime.usedToday)
  const usedPercentage = (screenTime.usedToday / totalAvailable) * 100

  // Format time display
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  // Start screen time session
  const startSession = async () => {
    if (remainingMinutes <= 0) {
      alert('No screen time remaining! Complete more tasks to earn bonus time.')
      return
    }

    try {
      const response = await fetch('/api/child/screen-time/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!response.ok) throw new Error('Failed to start session')
      
      const updatedData = await response.json()
      setScreenTime(updatedData)
      setCurrentSession(0)
      
      // Start timer
      const id = setInterval(() => {
        setCurrentSession(prev => prev + 1/60) // increment by 1 second (converted to minutes)
      }, 1000)
      setIntervalId(id)
      
    } catch (error) {
      console.error('Error starting screen time:', error)
      alert('Failed to start screen time session')
    }
  }

  // End screen time session
  const endSession = async () => {
    if (intervalId) {
      clearInterval(intervalId)
      setIntervalId(null)
    }

    try {
      const response = await fetch('/api/child/screen-time/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minutesUsed: Math.ceil(currentSession) })
      })
      
      if (!response.ok) throw new Error('Failed to end session')
      
      const updatedData = await response.json()
      setScreenTime(updatedData)
      setCurrentSession(0)
      onTimeUpdate?.(updatedData)
      
    } catch (error) {
      console.error('Error ending screen time:', error)
      alert('Failed to end screen time session')
    }
  }

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [intervalId])

  // Check if session should auto-end (when time runs out)
  useEffect(() => {
    if (screenTime.isActive && currentSession >= remainingMinutes) {
      endSession()
      alert('Screen time is up! Great job managing your time!')
    }
  }, [currentSession, remainingMinutes, screenTime.isActive])

  const getStatusColor = () => {
    if (usedPercentage >= 90) return 'text-red-500'
    if (usedPercentage >= 70) return 'text-orange-500'
    return 'text-green-500'
  }

  const getProgressColor = () => {
    if (usedPercentage >= 90) return 'bg-red-500'
    if (usedPercentage >= 70) return 'bg-orange-500'
    return 'bg-green-500'
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-sky-blue" />
          Screen Time Meter
          {screenTime.isActive && (
            <Badge variant="default" className="bg-green-500">
              Active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Ring */}
        <div className="relative">
          <div className="text-center">
            <div className="relative inline-block">
              {/* Circular progress background */}
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-slate-200"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${Math.min(usedPercentage * 2.51, 251.2)} 251.2`}
                  className={getProgressColor()}
                  strokeLinecap="round"
                />
              </svg>
              
              {/* Center text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getStatusColor()}`}>
                    {formatTime(remainingMinutes)}
                  </div>
                  <div className="text-xs text-black">remaining</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-black">
              {formatTime(screenTime.dailyLimit)}
            </div>
            <div className="text-xs text-black">Daily Limit</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-mint-green">
              {formatTime(screenTime.bonusMinutes)}
            </div>
            <div className="text-xs text-black">Bonus Time</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-sky-blue">
              {formatTime(screenTime.usedToday)}
            </div>
            <div className="text-xs text-black">Used Today</div>
          </div>
        </div>

        {/* Current session info */}
        {screenTime.isActive && (
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-700">
                Current Session
              </span>
              <span className="text-lg font-bold text-green-700">
                {formatTime(Math.ceil(currentSession))}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {!screenTime.isActive ? (
            <Button
              onClick={startSession}
              disabled={remainingMinutes <= 0}
              className="w-full bg-green-500 hover:bg-green-600"
              size="lg"
            >
              <Play className="w-4 h-4 mr-2" />
              {remainingMinutes <= 0 ? 'No Time Remaining' : 'Start Screen Time'}
            </Button>
          ) : (
            <Button
              onClick={endSession}
              variant="outline"
              className="w-full border-orange-500 text-orange-500 hover:bg-orange-50"
              size="lg"
            >
              <Pause className="w-4 h-4 mr-2" />
              End Session
            </Button>
          )}

          {/* Earn more time */}
          {remainingMinutes <= 10 && (
            <div className="bg-warning/10 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-warning mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-warning">Running low on time!</p>
                  <p className="text-black text-xs mt-1">
                    Complete tasks to earn bonus screen time
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Activity suggestions */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-black">Quick Activities</div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="flex-1">
              <Gamepad2 className="w-4 h-4 mr-1" />
              Games
            </Button>
            <Button variant="ghost" size="sm" className="flex-1">
              <Tv className="w-4 h-4 mr-1" />
              Videos
            </Button>
            <Button variant="ghost" size="sm" className="flex-1">
              <Smartphone className="w-4 h-4 mr-1" />
              Apps
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}