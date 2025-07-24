'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { QuestMeter } from './QuestMeter'
import { ScreenTimeGauge } from './ScreenTimeGauge'
import { CheerCard } from './CheerCard'
import { Users, Plus } from 'lucide-react'

interface Child {
  id: string
  nickname: string
  avatar?: string
  dailyScreenMinutes: number
  bonusScreenMinutes: number
  usedScreenMinutes: number
  assignedTasks: any[]
  user: any
}

interface DashboardWidgetsProps {
  children: Child[]
  pendingTasks?: any[]
}

export function DashboardWidgets({ children, pendingTasks = [] }: DashboardWidgetsProps) {
  const [selectedChild, setSelectedChild] = useState(children[0]?.id)
  const currentChild = children.find(c => c.id === selectedChild)

  if (!currentChild) {
    return (
      <Card className="border-dashed border-2 border-slate-300">
        <CardContent className="text-center py-12">
          <Users className="w-12 h-12 text-black mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-black mb-2">
            No children added yet
          </h3>
          <p className="text-black mb-4">
            Add your first child to start tracking their progress and adventures!
          </p>
          <Button variant="default" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Child
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Calculate today's progress
  const todaysTasks = currentChild.assignedTasks || []
  const completedToday = todaysTasks.filter((task) => {
    // Check if task has completions today
    return task.completions && task.completions.length > 0
  }).length
  
  const progressPercentage = todaysTasks.length > 0
    ? (completedToday / todaysTasks.length) * 100
    : 0

  // Calculate screen time
  const usedMinutes = currentChild.usedScreenMinutes || 0
  const totalMinutes = (currentChild.dailyScreenMinutes || 60) + (currentChild.bonusScreenMinutes || 0)
  const screenTimePercentage = Math.min((usedMinutes / totalMinutes) * 100, 100)

  // Generate achievement message
  const getRecentAchievement = () => {
    if (completedToday > 0) {
      return `Completed ${completedToday} quest${completedToday > 1 ? 's' : ''} today! 🌟`
    }
    if (progressPercentage === 0 && todaysTasks.length > 0) {
      return "Ready for today's adventure! 🚀"
    }
    return "Such a wonderful kid! ❤️"
  }

  return (
    <div className="space-y-6">
      {/* Child Selector */}
      {children.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {children.map((child) => (
            <Button
              key={child.id}
              variant={selectedChild === child.id ? 'default' : 'outline'}
              onClick={() => setSelectedChild(child.id)}
              className="flex items-center gap-2"
              size="sm"
            >
              <span className="text-lg">{child.avatar || '👤'}</span>
              {child.nickname}
            </Button>
          ))}
        </div>
      )}

      {/* Today at a Glance - Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuestMeter
          childName={currentChild.nickname}
          completedTasks={completedToday}
          totalTasks={todaysTasks.length}
          progressPercentage={progressPercentage}
        />

        <ScreenTimeGauge
          usedMinutes={usedMinutes}
          totalMinutes={totalMinutes}
          percentage={screenTimePercentage}
        />

        <CheerCard
          childName={currentChild.nickname}
          recentAchievement={getRecentAchievement()}
          avatar={currentChild.avatar}
        />
      </div>

      {/* Pending Approvals Alert */}
      {pendingTasks.length > 0 && (
        <Card className="border-warning/20 bg-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-warning mb-1">
                  {pendingTasks.length} Task{pendingTasks.length > 1 ? 's' : ''} Awaiting Approval
                </h3>
                <p className="text-sm text-black">
                  Review completed tasks and approve rewards
                </p>
              </div>
              <Button variant="warning" size="sm">
                Review Tasks
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-sage-green/5 border-sage-green/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-sage-green mb-1">
              {children.reduce((acc, child) => 
                acc + (child.assignedTasks?.filter(t => t.completions?.length > 0).length || 0), 0
              )}
            </div>
            <div className="text-sm text-black">Tasks Today</div>
          </CardContent>
        </Card>

        <Card className="bg-soft-coral/5 border-soft-coral/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-soft-coral mb-1">
              {children.length}
            </div>
            <div className="text-sm text-black">Active Kids</div>
          </CardContent>
        </Card>

        <Card className="bg-sky-blue/5 border-sky-blue/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-sky-blue mb-1">
              {Math.round(children.reduce((acc, child) => 
                acc + ((child.usedScreenMinutes || 0) / ((child.dailyScreenMinutes || 60) + (child.bonusScreenMinutes || 0)) * 100), 0
              ) / children.length) || 0}%
            </div>
            <div className="text-sm text-black">Avg Screen Time</div>
          </CardContent>
        </Card>

        <Card className="bg-mint-green/5 border-mint-green/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-mint-green mb-1">
              97%
            </div>
            <div className="text-sm text-black">Family Happiness</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}