import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

interface MoodEntry {
  id: string
  childId: string
  moodScore: number
  notes?: string
  tags?: string
  energy?: number
  stress?: number
  sleep?: number
  socialInteraction?: number
  activities?: string
  triggers?: string
  loggedAt: string
  createdAt: string
}

interface MoodTrendData {
  date: string
  averageMood: number | null
  entryCount: number
}

interface MoodStats {
  totalEntries: number
  averageMood: number
  moodDistribution: {
    positive: number
    neutral: number
    concerning: number
  }
  topTags: { tag: string; count: number }[]
  latestMood: {
    score: number
    emoji: string
    date: string
    notes?: string
  } | null
  streakDays: number
}

interface MoodData {
  moodEntries: MoodEntry[]
  trendData: MoodTrendData[]
  stats: MoodStats
}

export function useMood(childId: string | null, period: string = '7') {
  const { data: session } = useSession()
  const [data, setData] = useState<MoodData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMood = useCallback(async () => {
    if (!childId || !session) return

    setIsLoading(true)
    setError(null)

    try {
      const url = `/api/child/mood?childId=${childId}&period=${period}`
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch mood data')
      }
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [childId, session, period])

  const logMood = async (moodData: {
    moodScore: number
    notes?: string
    tags?: string[]
    energy?: number
    stress?: number
    sleep?: number
    socialInteraction?: number
    activities?: string[]
    triggers?: string[]
  }) => {
    if (!childId || !session) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/child/mood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childId,
          ...moodData,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to log mood')
      }

      // Refresh data after logging
      await fetchMood()
      
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const updateMoodEntry = async (id: string, updateData: any) => {
    if (!session) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/child/mood', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          ...updateData,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update mood entry')
      }

      // Refresh data after update
      await fetchMood()
      
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const deleteMoodEntry = async (id: string) => {
    if (!session) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/child/mood?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete mood entry')
      }

      // Refresh data after deletion
      await fetchMood()
      
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMood()
  }, [fetchMood])

  // Helper functions
  const getMoodEmoji = (score: number): string => {
    if (score >= 9) return '😊'
    if (score >= 7) return '🙂'
    if (score >= 5) return '😐'
    if (score >= 3) return '😔'
    return '😢'
  }

  const getMoodLabel = (score: number): string => {
    if (score >= 9) return 'Excellent'
    if (score >= 7) return 'Good'
    if (score >= 5) return 'Okay'
    if (score >= 3) return 'Low'
    return 'Very Low'
  }

  const getMoodColor = (score: number): string => {
    if (score >= 8) return '#10B981' // green
    if (score >= 6) return '#F59E0B' // yellow
    if (score >= 4) return '#F97316' // orange
    return '#EF4444' // red
  }

  const getTodaysMood = () => {
    const today = new Date().toISOString().split('T')[0]
    return data?.moodEntries?.find(entry => 
      entry.loggedAt.split('T')[0] === today
    )
  }

  const getWeeklyAverage = () => {
    if (!data?.trendData) return 0
    const validDays = data.trendData.filter(day => day.averageMood !== null)
    if (validDays.length === 0) return 0
    return validDays.reduce((sum, day) => sum + (day.averageMood || 0), 0) / validDays.length
  }

  const getMoodTrend = () => {
    if (!data?.trendData || data.trendData.length < 2) return 'stable'
    
    const recentDays = data.trendData.slice(-3).filter(day => day.averageMood !== null)
    if (recentDays.length < 2) return 'stable'
    
    const first = recentDays[0].averageMood || 0
    const last = recentDays[recentDays.length - 1].averageMood || 0
    const difference = last - first
    
    if (difference > 1) return 'improving'
    if (difference < -1) return 'declining'
    return 'stable'
  }

  const getStreakMessage = () => {
    const streak = data?.stats.streakDays || 0
    if (streak === 0) return 'Start your mood tracking streak!'
    if (streak === 1) return '1 day streak! Keep it up!'
    if (streak < 7) return `${streak} day streak! 🔥`
    if (streak < 30) return `${streak} day streak! Amazing! 🌟`
    return `${streak} day streak! Incredible dedication! 🏆`
  }

  return {
    data,
    isLoading,
    error,
    logMood,
    updateMoodEntry,
    deleteMoodEntry,
    refetch: fetchMood,
    // Helper getters
    getMoodEmoji,
    getMoodLabel,
    getMoodColor,
    getTodaysMood,
    getWeeklyAverage,
    getMoodTrend,
    getStreakMessage,
  }
}