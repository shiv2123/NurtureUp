import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

interface DiaperLog {
  id: string
  childId: string
  type: string
  notes?: string
  changedAt: string
  createdAt: string
}

interface DiaperStats {
  totalChanges: number
  wetChanges: number
  dirtyChanges: number
  lastChange: DiaperLog | null
  averageInterval: number | null
}

interface DiaperData {
  diaperLogs: DiaperLog[]
  stats: DiaperStats
}

export function useDiaperLogs(childId: string | null) {
  const { data: session } = useSession()
  const [data, setData] = useState<DiaperData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDiaperLogs = useCallback(async () => {
    if (!childId || !session) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/child/diaper?childId=${childId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch diaper logs')
      }
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [childId, session])

  const logDiaperChange = async (diaperData: {
    type: string
    notes?: string
    changedAt?: string
  }) => {
    if (!childId || !session) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/child/diaper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childId,
          ...diaperData,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to log diaper change')
      }

      // Refresh data after logging
      await fetchDiaperLogs()
      
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDiaperLogs()
  }, [fetchDiaperLogs])

  return {
    data,
    isLoading,
    error,
    logDiaperChange,
    refetch: fetchDiaperLogs,
  }
}