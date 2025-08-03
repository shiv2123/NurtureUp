import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

interface LearningScore {
  id: string
  childId: string
  subject: string
  gameId: string
  score: number
  xpEarned: number
  durationSeconds?: number
  metadata?: string
  createdAt: string
}

interface GameProgress {
  id: string
  name: string
  minXP: number
  maxXP: number
  unlocked: boolean
  completed: boolean
  progress: number
}

interface SubjectProgress {
  subject: string
  totalXP: number
  games: GameProgress[]
}

interface LearningStats {
  totalXP: number
  starsFromXP: number
  xpBySubject: Record<string, number>
  currentStreak: number
  weeklyXP: number
  gamesUnlocked: number
  gamesCompleted: number
}

interface LearningData {
  learningScores: LearningScore[]
  gameProgress: SubjectProgress[]
  recentActivity: LearningScore[]
  stats: LearningStats
}

export function useLearning(childId: string | null, subject?: 'phonics' | 'numbers' | 'shapes') {
  const { data: session } = useSession()
  const [data, setData] = useState<LearningData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLearning = useCallback(async () => {
    if (!childId || !session) return

    setIsLoading(true)
    setError(null)

    try {
      let url = `/api/child/learning?childId=${childId}`
      if (subject) {
        url += `&subject=${subject}`
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch learning data')
      }
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [childId, session, subject])

  const recordGameSession = async (gameData: {
    subject: 'phonics' | 'numbers' | 'shapes'
    gameId: string
    score: number
    xpEarned: number
    durationSeconds?: number
    metadata?: any
  }) => {
    if (!childId || !session) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/child/learning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childId,
          ...gameData,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to record game session')
      }

      // Refresh data after recording
      await fetchLearning()
      
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const resetProgress = async (subject: 'phonics' | 'numbers' | 'shapes') => {
    if (!childId || !session) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/child/learning', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childId,
          action: 'reset_progress',
          subject,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to reset progress')
      }

      // Refresh data after reset
      await fetchLearning()
      
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLearning()
  }, [fetchLearning])

  // Helper functions
  const getSubjectProgress = (subjectName: 'phonics' | 'numbers' | 'shapes') => {
    return data?.gameProgress?.find(sp => sp.subject === subjectName)
  }

  const getXpForSubject = (subjectName: 'phonics' | 'numbers' | 'shapes') => {
    return data?.stats.xpBySubject[subjectName] || 0
  }

  const getUnlockedGames = (subjectName?: 'phonics' | 'numbers' | 'shapes') => {
    if (subjectName) {
      const progress = getSubjectProgress(subjectName)
      return progress?.games.filter(game => game.unlocked) || []
    }
    
    return data?.gameProgress?.flatMap(sp => sp.games.filter(game => game.unlocked)) || []
  }

  const getCompletedGames = (subjectName?: 'phonics' | 'numbers' | 'shapes') => {
    if (subjectName) {
      const progress = getSubjectProgress(subjectName)
      return progress?.games.filter(game => game.completed) || []
    }
    
    return data?.gameProgress?.flatMap(sp => sp.games.filter(game => game.completed)) || []
  }

  const getNextGame = (subjectName: 'phonics' | 'numbers' | 'shapes') => {
    const progress = getSubjectProgress(subjectName)
    if (!progress) return null
    
    // Find the first unlocked but not completed game
    return progress.games.find(game => game.unlocked && !game.completed) || null
  }

  const canPlayGame = (subjectName: 'phonics' | 'numbers' | 'shapes', gameId: string) => {
    const progress = getSubjectProgress(subjectName)
    if (!progress) return false
    
    const game = progress.games.find(g => g.id === gameId)
    return game?.unlocked || false
  }

  return {
    data,
    isLoading,
    error,
    recordGameSession,
    resetProgress,
    refetch: fetchLearning,
    // Helper getters
    getSubjectProgress,
    getXpForSubject,
    getUnlockedGames,
    getCompletedGames,
    getNextGame,
    canPlayGame,
  }
}