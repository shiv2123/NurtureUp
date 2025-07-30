'use client'

import { TaskList } from '@/components/parent/TaskList'
import { TaskForge } from '@/components/parent/TaskForge'
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
      // Transform the data to match API expectations
      const transformedData = {
        ...taskData,
        // Convert recurringDays to recurringRule format
        recurringRule: taskData.isRecurring && taskData.recurringDays ? {
          type: 'weekly' as const,
          days: taskData.recurringDays
        } : undefined
      }
      
      // Remove the recurringDays field since we've transformed it
      delete transformedData.recurringDays

      console.log('Sending task data:', transformedData)

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedData),
      })

      if (!res.ok) {
        let errorMessage = 'Failed to create task'
        try {
          const errorData = await res.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          // If response is not JSON, use status text or default message
          errorMessage = res.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      setRefreshKey(k => k + 1)
    } catch (error) {
      console.error('Error creating task:', error)
      throw error
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Clean Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-800 mb-2">Task Manager</h1>
            <p className="text-slate-600 text-lg">
              Create and manage tasks for your family
            </p>
          </div>
          <button 
            onClick={() => setForgeOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Sparkles className="w-5 h-5 mr-2 inline" />
            Create Task
          </button>
        </div>


        {/* Task Forge Dialog */}
        <TaskForge
          open={forgeOpen}
          onOpenChange={setForgeOpen}
          children={children}
          onCreateTask={handleCreateTask}
        />

        {/* Task List */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-800">Current Tasks</h2>
          </div>
          <TaskList key={refreshKey} />
        </div>
      </div>
    </div>
  )
} 