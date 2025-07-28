'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useNotifications } from '@/components/providers/NotificationProvider'

interface Task {
  id: string
  title: string
  description?: string
  category?: string
  difficulty: number
  starValue: number
  assignedTo?: { user: { name?: string; email: string } }
  completions: any[]
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const { notifications } = useNotifications()

  useEffect(() => {
    async function fetchTasks() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/tasks')
        if (!res.ok) throw new Error('Failed to fetch tasks')
        const data = await res.json()
        setTasks(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchTasks()
  }, [refreshKey])

  // Listen for task completion notifications to refresh task list
  useEffect(() => {
    const taskNotifications = notifications.filter(
      n => n.type === 'task_completed' || n.type === 'task_approved'
    )
    
    if (taskNotifications.length > 0) {
      // Refresh task list when tasks are completed/approved
      setRefreshKey(k => k + 1)
    }
  }, [notifications])

  // Expose refresh function for parent components to use after creating tasks
  const refreshTasks = () => {
    setRefreshKey(k => k + 1)
  }

  if (loading) {
    return <div className="text-center text-black py-8">Loading tasks...</div>
  }
  if (error) {
    return <div className="text-center text-error py-8">{error}</div>
  }
  if (tasks.length === 0) {
    return <div className="rounded-2xl border border-slate-200 bg-white shadow-soft p-6 text-center text-black">No tasks yet. Start by adding your first quest!</div>
  }

  return (
    <div className="space-y-6">
      {tasks.map((task) => (
        <Card key={task.id}>
          <CardHeader>
            <CardTitle>{task.title}</CardTitle>
            <div className="text-xs text-black mt-1">
              {task.category && <span className="mr-2">{task.category}</span>}
              Difficulty: {task.difficulty} | ⭐ {task.starValue}
            </div>
          </CardHeader>
          <CardContent>
            {task.description && <p className="mb-2 text-black">{task.description}</p>}
            {task.assignedTo?.user && (
              <div className="text-sm text-black mt-2">
                Assigned to: {task.assignedTo.user.name || task.assignedTo.user.email}
              </div>
            )}
            <div className="mt-2 text-xs text-black">
              Completions today: {task.completions.length}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 