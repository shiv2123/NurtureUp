import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

interface FeedingLog {
  id: string
  childId: string
  type: string
  amount?: number
  duration?: number
  notes?: string
  startTime: string
  endTime?: string
  createdAt: string
}

interface FeedingStats {
  totalFeedings: number
  totalAmount: number
  lastFeeding: FeedingLog | null
  averageInterval: number | null
}

interface FeedingData {
  feedingLogs: FeedingLog[]
  stats: FeedingStats
}

export function useFeedingLogs(childId: string | null) {
  const { data: session } = useSession()
  const [data, setData] = useState<FeedingData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchFeedingLogs = useCallback(async () => {
    if (!childId || !session) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/child/feeding?childId=${childId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch feeding logs')
      }
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [childId, session])

  const logFeeding = async (feedingData: {
    type: string
    amount?: number
    duration?: number
    notes?: string
    startTime?: string
    endTime?: string
  }) => {
    if (!childId || !session) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/child/feeding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childId,
          ...feedingData,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to log feeding')
      }

      // Refresh data after logging
      await fetchFeedingLogs()
      
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFeedingLogs()
  }, [fetchFeedingLogs])

  return {
    data,
    isLoading,
    error,
    logFeeding,
    refetch: fetchFeedingLogs,
  }
}