'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export interface BehaviorEvent {
  id: string
  time: string
  type: 'positive' | 'tantrum'
  event: string
  stars: number
  notes?: string
  createdAt: Date
}

export interface BehaviorStats {
  starsToday: number
  targetStars: number
  positiveEvents: number
  tantrums: number
  weeklyProgress: number
}

export function useBehaviorTracking(childId?: string) {
  const { data: session } = useSession()
  const [events, setEvents] = useState<BehaviorEvent[]>([])
  const [stats, setStats] = useState<BehaviorStats>({
    starsToday: 0,
    targetStars: 12,
    positiveEvents: 0,
    tantrums: 0,
    weeklyProgress: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBehaviorData = async () => {
    if (!session || !childId) return

    setLoading(true)
    setError(null)
    
    try {
      // Fetch recent tasks/behaviors - using the tasks API with behavioral categorization
      const response = await fetch(`/api/tasks?childId=${childId}&filter=today&category=behavior`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch behavior data')
      }

      const data = await response.json()
      
      // Transform tasks into behavior events
      const behaviorEvents: BehaviorEvent[] = data.tasks?.map((task: any) => ({
        id: task.id,
        time: getTimeAgo(new Date(task.createdAt)),
        type: task.category === 'tantrum' ? 'tantrum' : 'positive',
        event: task.title,
        stars: task.starValue || 0,
        notes: task.description,
        createdAt: new Date(task.createdAt)
      })) || []

      // Calculate stats from today's events
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const todayEvents = behaviorEvents.filter(event => 
        new Date(event.createdAt) >= today
      )

      const starsToday = todayEvents
        .filter(event => event.type === 'positive')
        .reduce((sum, event) => sum + event.stars, 0)

      const positiveEvents = todayEvents.filter(event => event.type === 'positive').length
      const tantrums = todayEvents.filter(event => event.type === 'tantrum').length

      setEvents(behaviorEvents.slice(0, 10)) // Show last 10 events
      setStats({
        starsToday,
        targetStars: 12, // Could be configurable per child
        positiveEvents,
        tantrums,
        weeklyProgress: (starsToday / 12) * 100
      })

    } catch (error) {
      console.error('Error fetching behavior data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load behavior data')
    } finally {
      setLoading(false)
    }
  }

  const logBehavior = async (type: 'positive' | 'tantrum', event: string, stars: number = 0, notes?: string) => {
    if (!session || !childId) return false

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: event,
          description: notes,
          category: type === 'tantrum' ? 'tantrum' : 'behavior',
          difficulty: 1,
          starValue: type === 'positive' ? stars : 0,
          assignedToId: childId,
          isRecurring: false,
          requiresProof: false
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to log behavior')
      }

      // Refresh data after logging
      await fetchBehaviorData()
      return true

    } catch (error) {
      console.error('Error logging behavior:', error)
      setError(error instanceof Error ? error.message : 'Failed to log behavior')
      return false
    }
  }

  useEffect(() => {
    fetchBehaviorData()
  }, [session, childId])

  return {
    events,
    stats,
    loading,
    error,
    logBehavior,
    refreshData: fetchBehaviorData
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffMs / (1000 * 60))

  if (diffHours >= 1) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  } else if (diffMinutes >= 1) {
    return `${diffMinutes} min ago`
  } else {
    return 'Just now'
  }
}