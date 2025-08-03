import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

interface ScreenTimeLog {
  id: string
  childId: string
  type: 'session_start' | 'session_end' | 'limit_warning' | 'limit_exceeded'
  app?: string
  durationMinutes?: number
  sessionId?: string
  timestamp: string
  notes?: string
}

interface ScreenTimeStats {
  totalMinutesUsed: number
  dailyLimit: number
  bonusMinutes: number
  totalAllowedMinutes: number
  remainingMinutes: number
  percentageUsed: number
  hasActiveSession: boolean
  activeSessionStart: string | null
  isOverLimit: boolean
  warningThreshold: number
  isNearLimit: boolean
}

interface WeeklyPattern {
  date: string
  dayName: string
  minutes: number
  isToday: boolean
}

interface ScreenTimeData {
  logs: ScreenTimeLog[]
  stats: ScreenTimeStats
  weeklyPattern: WeeklyPattern[]
}

export function useScreenTime(childId: string | null) {
  const { data: session } = useSession()
  const [data, setData] = useState<ScreenTimeData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)

  const fetchScreenTimeData = useCallback(async () => {
    if (!childId || !session) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/child/screen-time?childId=${childId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch screen time data')
      }
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [childId, session])

  const logScreenTimeEvent = async (eventData: {
    type: 'session_start' | 'session_end' | 'limit_warning' | 'limit_exceeded'
    app?: string
    durationMinutes?: number
    sessionId?: string
    notes?: string
  }) => {
    if (!childId || !session) return

    try {
      const response = await fetch('/api/child/screen-time', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childId,
          ...eventData,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to log screen time event')
      }

      // Refresh data after logging
      await fetchScreenTimeData()
      
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    }
  }

  const startSession = async (app?: string) => {
    const sessionId = `session_${Date.now()}`
    setCurrentSessionId(sessionId)
    setSessionStartTime(new Date())
    
    return await logScreenTimeEvent({
      type: 'session_start',
      app,
      sessionId
    })
  }

  const endSession = async (notes?: string) => {
    if (!currentSessionId || !sessionStartTime) return

    const durationMinutes = Math.round((Date.now() - sessionStartTime.getTime()) / (1000 * 60))
    
    const result = await logScreenTimeEvent({
      type: 'session_end',
      durationMinutes,
      sessionId: currentSessionId,
      notes
    })

    setCurrentSessionId(null)
    setSessionStartTime(null)
    
    return result
  }

  const logWarning = async () => {
    return await logScreenTimeEvent({
      type: 'limit_warning',
      notes: 'Screen time warning threshold reached'
    })
  }

  const logLimitExceeded = async () => {
    return await logScreenTimeEvent({
      type: 'limit_exceeded',
      notes: 'Daily screen time limit exceeded'
    })
  }

  // Parent functions for adjusting limits
  const grantBonusMinutes = async (minutes: number) => {
    if (!childId || !session) return

    try {
      const response = await fetch('/api/child/screen-time', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childId,
          action: 'grant_bonus',
          bonusMinutes: minutes
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to grant bonus minutes')
      }

      await fetchScreenTimeData()
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    }
  }

  const setDailyLimit = async (minutes: number) => {
    if (!childId || !session) return

    try {
      const response = await fetch('/api/child/screen-time', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childId,
          action: 'set_limit',
          dailyLimit: minutes
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to set daily limit')
      }

      await fetchScreenTimeData()
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    }
  }

  useEffect(() => {
    fetchScreenTimeData()
  }, [fetchScreenTimeData])

  // Auto-check for warnings and limits
  useEffect(() => {
    if (data?.stats && data.stats.isNearLimit && !data.stats.isOverLimit) {
      // Trigger warning if near limit but not already over
      logWarning().catch(console.error)
    }
    
    if (data?.stats?.isOverLimit && currentSessionId) {
      // Auto-end session if over limit
      endSession('Session ended due to daily limit exceeded').catch(console.error)
      logLimitExceeded().catch(console.error)
    }
  }, [data?.stats])

  return {
    data,
    isLoading,
    error,
    currentSessionId,
    sessionStartTime,
    startSession,
    endSession,
    logWarning,
    logLimitExceeded,
    grantBonusMinutes,
    setDailyLimit,
    refetch: fetchScreenTimeData,
    // Helper computed values
    isSessionActive: !!currentSessionId,
    currentSessionDuration: sessionStartTime 
      ? Math.round((Date.now() - sessionStartTime.getTime()) / (1000 * 60))
      : 0
  }
}