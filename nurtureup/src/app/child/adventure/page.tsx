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
    <div className="py-6 space-y-8">
      {/* Hero Welcome Panel */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 text-center relative overflow-hidden shadow-lg">
        <div className="relative z-10">
          <div className="text-5xl mb-3">{child.avatar || '🌟'}</div>
          <h1 className="text-3xl font-bold text-white mb-3 font-child">
            Welcome back, {child.nickname}!
          </h1>
          <p className="text-white/90 text-lg font-child">
            Ready for today's magical adventures?
          </p>
        </div>
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-green-50 border-green-200 shadow-sm">
          <CardContent className="p-5 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 font-child">{todaysCompletedTasks}</div>
            <div className="text-sm text-gray-600 font-child">Quests Done</div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200 shadow-sm">
          <CardContent className="p-5 text-center">
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-3">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 font-child">{child.totalStars}</div>
            <div className="text-sm text-gray-600 font-child">Total Stars</div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200 shadow-sm">
          <CardContent className="p-5 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
              <Coins className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 font-child">{child.currentCoins}</div>
            <div className="text-sm text-gray-600 font-child">Coins</div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200 shadow-sm">
          <CardContent className="p-5 text-center">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 font-child">{child.currentStreak}</div>
            <div className="text-sm text-gray-600 font-child">Day Streak</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Quests */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
              <CardTitle className="flex items-center gap-2 font-child text-gray-900 text-lg">
                <Target className="w-5 h-5 text-blue-600" />
                Today's Quests
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {child.assignedTasks.slice(0, 4).map((task) => (
                  <div 
                    key={task.id} 
                    className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                        task.completions.length > 0 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {task.completions.length > 0 ? '✓' : '○'}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 font-child">{task.title}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {Array.from({ length: task.starValue }).map((_, i) => (
                            <span key={i} className="text-yellow-400">⭐</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {child.assignedTasks.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎯</div>
                    <p className="text-gray-600 font-child font-medium">No quests available right now!</p>
                    <p className="text-sm text-gray-500 font-child mt-2">Check back later for new adventures.</p>
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
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-yellow-50 to-orange-50">
              <CardTitle className="flex items-center gap-2 font-child text-gray-900">
                <Trophy className="w-5 h-5 text-yellow-600" />
                Recent Badges
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {child.earnedBadges.length > 0 ? (
                <div className="space-y-4">
                  {child.earnedBadges.map((earnedBadge) => (
                    <div key={earnedBadge.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                      <div className="text-3xl">{earnedBadge.badge.icon}</div>
                      <div>
                        <div className="font-medium text-gray-900 font-child">{earnedBadge.badge.name}</div>
                        <div className="text-sm text-gray-600 font-child">{earnedBadge.badge.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-5xl mb-3">🏆</div>
                  <p className="text-gray-600 font-child font-medium">
                    Complete quests to earn your first badge!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Wallet Preview */}
          <Card className="shadow-sm border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3">💰</div>
              <div className="text-3xl font-bold text-gray-900 mb-2 font-child">{child.currentCoins}</div>
              <div className="text-sm text-gray-600 mb-4 font-child">Coins Available</div>
              <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-child">
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