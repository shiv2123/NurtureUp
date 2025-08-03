'use client'

import { useEffect, useState } from 'react'
import { useNotifications } from '@/components/providers/NotificationProvider'
import { Star, User, Clock } from 'lucide-react'


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

interface TaskListProps {
  filterType?: string
}

export function TaskList({ filterType = 'active' }: TaskListProps) {
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
        const res = await fetch(`/api/tasks?filter=${filterType}`)
        if (!res.ok) throw new Error('Failed to fetch tasks')
        const data = await res.json()
        setTasks(data.tasks || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchTasks()
  }, [refreshKey, filterType])

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
    return (
      <Card variant="glass">
        <CardContent className="text-center py-12">
          <div className="text-primary">Loading tasks...</div>
        </CardContent>
      </Card>
    )
  }
  if (error) {
    return (
      <Card variant="elevated">
        <CardContent className="text-center py-12">
          <div className="text-red-600">{error}</div>
        </CardContent>
      </Card>
    )
  }
  if (tasks.length === 0) {
    return (
      <Card variant="interactive">
        <CardContent className="text-center py-16">
          <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📝</span>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">No tasks yet</h3>
          <p className="text-muted-foreground">Start by creating your first family task.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.id} variant="interactive">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground mb-2">{task.title}</h3>
                {task.description && (
                  <p className="text-muted-foreground mb-4">{task.description}</p>
                )}
                
                <div className="flex items-center gap-4">
                  {task.category && (
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      {task.category}
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">Difficulty:</span>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i < task.difficulty ? 'bg-orange-400' : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-yellow-100 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 text-yellow-600" />
                    <span className="text-yellow-700 font-semibold text-sm">{task.starValue}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-6 text-sm">
                {task.assignedTo?.user && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span className="text-foreground font-medium">
                      {task.assignedTo.user.name || task.assignedTo.user.email}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    <span className="font-semibold text-foreground">{task.completions.length}</span> completions today
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 