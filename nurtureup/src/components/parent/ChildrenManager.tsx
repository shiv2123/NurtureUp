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
      <div className="card-floating p-12 text-center">
        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Users className="w-12 h-12 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">
          No children added yet
        </h3>
        <p className="text-white/70 mb-8 max-w-md mx-auto text-lg">
          Add your first child to start tracking their progress, assigning tasks, and celebrating milestones together.
        </p>
        <button 
          onClick={() => setShowAddDialog(true)} 
          className="btn-modern px-8 py-4 text-white font-semibold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Your First Child
        </button>

        <AddChildDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onAddChild={handleAddChild}
        />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button 
          onClick={() => setShowAddDialog(true)}
          className="btn-modern px-6 py-3 text-white font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Child
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
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
            <div key={child.id} className="card-floating p-6 hover:scale-105 transition-all duration-300">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-400 to-violet-400 flex items-center justify-center text-3xl">
                    {child.avatar || '👤'}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{child.nickname}</h3>
                    <p className="text-white/70">
                      Age {age} • Level {child.level}
                    </p>
                  </div>
                </div>
                <button className="btn-modern p-2 text-white/80 hover:text-white">
                  <Settings className="w-4 h-4" />
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-400 mb-1">
                    {child.totalStars}
                  </div>
                  <div className="text-xs text-white/70 font-medium">Stars</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-400 mb-1">
                    {child.currentCoins}
                  </div>
                  <div className="text-xs text-white/70 font-medium">Coins</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    {child.currentStreak}
                  </div>
                  <div className="text-xs text-white/70 font-medium">Streak</div>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-white font-medium">Today's Progress</span>
                  <span className="text-white/70 font-medium">
                    {completedTasks}/{totalTasks} tasks
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-3 rounded-full transition-all duration-300" 
                    style={{width: `${progressPercentage}%`}}
                  ></div>
                </div>
              </div>

              {/* Recent Badge */}
              {child.earnedBadges.length > 0 && (
                <div className="mb-6">
                  <div className="text-sm font-medium text-white mb-3">
                    Recent Badges
                  </div>
                  <div className="flex space-x-3">
                    {child.earnedBadges.slice(0, 3).map((earned) => (
                      <div
                        key={earned.id}
                        className="w-10 h-10 rounded-full bg-yellow-500/20 border border-yellow-400/30 flex items-center justify-center text-lg"
                        title={earned.badge.name}
                      >
                        {earned.badge.icon}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Member Since */}
              <div className="text-xs text-white/60 flex items-center pt-4 border-t border-white/20">
                <Calendar className="w-3 h-3 mr-2" />
                Member since {formatDate(child.createdAt)}
              </div>
            </div>
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