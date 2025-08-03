'use client'

import { useSession } from 'next-auth/react'
import { VirtualPetWidget } from '@/components/child/VirtualPetWidget'
import { WalletDisplay } from '@/components/child/WalletDisplay' 
import { QuestList } from '@/components/child/QuestList'
import { QuestActions } from '@/components/child/QuestActions'
import { ScreenTimeTracker } from '@/components/child/ScreenTimeTracker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useOptimisticTasks } from '@/hooks/useOptimisticTasks'
import { Star, Trophy, Target, Coins, Zap, Sparkles, Award, Wifi, WifiOff } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function AdventurePage() {
  const { data: session } = useSession()
  const { tasks, isLoading, error, isConnected } = useOptimisticTasks()
  const [childData, setChildData] = useState<any>(null)
  const [loadingChild, setLoadingChild] = useState(true)

  // Fetch child profile data
  useEffect(() => {
    if (!session?.user?.id) return

    const fetchChildData = async () => {
      try {
        const response = await fetch('/api/child/profile')
        if (response.ok) {
          const data = await response.json()
          setChildData(data)
        }
      } catch (error) {
        console.error('Failed to fetch child data:', error)
      } finally {
        setLoadingChild(false)
      }
    }

    fetchChildData()
  }, [session?.user?.id])

  if (!session) {
    return <div>Please log in</div>
  }

  if (loadingChild) {
    return <div>Loading...</div>
  }

  if (!childData) {
    return <div>Child profile not found</div>
  }

  const todaysCompletedTasks = tasks.filter(task => 
    task.completions && task.completions.length > 0
  ).length

  // Prepare screen time data
  const screenTimeData = {
    dailyLimit: childData.dailyScreenMinutes,
    bonusMinutes: childData.bonusScreenMinutes,
    usedToday: childData.usedScreenMinutes,
    lastReset: childData.lastScreenReset,
    isActive: false
  }

  // Time-based greeting
  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening'
  
  // Adventure title based on streak
  const adventureTitle = childData.currentStreak >= 7 ? 'the Legendary' : 
                        childData.currentStreak >= 5 ? 'the Brave' : 
                        childData.currentStreak >= 3 ? 'the Explorer' : 'the Adventurer'

  return (
    <div className="min-h-screen bg-app-bg">
      <div className="container-modern space-y-8">
        {/* Connection Status Bar */}
        {!isConnected && (
          <Card className="bg-card-amber hover-scale">
            <CardContent className="flex items-center gap-3">
              <WifiOff className="w-5 h-5 text-amber-600" />
              <div>
                <div className="font-semibold text-amber-700">You're offline</div>
                <div className="text-sm text-slate-600">Your progress will sync when you reconnect</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hero Welcome */}
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl hover-glow">
            <span className="text-4xl">{childData.avatar || '🌟'}</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gradient-primary mb-4">
            {greeting}, {childData.nickname}!
          </h1>
          
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg hover-scale">
            <Star className="w-5 h-5 text-amber-500" />
            <span className="font-bold text-slate-800">{childData.totalStars} stars collected</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
          <Card className="bg-card-emerald hover-scale hover-glow text-center">
            <CardContent>
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-gradient-primary">{todaysCompletedTasks}</div>
              <div className="text-sm font-medium text-slate-600">Tasks Done</div>
            </CardContent>
          </Card>

          <Card className="bg-card-amber hover-scale hover-glow text-center">
            <CardContent>
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Coins className="w-6 h-6 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-gradient-accent">{childData.currentCoins}</div>
              <div className="text-sm font-medium text-slate-600">Coins</div>
            </CardContent>
          </Card>
        </div>

      {/* Active Quests */}
      {tasks.filter(task => !task.completions || task.completions.length === 0).length > 0 && (
        <Card variant="elevated" stage="child">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Today's Magical Quests</CardTitle>
                <p className="text-sm text-neutral-600">Complete these to earn rewards!</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasks.filter(task => !task.completions || task.completions.length === 0).map((task) => (
              <Card key={task.id} variant="flat" stage="child">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-neutral-900 mb-2">{task.title}</h3>
                      {task.description && (
                        <p className="text-neutral-600 text-sm mb-3">{task.description}</p>
                      )}
                      <div className="flex items-center gap-2 bg-secondary text-neutral-900 px-3 py-1 rounded-full w-fit">
                        <Star className="w-3 h-3" />
                        <span className="font-semibold text-xs">{task.starValue} magic stars</span>
                      </div>
                      {/* Show optimistic loading state */}
                      {task._optimistic?.isCompleting && (
                        <div className="flex items-center gap-2 mt-2 text-primary text-sm">
                          <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                          <span>Completing quest...</span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <QuestActions 
                        taskId={task.id}
                        taskTitle={task.title}
                        task={task}
                        requiresProof={task.requiresProof}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Completed Quests */}
      {tasks.filter(task => task.completions && task.completions.length > 0).length > 0 && (
        <Card variant="elevated" stage="child" className="border-success/20">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-success" />
              </div>
              <div>
                <CardTitle className="text-xl text-success">Victory Hall</CardTitle>
                <p className="text-sm text-neutral-600">Today's completed quests</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks.filter(task => task.completions && task.completions.length > 0).map((task) => (
              <Card key={task.id} variant="flat" stage="child" className="bg-success/5 border-success/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-success/10 border-2 border-success/30 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-success" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-neutral-900 line-through opacity-75">
                        {task.title}
                      </div>
                      <div className="text-success text-sm">
                        {task.completions?.[0]?.isApproved 
                          ? 'Quest completed! ✨' 
                          : 'Waiting for approval... ⏳'
                        }
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-secondary text-neutral-900 px-3 py-1 rounded-full">
                      <Star className="w-3 h-3" />
                      <span className="font-semibold text-xs">{task.starValue}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* No Quests Message */}
      {tasks.length === 0 && !isLoading && (
        <Card variant="elevated" stage="child">
          <CardContent className="text-center py-12">
            <div className="w-20 h-20 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🎯</span>
            </div>
            <CardTitle className="text-xl mb-3">No quests today!</CardTitle>
            <p className="text-neutral-600">Your next magical adventure is being prepared... ✨</p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card variant="elevated" stage="child">
          <CardContent className="text-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading your quests...</p>
          </CardContent>
        </Card>
      )}

      {/* Additional Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Virtual Pet Companion */}
        <Card variant="elevated" stage="child">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="text-2xl">🐾</span>
              Your Pet Companion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VirtualPetWidget viewMode="child" />
          </CardContent>
        </Card>

        {/* Screen Time Magic */}
        <Card variant="elevated" stage="child">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="text-2xl">⏰</span>
              Screen Time Magic
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScreenTimeTracker initialData={screenTimeData} />
          </CardContent>
        </Card>
      </div>

      {/* Achievement Gallery */}
      <Card variant="elevated" stage="child">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <CardTitle className="text-xl">Achievement Gallery</CardTitle>
              <p className="text-sm text-neutral-600">Your earned badges & rewards</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {childData.earnedBadges && childData.earnedBadges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {childData.earnedBadges.map((earnedBadge: any) => (
                <Card key={earnedBadge.id} variant="flat" stage="child" interactive>
                  <CardContent className="text-center p-4">
                    <div className="text-3xl mb-3">{earnedBadge.badge.icon}</div>
                    <div className="font-semibold text-neutral-900 mb-1 text-sm">{earnedBadge.badge.name}</div>
                    <div className="text-xs text-neutral-600">{earnedBadge.badge.description}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🏆</span>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Ready for your first badge?
              </h3>
              <p className="text-sm text-neutral-600">
                Complete quests to unlock amazing achievements!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Treasure Vault */}
      <Card variant="elevated" stage="child" className="bg-warning/5 border-warning/20">
        <CardContent className="text-center py-8">
          <div className="w-16 h-16 bg-warning/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">💰</span>
          </div>
          <div className="text-3xl font-bold text-neutral-900 mb-2">{childData.currentCoins}</div>
          <div className="text-neutral-600 mb-6">Golden Coins in your treasure vault</div>
          <Button size="lg" className="bg-gradient-to-r from-warning to-warning/80 hover:from-warning/90 hover:to-warning/70">
            <Coins className="w-4 h-4 mr-2" />
            Visit Magic Store
          </Button>
        </CardContent>
      </Card>
    </div>
    </div>
  )
} 