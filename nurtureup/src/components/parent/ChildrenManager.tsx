'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AddChildDialog } from './AddChildDialog'
import { 
  Users, 
  Plus, 
  Star, 
  Trophy, 
  Calendar,
  Settings
} from 'lucide-react'
import { calculateAge, formatDate } from '@/lib/utils'
import type { Child, User, Task, TaskCompletion, Badge as BadgeType, BadgeEarned } from '@prisma/client'

interface ChildWithDetails extends Child {
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
  assignedTasks: (Task & {
    completions: TaskCompletion[]
  })[]
  earnedBadges: (BadgeEarned & {
    badge: BadgeType
  })[]
}

interface ChildrenManagerProps {
  children: ChildWithDetails[]
}

export function ChildrenManager({ children }: ChildrenManagerProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)

  const handleAddChild = async (childData: any) => {
    try {
      const response = await fetch('/api/children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(childData)
      })

      if (!response.ok) {
        throw new Error('Failed to add child')
      }

      // Refresh the page to show the new child
      window.location.reload()
    } catch (error) {
      console.error('Error adding child:', error)
      alert('Failed to add child. Please try again.')
    }
  }

  if (children.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 mx-auto text-black mb-4" />
        <h3 className="text-xl font-semibold text-black mb-2">
          No children added yet
        </h3>
        <p className="text-black mb-6 max-w-md mx-auto">
          Add your first child to start tracking their progress, assigning tasks, and celebrating milestones together.
        </p>
        <Button onClick={() => setShowAddDialog(true)} size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Add Your First Child
        </Button>

        <AddChildDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onAddChild={handleAddChild}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Child
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children.map((child) => {
          const age = calculateAge(child.birthDate)
          const totalTasks = child.assignedTasks.length
          const completedTasks = child.assignedTasks.filter(
            task => task.completions.length > 0
          ).length
          const progressPercentage = totalTasks > 0 
            ? (completedTasks / totalTasks) * 100 
            : 0

          return (
            <Card key={child.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-soft-coral to-sunny-yellow flex items-center justify-center text-2xl">
                      {child.avatar || '👤'}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{child.nickname}</CardTitle>
                      <p className="text-sm text-black">
                        Age {age} • Level {child.level}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-sunny-yellow">
                      {child.totalStars}
                    </div>
                    <div className="text-xs text-black">Stars</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-mint-green">
                      {child.currentCoins}
                    </div>
                    <div className="text-xs text-black">Coins</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-sky-blue">
                      {child.currentStreak}
                    </div>
                    <div className="text-xs text-black">Streak</div>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-black">Today's Progress</span>
                    <span className="font-medium">
                      {completedTasks}/{totalTasks} tasks
                    </span>
                  </div>
                  <Progress 
                    value={progressPercentage} 
                    className="h-2"
                    indicatorClassName="bg-sage-green"
                  />
                </div>

                {/* Recent Badges */}
                {child.earnedBadges.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-black mb-2">
                      Recent Badges
                    </div>
                    <div className="flex space-x-2">
                      {child.earnedBadges.map((earned) => (
                        <div
                          key={earned.id}
                          className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-sm"
                          title={earned.badge.name}
                        >
                          {earned.badge.icon}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Member Since */}
                <div className="text-xs text-black flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  Member since {formatDate(child.createdAt)}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <AddChildDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAddChild={handleAddChild}
      />
    </div>
  )
}