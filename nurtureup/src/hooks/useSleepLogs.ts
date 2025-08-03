import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

interface SleepLog {
  id: string
  childId: string
  type: string
  quality?: string
  notes?: string
  startTime: string
  endTime?: string
  duration?: number
  createdAt: string
}

interface SleepStats {
  totalSleepTime: number
  napCount: number
  nightSleepCount: number
  lastSleep: SleepLog | null
  averageSleepDuration: number | null
}

interface SleepData {
  sleepLogs: SleepLog[]
  stats: SleepStats
}

export function useSleepLogs(childId: string | null) {
  const { data: session } = useSession()
  const [data, setData] = useState<SleepData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSleepLogs = useCallback(async () => {
    if (!childId || !session) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/child/sleep?childId=${childId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch sleep logs')
      }
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [childId, session])

  const startSleep = async (sleepData: {
    type: string
    quality?: string
    notes?: string
    startTime?: string
  }) => {
    if (!childId || !session) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/child/sleep', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childId,
          ...sleepData,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to start sleep log')
      }

      // Refresh data after logging
      await fetchSleepLogs()
      
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const endSleep = async (sleepLogId: string, endData?: {
    endTime?: string
    quality?: string
    notes?: string
  }) => {
    if (!session) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/child/sleep', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sleepLogId,
          ...endData,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to end sleep log')
      }

      // Refresh data after updating
      await fetchSleepLogs()
      
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSleepLogs()
  }, [fetchSleepLogs])

  return {
    data,
    isLoading,
    error,
    startSleep,
    endSleep,
    refetch: fetchSleepLogs,
  }
}