'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRealtimeSync } from './useRealtimeSync'
import { localStore } from '@/lib/localStore'
import { toast } from 'react-hot-toast'

export interface Task {
  id: string
  title: string
  description?: string
  starValue: number
  difficulty: number
  requiresProof: boolean
  isActive: boolean
  assignedToId: string
  completions?: any[]
  dueDate?: Date
  // Optimistic state
  _optimistic?: {
    isCompleting?: boolean
    isCompleted?: boolean
    completedAt?: Date
  }
}

export function useOptimisticTasks() {
  const { data: session } = useSession()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { performOptimisticUpdate, emitSyncEvent, isConnected } = useRealtimeSync({
    onEvent: (event) => {
      // Handle real-time task updates from other family members
      if (event.type === 'task_completed' || event.type === 'task_approved') {
        handleRemoteTaskUpdate(event.data)
      } else if (event.type === 'task_created') {
        handleRemoteTaskCreated(event.data)
      } else if (event.type === 'task_updated') {
        handleRemoteTaskUpdated(event.data)
      }
    }
  })

  // Load tasks from cache first, then fetch from server
  useEffect(() => {
    if (!session?.user?.familyId) return

    // Load from cache immediately
    const cachedTasks = localStore.getCachedTasks(session.user.familyId)
    if (cachedTasks) {
      setTasks(cachedTasks)
      setIsLoading(false)
    }

    // Then fetch fresh data
    fetchTasks()
  }, [session?.user?.familyId])

  const fetchTasks = useCallback(async () => {
    if (!session?.user?.id) return

    try {
      const response = await fetch('/api/tasks')
      if (!response.ok) throw new Error('Failed to fetch tasks')
      
      const freshTasks = await response.json()
      setTasks(freshTasks)
      setError(null)
      
      // Cache the fresh data
      if (session.user.familyId) {
        localStore.cacheTasks(freshTasks, session.user.familyId)
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err)
      setError('Failed to load tasks')
      
      // If we have cached data, show a warning instead of error
      const cachedTasks = session.user.familyId ? localStore.getCachedTasks(session.user.familyId) : null
      if (cachedTasks && cachedTasks.length > 0) {
        toast.error('Using offline data - some tasks may be outdated')
      }
    } finally {
      setIsLoading(false)
    }
  }, [session?.user?.id, session?.user?.familyId])

  // Optimistic task completion
  const completeTask = useCallback(async (
    taskId: string, 
    proofImage?: string, 
    notes?: string
  ) => {
    if (!session?.user?.id) return

    const operationId = `complete_${taskId}_${Date.now()}`
    
    return performOptimisticUpdate(
      operationId,
      // Optimistic update
      () => {
        setTasks(currentTasks => 
          currentTasks.map(task => 
            task.id === taskId 
              ? {
                  ...task,
                  _optimistic: {
                    isCompleting: true,
                    isCompleted: false
                  }
                }
              : task
          )
        )
      },
      // Server operation
      async () => {
        const response = await fetch(`/api/tasks/${taskId}/complete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ proofImage, notes })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to complete task')
        }

        const result = await response.json()
        
        // Update local state with server response
        setTasks(currentTasks => 
          currentTasks.map(task => 
            task.id === taskId 
              ? {
                  ...task,
                  completions: [result],
                  _optimistic: {
                    isCompleting: false,
                    isCompleted: true,
                    completedAt: new Date()
                  }
                }
              : task
          )
        )

        // Emit sync event to family
        await emitSyncEvent('task_completed', {
          taskId,
          childId: session.user.id,
          completionData: result
        })

        // Show success message
        const task = tasks.find(t => t.id === taskId)
        if (task) {
          toast.success(
            task.requiresProof 
              ? `Task "${task.title}" submitted for approval!`
              : `Task "${task.title}" completed! +${task.starValue} stars`
          )
        }

        return result
      },
      // Rollback function
      () => {
        setTasks(currentTasks => 
          currentTasks.map(task => 
            task.id === taskId 
              ? {
                  ...task,
                  _optimistic: undefined
                }
              : task
          )
        )
      }
    )
  }, [session?.user?.id, performOptimisticUpdate, emitSyncEvent, tasks])

  // Handle remote task updates from real-time events
  const handleRemoteTaskUpdate = useCallback((data: any) => {
    const { taskId, completionData } = data
    
    setTasks(currentTasks => 
      currentTasks.map(task => 
        task.id === taskId 
          ? {
              ...task,
              completions: task.completions ? [...task.completions, completionData] : [completionData],
              _optimistic: undefined // Clear any optimistic state
            }
          : task
      )
    )

    // Show notification for family member's task completion
    const task = tasks.find(t => t.id === taskId)
    if (task && data.childId !== session?.user?.id) {
      toast.success(`Family member completed "${task.title}"!`)
    }
  }, [tasks, session?.user?.id])

  const handleRemoteTaskCreated = useCallback((data: any) => {
    const newTask = data.task
    
    setTasks(currentTasks => {
      // Check if task already exists to avoid duplicates
      const exists = currentTasks.find(t => t.id === newTask.id)
      if (exists) return currentTasks
      
      return [...currentTasks, newTask]
    })

    // Show notification for new task
    if (newTask.assignedToId === session?.user?.id) {
      toast.success(`New task assigned: "${newTask.title}"`)
    }
  }, [session?.user?.id])

  const handleRemoteTaskUpdated = useCallback((data: any) => {
    const updatedTask = data.task
    
    setTasks(currentTasks => 
      currentTasks.map(task => 
        task.id === updatedTask.id 
          ? { ...task, ...updatedTask, _optimistic: undefined }
          : task
      )
    )
  }, [])

  // Retry failed operations when coming back online
  useEffect(() => {
    if (isConnected && session?.user?.id) {
      const pendingOps = localStore.getPendingOperations()
      
      pendingOps.forEach(async (operation) => {
        try {
          if (operation.type === 'task_complete') {
            await completeTask(
              operation.data.taskId,
              operation.data.proofImage,
              operation.data.notes
            )
            localStore.removePendingOperation(operation.id)
          }
          // Handle other operation types as needed
        } catch (error) {
          console.warn('Failed to retry operation:', operation.id, error)
          localStore.incrementRetryCount(operation.id)
          
          // Remove operations that have failed too many times
          if (operation.retryCount >= 3) {
            localStore.removePendingOperation(operation.id)
            toast.error('Some changes could not be synced')
          }
        }
      })
    }
  }, [isConnected, session?.user?.id, completeTask])

  // Sync tasks periodically and when coming back online
  useEffect(() => {
    if (!isConnected) return

    const syncInterval = setInterval(fetchTasks, 30000) // Sync every 30 seconds
    return () => clearInterval(syncInterval)
  }, [isConnected, fetchTasks])

  // Save to cache whenever tasks change
  useEffect(() => {
    if (tasks.length > 0 && session?.user?.familyId) {
      localStore.cacheTasks(tasks, session.user.familyId)
    }
  }, [tasks, session?.user?.familyId])

  return {
    tasks,
    isLoading,
    error,
    isConnected,
    completeTask,
    refetch: fetchTasks
  }
}