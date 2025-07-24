'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Trophy, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuestMeterProps {
  childName: string
  completedTasks: number
  totalTasks: number
  progressPercentage: number
}

export function QuestMeter({ 
  childName, 
  completedTasks, 
  totalTasks, 
  progressPercentage 
}: QuestMeterProps) {
  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-success'
    if (percentage >= 60) return 'bg-warning'
    return 'bg-sage-green'
  }

  const getProgressMessage = (percentage: number) => {
    if (percentage === 100) return "All quests complete! 🎉"
    if (percentage >= 80) return "Almost there! 💪"
    if (percentage >= 50) return "Great progress! ⭐"
    if (percentage > 0) return "Quest adventure begins! 🚀"
    return "Ready for adventure! ✨"
  }

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-sage-green/5 to-sage-green/10 border-sage-green/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sage-green">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Quest Meter
          </div>
          {progressPercentage === 100 && (
            <Trophy className="w-5 h-5 text-warning animate-bounce-soft" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-black mb-1">
            {completedTasks}/{totalTasks}
          </div>
          <div className="text-sm font-medium text-black">
            {childName}'s Daily Quests
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-black">Progress</span>
            <span className="font-medium text-black">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-3"
            indicatorClassName={cn(
              getProgressColor(progressPercentage),
              'transition-all duration-500 ease-out'
            )}
          />
        </div>

        <div className="text-center">
          <p className="text-sm font-medium text-black">
            {getProgressMessage(progressPercentage)}
          </p>
        </div>

        {/* XP Bar Visualization */}
        <div className="bg-white/50 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-black">XP Progress</span>
            <span className="text-xs font-bold text-sage-green">+{completedTasks * 5} XP</span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(totalTasks, 10) }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-2 flex-1 rounded-full transition-all duration-300',
                  i < completedTasks ? 'bg-sage-green' : 'bg-slate-200'
                )}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}