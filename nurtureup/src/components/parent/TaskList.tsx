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
    return <div className="text-center text-slate-600 py-8">Loading tasks...</div>
  }
  if (error) {
    return <div className="text-center text-red-600 py-8">{error}</div>
  }
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📝</div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">No tasks yet</h3>
        <p className="text-slate-600">Start by creating your first task.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div key={task.id} className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:border-slate-300 transition-colors">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">{task.title}</h3>
              {task.description && (
                <p className="text-slate-600 mb-3 text-sm">{task.description}</p>
              )}
              
              <div className="flex items-center gap-4 text-sm">
                {task.category && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {task.category}
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Difficulty:</span>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${
                          i < task.difficulty ? 'bg-orange-400' : 'bg-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">⭐</span>
                  <span className="text-slate-700 font-medium text-sm">{task.starValue}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <div className="flex items-center gap-4 text-sm text-slate-600">
              {task.assignedTo?.user && (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-slate-300 rounded-full flex items-center justify-center">
                    <span className="text-slate-600 text-xs">👤</span>
                  </div>
                  <span>
                    {task.assignedTo.user.name || task.assignedTo.user.email}
                  </span>
                </div>
              )}
              <div>
                <span className="font-medium">{task.completions.length}</span> completions today
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 