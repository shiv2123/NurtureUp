import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

interface Homework {
  id: string
  title: string
  description?: string
  category: string
  priority: string
  starValue: number
  dueDate?: string
  metadata: string
  isActive: boolean
  createdAt: string
  completions: TaskCompletion[]
  assignedToChild?: {
    id: string
    user: { name: string }
  }
}

interface TaskCompletion {
  id: string
  taskId: string
  childId: string
  completedAt: string
  isApproved: boolean
}

interface HomeworkStats {
  totalActive: number
  totalCompleted: number
  todayDue: number
  overdue: number
  currentStreak: number
  completionRate: number
}

interface HomeworkData {
  homework: Homework[]
  groupedHomework: Record<string, Homework[]>
  stats: HomeworkStats
}

export function useHomework(childId: string | null, status?: 'active' | 'completed' | 'overdue') {
  const { data: session } = useSession()
  const [data, setData] = useState<HomeworkData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchHomework = useCallback(async () => {
    if (!childId || !session) return

    setIsLoading(true)
    setError(null)

    try {
      let url = `/api/child/homework?childId=${childId}`
      if (status) {
        url += `&status=${status}`
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch homework')
      }
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [childId, session, status])

  const createHomework = async (homeworkData: {
    title: string
    subject: string
    description?: string
    dueDate?: string
    priority?: 'low' | 'medium' | 'high'
    starValue?: number
    notes?: string
  }) => {
    if (!childId || !session) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/child/homework', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childId,
          ...homeworkData,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create homework')
      }

      // Refresh data after creation
      await fetchHomework()
      
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const updateHomework = async (id: string, updateData: any) => {
    if (!session) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/child/homework', {
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
        throw new Error('Failed to update homework')
      }

      // Refresh data after update
      await fetchHomework()
      
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const completeHomework = async (id: string) => {
    return await updateHomework(id, { action: 'complete' })
  }

  const deleteHomework = async (id: string) => {
    if (!session) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/child/homework?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete homework')
      }

      // Refresh data after deletion
      await fetchHomework()
      
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHomework()
  }, [fetchHomework])

  // Helper functions
  const getHomeworkByDate = (date: string) => {
    return data?.groupedHomework?.[date] || []
  }

  const getTodaysHomework = () => {
    const today = new Date().toISOString().split('T')[0]
    return getHomeworkByDate(today)
  }

  const getOverdueHomework = () => {
    const now = new Date()
    return data?.homework?.filter(hw => 
      hw.isActive && 
      hw.dueDate && 
      new Date(hw.dueDate) < now &&
      hw.completions.length === 0
    ) || []
  }

  const getUpcomingHomework = () => {
    const now = new Date()
    return data?.homework?.filter(hw => 
      hw.isActive && 
      hw.dueDate && 
      new Date(hw.dueDate) >= now &&
      hw.completions.length === 0
    ) || []
  }

  return {
    data,
    isLoading,
    error,
    createHomework,
    updateHomework,
    completeHomework,    
    deleteHomework,
    refetch: fetchHomework,
    // Helper getters
    getHomeworkByDate,
    getTodaysHomework,
    getOverdueHomework,
    getUpcomingHomework,
  }
}