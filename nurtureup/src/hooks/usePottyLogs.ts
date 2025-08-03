import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

interface PottyLog {
  id: string
  childId: string
  type: 'attempt' | 'success' | 'accident'
  notes?: string
  timestamp: string
  loggedById?: string
  createdAt: string
}

interface PottyStats {
  totalAttempts: number
  successfulAttempts: number
  accidents: number
  stickersEarned: number
  lastAttempt: PottyLog | null
  successRate: number | null
}

interface PottyData {
  logs: PottyLog[]
  stats: PottyStats
}

export function usePottyLogs(childId: string | null) {
  const { data: session } = useSession()
  const [data, setData] = useState<PottyData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPottyLogs = useCallback(async () => {
    if (!childId || !session) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/child/potty-training?childId=${childId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch potty logs')
      }
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [childId, session])

  const logPottyEvent = async (eventData: {
    type: 'attempt' | 'success' | 'accident'
    notes?: string
    timestamp?: string
  }) => {
    if (!childId || !session) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/child/potty-training', {
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
        throw new Error('Failed to log potty event')
      }

      // Refresh data after logging
      await fetchPottyLogs()
      
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const startPottyAttempt = () => logPottyEvent({ type: 'attempt' })
  const logPottySuccess = (notes?: string) => logPottyEvent({ type: 'success', notes })
  const logPottyAccident = (notes?: string) => logPottyEvent({ type: 'accident', notes })

  useEffect(() => {
    fetchPottyLogs()
  }, [fetchPottyLogs])

  // Helper function to calculate stickers available for collection
  const getStickersToCollect = () => {
    if (!data?.stats) return 0
    return data.stats.stickersEarned
  }

  return {
    data,
    isLoading,
    error,
    logPottyEvent,
    startPottyAttempt,
    logPottySuccess,
    logPottyAccident,
    refetch: fetchPottyLogs,
    stickersToCollect: getStickersToCollect(),
  }
}