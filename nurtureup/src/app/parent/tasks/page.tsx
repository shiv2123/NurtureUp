'use client'

import { TaskList } from '@/components/parent/TaskList'
import { TaskForge } from '@/components/parent/TaskForge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState, useEffect } from 'react'
import { Sparkles, Target, TrendingUp, Clock } from 'lucide-react'

export default function TasksPage() {
  const [forgeOpen, setForgeOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [children, setChildren] = useState([])

  // Fetch children for task assignment
  useEffect(() => {
    async function fetchChildren() {
      try {
        const res = await fetch('/api/child')
        if (res.ok) {
          const data = await res.json()
          setChildren(data)
        }
      } catch (error) {
        console.error('Failed to fetch children:', error)
      }
    }
    fetchChildren()
  }, [])

  const handleCreateTask = async (taskData: any) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      })

      if (!res.ok) {
        throw new Error('Failed to create task')
      }

      setRefreshKey(k => k + 1)
    } catch (error) {
      console.error('Error creating task:', error)
      throw error
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-gray">Quest Manager</h1>
          <p className="text-black mt-1">
            Create and manage magical quests for your family
          </p>
        </div>
        <Button 
          onClick={() => setForgeOpen(true)}
          className="gap-2"
          size="lg"
        >
          <Sparkles className="w-5 h-5" />
          Open Task Forge
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-sage-green/5 border-sage-green/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sage-green/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-sage-green" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-gray">12</div>
                <div className="text-sm text-black">Active Quests</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-soft-coral/5 border-soft-coral/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-soft-coral/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-soft-coral" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-gray">89%</div>
                <div className="text-sm text-black">Completion Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-sky-blue/5 border-sky-blue/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-blue/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-sky-blue" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-gray">3</div>
                <div className="text-sm text-black">Pending Approval</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-mint-green/5 border-mint-green/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-mint-green/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-mint-green" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-gray">247</div>
                <div className="text-sm text-black">Stars Earned</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Forge Dialog */}
      <TaskForge
        open={forgeOpen}
        onOpenChange={setForgeOpen}
        children={children}
        onCreateTask={handleCreateTask}
      />

      {/* Task List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Current Quests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TaskList key={refreshKey} />
        </CardContent>
      </Card>
    </div>
  )
} 