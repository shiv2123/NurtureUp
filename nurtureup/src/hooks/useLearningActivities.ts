'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export interface LearningActivity {
  id: string
  type: 'letter' | 'number' | 'reading' | 'math' | 'science'
  title: string
  description: string
  difficulty: number
  estimatedMinutes: number
  completed: boolean
  score?: number
  completedAt?: string
}

export interface LearningStats {
  weeklyGoal: number
  currentProgress: number
  activitiesCompleted: number
  totalTimeSpent: number
  letterOfTheDay: string
  numberOfTheDay: number
  streakDays: number
}

export interface LearningSpotlight {
  letter: string
  number: number
  progress: number
}

export function useLearningActivities(childId?: string) {
  const { data: session } = useSession()
  const [activities, setActivities] = useState<LearningActivity[]>([])
  const [stats, setStats] = useState<LearningStats>({
    weeklyGoal: 100,
    currentProgress: 0,
    activitiesCompleted: 0,
    totalTimeSpent: 0,
    letterOfTheDay: 'M',
    numberOfTheDay: 7,
    streakDays: 0
  })
  const [spotlight, setSpotlight] = useState<LearningSpotlight>({
    letter: 'M',
    number: 7,
    progress: 85
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLearningData = async () => {
    if (!session || !childId) return

    setLoading(true)
    setError(null)
    
    try {
      // Fetch learning scores and activities
      const response = await fetch(`/api/child/learning?childId=${childId}&limit=20`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch learning data')
      }

      const data = await response.json()
      
      // Transform learning data
      const learningActivities: LearningActivity[] = data.scores?.map((score: any) => ({
        id: score.id,
        type: determineActivityType(score.skill || score.gameType),
        title: score.skill || `Learning Activity`,
        description: `Practice ${score.skill || 'learning skills'}`,
        difficulty: score.difficulty || 1,
        estimatedMinutes: 5,
        completed: true,
        score: score.score,
        completedAt: score.createdAt
      })) || []

      // Calculate weekly progress and stats
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      weekStart.setHours(0, 0, 0, 0)

      const weeklyActivities = learningActivities.filter(activity => 
        activity.completedAt && new Date(activity.completedAt) >= weekStart
      )

      const totalTimeSpent = weeklyActivities.length * 5 // 5 minutes per activity
      const currentProgress = Math.min((totalTimeSpent / 100) * 100, 100)

      // Generate letter and number of the day based on current date
      const today = new Date()
      const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)
      const letterIndex = dayOfYear % 26
      const letterOfTheDay = String.fromCharCode(65 + letterIndex) // A-Z
      const numberOfTheDay = (dayOfYear % 20) + 1 // 1-20

      setActivities(learningActivities.slice(0, 10))
      setStats({
        weeklyGoal: 100,
        currentProgress,
        activitiesCompleted: weeklyActivities.length,
        totalTimeSpent,
        letterOfTheDay,
        numberOfTheDay,
        streakDays: calculateStreak(learningActivities)
      })
      setSpotlight({
        letter: letterOfTheDay,
        number: numberOfTheDay,
        progress: currentProgress
      })

    } catch (error) {
      console.error('Error fetching learning data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load learning data')
    } finally {
      setLoading(false)
    }
  }

  const startLearningActivity = async (type: string, skill: string = 'general') => {
    if (!session || !childId) return false

    try {
      const response = await fetch('/api/child/learning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childId,
          gameType: type,
          skill,
          score: Math.floor(Math.random() * 50) + 50, // Random score 50-100
          questionsAnswered: 10,
          correctAnswers: Math.floor(Math.random() * 5) + 7, // 7-12 correct
          timeSpent: 300, // 5 minutes in seconds
          difficulty: 1
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to log learning activity')
      }

      await fetchLearningData()
      return true

    } catch (error) {
      console.error('Error starting learning activity:', error)
      setError(error instanceof Error ? error.message : 'Failed to start activity')
      return false
    }
  }

  const determineActivityType = (skill: string): LearningActivity['type'] => {
    const skillLower = skill?.toLowerCase() || ''
    if (skillLower.includes('letter') || skillLower.includes('alphabet')) return 'letter'
    if (skillLower.includes('number') || skillLower.includes('count')) return 'number'
    if (skillLower.includes('read')) return 'reading'
    if (skillLower.includes('math') || skillLower.includes('add')) return 'math'
    if (skillLower.includes('science')) return 'science'
    return 'reading' // default
  }

  const calculateStreak = (activities: LearningActivity[]): number => {
    if (activities.length === 0) return 0
    
    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)
    
    for (let i = 0; i < 30; i++) { // Check last 30 days
      const hasActivity = activities.some(activity => {
        if (!activity.completedAt) return false
        const activityDate = new Date(activity.completedAt)
        activityDate.setHours(0, 0, 0, 0)
        return activityDate.getTime() === currentDate.getTime()
      })
      
      if (hasActivity) {
        streak++
      } else {
        break
      }
      
      currentDate.setDate(currentDate.getDate() - 1)
    }
    
    return streak
  }

  useEffect(() => {
    fetchLearningData()
  }, [session, childId])

  return {
    activities,
    stats,
    spotlight,
    loading,
    error,
    startLearningActivity,
    refreshData: fetchLearningData
  }
}