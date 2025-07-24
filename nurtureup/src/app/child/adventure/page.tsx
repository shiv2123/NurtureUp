import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { VirtualPetWidget } from '@/components/child/VirtualPetWidget'
import { WalletDisplay } from '@/components/child/WalletDisplay'
import { QuestList } from '@/components/child/QuestList'
import { ScreenTimeTracker } from '@/components/child/ScreenTimeTracker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, Trophy, Target, Coins, Zap } from 'lucide-react'

export default async function AdventurePage() {
  const session = await getServerSession(authOptions)
  
  // Fetch child data
  const child = await prisma.child.findUnique({
    where: { userId: session!.user.id },
    include: {
      user: true,
      assignedTasks: {
        where: { isActive: true },
        include: {
          completions: {
            where: {
              completedAt: {
                gte: new Date(new Date().setHours(0, 0, 0, 0))
              }
            }
          }
        }
      },
      earnedBadges: {
        include: { badge: true },
        orderBy: { earnedAt: 'desc' },
        take: 3
      },
      pet: true
    }
  })

  if (!child) {
    return <div>Child profile not found</div>
  }

  const todaysCompletedTasks = child.assignedTasks.filter(task => 
    task.completions.length > 0
  ).length

  // Prepare screen time data
  const screenTimeData = {
    dailyLimit: child.dailyScreenMinutes,
    bonusMinutes: child.bonusScreenMinutes,
    usedToday: child.usedScreenMinutes,
    lastReset: child.lastScreenReset.toISOString(),
    isActive: false // This would be managed by the component
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Hero Welcome Panel */}
      <div className="bg-gradient-to-r from-soft-coral via-sunny-yellow to-mint-green rounded-3xl p-6 text-center relative overflow-hidden">
        <div className="relative z-10">
          <div className="text-4xl mb-2">{child.avatar || '🌟'}</div>
          <h1 className="text-2xl font-bold text-white mb-2 font-child">
            Welcome back, {child.nickname}!
          </h1>
          <p className="text-white/90">
            Ready for today's magical adventures?
          </p>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-soft-coral/20 to-mint-green/20" />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-sage-green/10 border-sage-green/20">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-sage-green/20 flex items-center justify-center mx-auto mb-2">
              <Target className="w-6 h-6 text-sage-green" />
            </div>
            <div className="text-2xl font-bold text-slate-gray">{todaysCompletedTasks}</div>
            <div className="text-sm text-black">Quests Done</div>
          </CardContent>
        </Card>

        <Card className="bg-warning/10 border-warning/20">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center mx-auto mb-2">
              <Star className="w-6 h-6 text-warning" />
            </div>
            <div className="text-2xl font-bold text-slate-gray">{child.totalStars}</div>
            <div className="text-sm text-black">Total Stars</div>
          </CardContent>
        </Card>

        <Card className="bg-mint-green/10 border-mint-green/20">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-mint-green/20 flex items-center justify-center mx-auto mb-2">
              <Coins className="w-6 h-6 text-mint-green" />
            </div>
            <div className="text-2xl font-bold text-slate-gray">{child.currentCoins}</div>
            <div className="text-sm text-black">Coins</div>
          </CardContent>
        </Card>

        <Card className="bg-sky-blue/10 border-sky-blue/20">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-sky-blue/20 flex items-center justify-center mx-auto mb-2">
              <Zap className="w-6 h-6 text-sky-blue" />
            </div>
            <div className="text-2xl font-bold text-slate-gray">{child.currentStreak}</div>
            <div className="text-sm text-black">Day Streak</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Quests */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-child">
                <Target className="w-5 h-5" />
                Today's Quests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {child.assignedTasks.slice(0, 4).map((task) => (
                  <div 
                    key={task.id} 
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        task.completions.length > 0 ? 'bg-success text-white' : 'bg-slate-200'
                      }`}>
                        {task.completions.length > 0 ? '✓' : '○'}
                      </div>
                      <div>
                        <div className="font-medium text-slate-gray">{task.title}</div>
                        <div className="text-sm text-black">
                          {Array.from({ length: task.starValue }).map((_, i) => (
                            <span key={i}>⭐</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {child.assignedTasks.length === 0 && (
                  <div className="text-center py-8 text-black">
                    <p>No quests available right now!</p>
                    <p className="text-sm">Check back later for new adventures.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Pet & Stats */}
        <div className="space-y-6">
          {/* Virtual Pet */}
          <VirtualPetWidget viewMode="child" />

          {/* Screen Time Tracker */}
          <ScreenTimeTracker initialData={screenTimeData} />

          {/* Recent Badges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-child">
                <Trophy className="w-5 h-5" />
                Recent Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              {child.earnedBadges.length > 0 ? (
                <div className="space-y-3">
                  {child.earnedBadges.map((earnedBadge) => (
                    <div key={earnedBadge.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="text-2xl">{earnedBadge.badge.icon}</div>
                      <div>
                        <div className="font-medium text-slate-gray">{earnedBadge.badge.name}</div>
                        <div className="text-sm text-black">{earnedBadge.badge.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="text-4xl mb-2">🏆</div>
                  <p className="text-black text-sm">
                    Complete quests to earn your first badge!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Wallet Preview */}
          <Card className="bg-gradient-to-br from-warning/10 to-mint-green/10 border-warning/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl mb-2">💰</div>
              <div className="text-2xl font-bold text-slate-gray mb-1">{child.currentCoins}</div>
              <div className="text-sm text-black mb-3">Coins Available</div>
              <Button variant="warning" size="sm" className="w-full">
                <Coins className="w-4 h-4 mr-2" />
                Visit Store
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 