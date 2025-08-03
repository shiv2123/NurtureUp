'use client'

import { TaskList } from '@/components/parent/TaskList'
import { TaskForge } from '@/components/parent/TaskForge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useState, useEffect } from 'react'
import { Target, Plus, CheckSquare, Clock, Archive, CheckCircle, Calendar, Repeat } from 'lucide-react'

export default function TasksPage() {
  const [forgeOpen, setForgeOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [children, setChildren] = useState([])
  const [activeTab, setActiveTab] = useState('active')

  // Fetch children for task assignment
  useEffect(() => {
    async function fetchChildren() {
      try {
        const res = await fetch('/api/children')
        if (res.ok) {
          const data = await res.json()
          setChildren(data.children || [])
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

  const tabs = [
    { id: 'active', label: 'Active', icon: Target },
    { id: 'scheduled', label: 'Scheduled', icon: Clock },
    { id: 'completed', label: 'Completed', icon: CheckCircle },
    { id: 'archived', label: 'Archived', icon: Archive }
  ]

  return (
    <div className="min-h-screen bg-app-bg">
      {/* Header */}
      <header className="header-glass sticky top-0 z-40">
        <div className="container-modern">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gradient-primary">Task Manager</h1>
              <p className="text-sm text-slate-600">Create and manage family tasks</p>
            </div>
            <Button
              variant="default"
              onClick={() => setForgeOpen(true)}
              size="fab"
              className="fab"
            >
              <Plus className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container-modern pb-20">
        {/* Tab Navigation */}
        <Card className="mb-6 hover-scale">
          <CardContent className="p-1">
            <div className="flex">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab(tab.id)}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Task Forge Dialog */}
        <TaskForge
          open={forgeOpen}
          onOpenChange={setForgeOpen}
          children={children}
          onCreateTask={handleCreateTask}
        />

        {/* Task List */}
        <Card>
          <TaskList key={`${refreshKey}-${activeTab}`} filterType={activeTab} />
        </Card>
      </main>

      {/* Floating Action Button */}
      <Button 
        variant="primary"
        position="bottom-right"
        icon={<Plus className="h-6 w-6" />}
        onClick={() => setForgeOpen(true)}
      />
    </div>
  )
} 