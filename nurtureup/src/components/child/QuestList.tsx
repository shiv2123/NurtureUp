'use client'

import { useEffect, useState } from 'react'
import { QuestCard } from './QuestCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useNotifications } from '@/components/providers/NotificationProvider'

interface Quest {
  id: string
  title: string
  description?: string
  difficulty: number
  starValue: number
  requiresProof: boolean
  dueDate?: string
}

export function QuestList() {
  const [quests, setQuests] = useState<Quest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const { notifications } = useNotifications()

  useEffect(() => {
    async function fetchQuests() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/child/quests')
        if (!res.ok) throw new Error('Failed to fetch quests')
        const data = await res.json()
        setQuests(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchQuests()
  }, [refreshKey])

  // Listen for new task notifications and refresh quest list
  useEffect(() => {
    const newTaskNotifications = notifications.filter(
      n => n.type === 'new_task' && n.data?.isNewTask
    )
    
    if (newTaskNotifications.length > 0) {
      // Refresh quest list when new tasks are available
      setRefreshKey(k => k + 1)
    }
  }, [notifications])

  async function handleComplete(taskId: string, proofImage?: string) {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proofImage })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to complete quest')
      }
      setRefreshKey(k => k + 1)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center text-black py-8">Loading quests...</div>
  }
  if (error) {
    return <div className="text-center text-error py-8">{error}</div>
  }
  if (quests.length === 0) {
    return <div className="rounded-2xl border border-slate-200 bg-white shadow-soft p-6 text-center text-black">No quests for today! Check back soon or ask your grown-up for a new quest.</div>
  }

  return (
    <div className="space-y-4">
      {quests.map((quest) => (
        <QuestCard key={quest.id} task={quest} onComplete={handleComplete} />
      ))}
    </div>
  )
} 