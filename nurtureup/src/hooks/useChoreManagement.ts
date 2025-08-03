'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export interface Chore {
  id: string
  title: string
  description?: string
  category: string
  difficulty: number
  starValue: number
  status: 'todo' | 'in-progress' | 'done'
  assignedToId?: string
  dueDate?: string
  completedAt?: string
  createdAt: string
}

export interface ChoreStats {
  totalChores: number
  completedToday: number
  starsEarned: number
  weeklyGoal: number
  completionRate: number
}

export function useChoreManagement(childId?: string) {
  const { data: session } = useSession()
  const [chores, setChores] = useState<Chore[]>([])
  const [stats, setStats] = useState<ChoreStats>({
    totalChores: 0,
    completedToday: 0,
    starsEarned: 0,
    weeklyGoal: 35,
    completionRate: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchChores = async () => {
    if (!session || !childId) return

    setLoading(true)
    setError(null)
    
    try {
      // Fetch tasks categorized as chores
      const response = await fetch(`/api/tasks?filter=active&category=chore&assignedToId=${childId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch chores')
      }

      const data = await response.json()
      
      // Transform tasks into chores
      const choresList: Chore[] = data.tasks?.map((task: any) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        category: task.category || 'household',
        difficulty: task.difficulty,
        starValue: task.starValue,
        status: task.isCompleted ? 'done' : 'todo',
        assignedToId: task.assignedToId,
        dueDate: task.dueDate,
        completedAt: task.completedAt,
        createdAt: task.createdAt
      })) || []

      // Calculate today's stats
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const todayCompleted = choresList.filter(chore => 
        chore.status === 'done' && 
        chore.completedAt && 
        new Date(chore.completedAt) >= today
      )

      const starsEarned = todayCompleted.reduce((sum, chore) => sum + chore.starValue, 0)
      const completionRate = choresList.length > 0 
        ? Math.round((todayCompleted.length / choresList.length) * 100)
        : 0

      setChores(choresList)
      setStats({
        totalChores: choresList.length,
        completedToday: todayCompleted.length,
        starsEarned,
        weeklyGoal: 35,
        completionRate
      })

    } catch (error) {
      console.error('Error fetching chores:', error)
      setError(error instanceof Error ? error.message : 'Failed to load chores')
    } finally {
      setLoading(false)
    }
  }

  const addChore = async (title: string, starValue: number = 3, description?: string, category: string = 'household') => {
    if (!session || !childId) return false

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          category: 'chore',
          difficulty: Math.min(Math.max(Math.round(starValue / 2), 1), 5),
          starValue,
          assignedToId: childId,
          isRecurring: false,
          requiresProof: false
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add chore')
      }

      await fetchChores()
      return true

    } catch (error) {
      console.error('Error adding chore:', error)
      setError(error instanceof Error ? error.message : 'Failed to add chore')
      return false
    }
  }

  const completeChore = async (choreId: string) => {
    if (!session) return false

    try {
      const response = await fetch(`/api/tasks/${choreId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: true
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to complete chore')
      }

      await fetchChores()
      return true

    } catch (error) {
      console.error('Error completing chore:', error)
      setError(error instanceof Error ? error.message : 'Failed to complete chore')
      return false
    }
  }

  const deleteChore = async (choreId: string) => {
    if (!session) return false

    try {
      const response = await fetch(`/api/tasks/${choreId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete chore')
      }

      await fetchChores()
      return true

    } catch (error) {
      console.error('Error deleting chore:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete chore')
      return false
    }
  }

  useEffect(() => {
    fetchChores()
  }, [session, childId])

  return {
    chores,
    stats,
    loading,
    error,
    addChore,
    completeChore,
    deleteChore,
    refreshChores: fetchChores
  }
}