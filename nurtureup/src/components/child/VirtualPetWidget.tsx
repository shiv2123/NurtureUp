'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Heart, 
  Zap, 
  Apple, 
  Gamepad2, 
  Crown,
  Sparkles,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface VirtualPet {
  id: string
  name: string
  type: string
  mood: string
  level: number
  xp: number
  happiness: number
  energy: number
  lastFed: string
  lastPlayed: string
  accessories: string
  color: string
  careSchedule?: {
    canFeedNow: boolean
    canPlayNow: boolean
    nextFeeding: string | null
    nextPlay: string | null
  }
}

const petEmojis = {
  dragon: '🐲',
  unicorn: '🦄',
  robot: '🤖',
  cat: '🐱',
  dog: '🐶'
}

const moodStates = {
  happy: { emoji: '😊', color: 'text-success', bg: 'bg-success/10' },
  neutral: { emoji: '😐', color: 'text-warning', bg: 'bg-warning/10' },
  sad: { emoji: '😢', color: 'text-error', bg: 'bg-error/10' },
  sleeping: { emoji: '😴', color: 'text-black', bg: 'bg-slate-100' },
  excited: { emoji: '🤩', color: 'text-mint-green', bg: 'bg-mint-green/10' }
}

interface VirtualPetWidgetProps {
  childId?: string
  viewMode?: 'child' | 'parent'
}

export function VirtualPetWidget({ childId, viewMode = 'child' }: VirtualPetWidgetProps) {
  const [pet, setPet] = useState<VirtualPet | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (childId) {
      fetchPet()
    }
  }, [childId])

  const fetchPet = async () => {
    try {
      const res = await fetch(`/api/child/pet`)
      if (res.ok) {
        const data = await res.json()
        setPet(data)
      }
    } catch (error) {
      console.error('Failed to fetch pet:', error)
    } finally {
      setLoading(false)
    }
  }

  // Helper function to format time remaining
  const formatTimeRemaining = useCallback((timeString: string | null) => {
    if (!timeString) return null
    
    const targetTime = new Date(timeString)
    const now = new Date()
    const diffMs = targetTime.getTime() - now.getTime()
    
    if (diffMs <= 0) return 'Available now!'
    
    const diffMinutes = Math.ceil(diffMs / (1000 * 60))
    const hours = Math.floor(diffMinutes / 60)
    const minutes = diffMinutes % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }, [])

  // Refresh pet data periodically
  useEffect(() => {
    if (!pet) return
    
    const interval = setInterval(() => {
      fetchPet()
    }, 60000) // Refresh every minute
    
    return () => clearInterval(interval)
  }, [pet])

  const handleAction = async (action: 'feed' | 'play') => {
    if (!pet) return
    
    // Check if action is available based on care schedule
    const canPerformAction = action === 'feed' 
      ? pet.careSchedule?.canFeedNow 
      : pet.careSchedule?.canPlayNow
    
    if (!canPerformAction) {
      const nextAvailable = action === 'feed' 
        ? formatTimeRemaining(pet.careSchedule?.nextFeeding || null)
        : formatTimeRemaining(pet.careSchedule?.nextPlay || null)
      
      alert(`${pet.name} ${action === 'feed' ? "isn't hungry" : "is still tired"} yet! Try again in ${nextAvailable}`)
      return
    }
    
    try {
      setActionLoading(action)
      const res = await fetch(`/api/child/pet/${action}`, {
        method: 'POST'
      })
      
      if (res.ok) {
        const updatedPet = await res.json()
        setPet(updatedPet)
      } else {
        const errorData = await res.json()
        alert(errorData.error || `Failed to ${action} pet`)
      }
    } catch (error) {
      console.error(`Failed to ${action} pet:`, error)
      alert(`Failed to ${action} pet. Please try again.`)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-32 bg-slate-200 rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  if (!pet) {
    return (
      <Card className="border-2 border-dashed border-slate-300">
        <CardContent className="text-center py-8">
          <div className="text-4xl mb-4">🥚</div>
          <h3 className="font-bold text-black mb-2">Your Pet is Waiting!</h3>
          <p className="text-sm text-black mb-4">
            Complete your first quest to unlock your virtual companion
          </p>
          {viewMode === 'child' && (
            <Button variant="coral" size="sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Complete Quest
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  const moodState = moodStates[pet.mood as keyof typeof moodStates] || moodStates.neutral
  const petEmoji = petEmojis[pet.type as keyof typeof petEmojis] || '🐾'
  const xpProgress = (pet.xp % 100) // Assuming each level needs 100 XP
  const accessories = pet.accessories?.split(',').filter(Boolean) || []

  const getHappinessLevel = (happiness: number) => {
    if (happiness >= 80) return { label: 'Thriving', color: 'text-success' }
    if (happiness >= 60) return { label: 'Happy', color: 'text-mint-green' }
    if (happiness >= 40) return { label: 'Okay', color: 'text-warning' }
    return { label: 'Needs Care', color: 'text-error' }
  }

  const getEnergyLevel = (energy: number) => {
    if (energy >= 80) return { label: 'Energetic', color: 'text-sky-blue' }
    if (energy >= 60) return { label: 'Active', color: 'text-mint-green' }
    if (energy >= 40) return { label: 'Tired', color: 'text-warning' }
    return { label: 'Exhausted', color: 'text-error' }
  }

  const happinessLevel = getHappinessLevel(pet.happiness)
  const energyLevel = getEnergyLevel(pet.energy)

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-soft-coral/5 to-sunny-yellow/5 border-soft-coral/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl">{petEmoji}</div>
            <div>
              <div className="font-bold text-black">{pet.name}</div>
              <div className="text-sm text-black capitalize">
                Level {pet.level} {pet.type}
              </div>
            </div>
          </div>
          <div className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center',
            moodState.bg
          )}>
            <span className="text-2xl">{moodState.emoji}</span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Pet Display Area */}
        <div className="bg-white/60 rounded-2xl p-6 text-center relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-2 left-2">
            {accessories.includes('sparkles') && (
              <Sparkles className="w-4 h-4 text-warning animate-pulse" />
            )}
          </div>
          <div className="absolute top-2 right-2">
            {accessories.includes('crown') && (
              <Crown className="w-4 h-4 text-warning" />
            )}
          </div>

          {/* Main pet display */}
          <div className="text-6xl mb-2 animate-bounce-soft">
            {petEmoji}
          </div>
          
          <div className={cn('text-sm font-medium', moodState.color)}>
            Feeling {pet.mood}
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-3">
          {/* XP Progress */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-black">XP Progress</span>
              <span className="font-medium text-black">{xpProgress}/100</span>
            </div>
            <Progress 
              value={xpProgress} 
              className="h-2"
              indicatorClassName="bg-mint-green"
            />
          </div>

          {/* Happiness */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-error" />
                <span className="text-black">Happiness</span>
              </div>
              <span className={cn('font-medium', happinessLevel.color)}>
                {happinessLevel.label}
              </span>
            </div>
            <Progress 
              value={pet.happiness} 
              className="h-2"
              indicatorClassName="bg-error"
            />
          </div>

          {/* Energy */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-sky-blue" />
                <span className="text-black">Energy</span>
              </div>
              <span className={cn('font-medium', energyLevel.color)}>
                {energyLevel.label}
              </span>
            </div>
            <Progress 
              value={pet.energy} 
              className="h-2"
              indicatorClassName="bg-sky-blue"
            />
          </div>
        </div>

        {/* Action Buttons */}
        {viewMode === 'child' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="coral"
                size="sm"
                onClick={() => handleAction('feed')}
                disabled={!!actionLoading || !pet.careSchedule?.canFeedNow}
                isLoading={actionLoading === 'feed'}
                className="gap-2"
              >
                <Apple className="w-4 h-4" />
                Feed
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleAction('play')}
                disabled={!!actionLoading || !pet.careSchedule?.canPlayNow}
                isLoading={actionLoading === 'play'}
                className="gap-2"
              >
                <Gamepad2 className="w-4 h-4" />
                Play
              </Button>
            </div>
            
            {/* Care Schedule Info */}
            {pet.careSchedule && (!pet.careSchedule.canFeedNow || !pet.careSchedule.canPlayNow) && (
              <div className="bg-sky-blue/10 rounded-lg p-3">
                <div className="text-sm">
                  <div className="font-medium text-sky-blue mb-1">Next Care Times</div>
                  <div className="space-y-1 text-black text-xs">
                    {!pet.careSchedule.canFeedNow && (
                      <div className="flex items-center justify-between">
                        <span>🍎 Next feeding:</span>
                        <span className="font-medium">
                          {formatTimeRemaining(pet.careSchedule.nextFeeding)}
                        </span>
                      </div>
                    )}
                    {!pet.careSchedule.canPlayNow && (
                      <div className="flex items-center justify-between">
                        <span>🎮 Next play:</span>
                        <span className="font-medium">
                          {formatTimeRemaining(pet.careSchedule.nextPlay)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Care Tips */}
        {viewMode === 'child' && (pet.happiness < 60 || pet.energy < 60) && (
          <div className="bg-warning/10 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Heart className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium text-warning mb-1">Pet Care Tip</div>
                <div className="text-black">
                  {pet.happiness < 60 && pet.energy < 60 
                    ? `${pet.name} needs both food and playtime!`
                    : pet.happiness < 60 
                    ? `${pet.name} is feeling lonely. Try playing together!`
                    : `${pet.name} is getting tired. Some food would help!`
                  }
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Level Up Celebration */}
        {pet.xp >= 95 && (
          <div className="bg-success/10 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium text-success mb-1">Almost Level Up!</div>
                <div className="text-black">
                  Just {100 - (pet.xp % 100)} more XP to reach level {pet.level + 1}!
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}