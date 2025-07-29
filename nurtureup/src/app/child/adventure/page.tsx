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

  // Time-based greeting
  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening'
  
  // Adventure title based on streak
  const adventureTitle = child.currentStreak >= 7 ? 'the Legendary' : 
                        child.currentStreak >= 5 ? 'the Brave' : 
                        child.currentStreak >= 3 ? 'the Explorer' : 'the Adventurer'

  return (
    <div className="py-6 space-y-8">
      {/* Enhanced Hero Welcome Panel */}
      <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-3xl p-8 text-center relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          {/* Avatar with level indicator */}
          <div className="relative inline-block mb-4">
            <div className="text-6xl mb-2 animate-bounce-subtle">{child.avatar || '🌟'}</div>
            {child.currentStreak >= 3 && (
              <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold animate-pulse">
                {child.currentStreak}
              </div>
            )}
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-2 font-child">
            {greeting}, {child.nickname} {adventureTitle}! 
          </h1>
          
          {/* Dynamic status message */}
          <p className="text-white/90 text-xl font-child mb-6">
            {todaysCompletedTasks === child.assignedTasks.length && child.assignedTasks.length > 0 
              ? "🎉 All quests complete! You're amazing!" 
              : child.assignedTasks.length > 0 
              ? `Ready to conquer ${child.assignedTasks.length - todaysCompletedTasks} more quests?`
              : "Your next adventure awaits! ✨"
            }
          </p>

          {/* Adventure Progress Ring */}
          <div className="mb-6">
            <div className="relative w-24 h-24 mx-auto">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50" cy="50" r="40"
                  fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8"
                />
                <circle
                  cx="50" cy="50" r="40"
                  fill="none" stroke="white" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - (child.assignedTasks.length > 0 ? todaysCompletedTasks / child.assignedTasks.length : 0))}`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white font-child">
                  {child.assignedTasks.length > 0 ? Math.round((todaysCompletedTasks / child.assignedTasks.length) * 100) : 0}%
                </span>
              </div>
            </div>
            <p className="text-white/80 text-sm font-child mt-2">Today's Progress</p>
          </div>

          {/* Streak Fire */}
          {child.currentStreak > 0 && (
            <div className="flex items-center justify-center space-x-2 mb-4">
              <span className="text-2xl">🔥</span>
              <span className="text-white font-bold font-child text-lg">{child.currentStreak} day streak!</span>
              <span className="text-2xl">🔥</span>
            </div>
          )}
        </div>
        
        {/* Enhanced background elements */}
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 animate-pulse"></div>
        <div className="absolute top-1/2 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 animate-bounce" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/4 right-1/4 w-16 h-16 bg-white/5 rounded-full animate-bounce" style={{animationDelay: '2s'}}></div>
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
        {/* Left Column - Enhanced Quest Board */}
        <div className="lg:col-span-2 space-y-6">
          {/* Urgent Quest Highlight */}
          {child.assignedTasks.filter(task => task.completions.length === 0).length > 0 && (
            <Card className="border-2 border-orange-300 bg-gradient-to-r from-orange-50 to-yellow-50 shadow-lg">
              <CardHeader className="border-b border-orange-200">
                <CardTitle className="flex items-center gap-2 font-child text-orange-800">
                  <span className="animate-pulse">🔥</span>
                  Priority Quest
                  <span className="animate-pulse">🔥</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {(() => {
                  const urgentQuest = child.assignedTasks.find(task => task.completions.length === 0)
                  if (!urgentQuest) return null
                  
                  return (
                    <div className="bg-white rounded-2xl p-6 border-2 border-orange-200 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-2xl animate-bounce-subtle">
                            🎯
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 font-child mb-1">{urgentQuest.title}</h3>
                            <div className="flex items-center gap-2">
                              {Array.from({ length: Math.min(urgentQuest.starValue, 5) }).map((_, i) => (
                                <span key={i} className="text-yellow-500 text-lg animate-pulse" style={{animationDelay: `${i * 0.1}s`}}>⭐</span>
                              ))}
                              <span className="text-sm text-gray-600 font-medium font-child">
                                {urgentQuest.starValue} stars
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold font-child px-6 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200">
                          <Target className="w-4 h-4 mr-2" />
                          Start Quest!
                        </Button>
                      </div>
                      
                      {urgentQuest.description && (
                        <p className="text-gray-700 font-child mb-4 bg-gray-50 p-3 rounded-lg">
                          {urgentQuest.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          {urgentQuest.photoRequired && (
                            <>
                              📸 <span className="font-child">Photo proof needed</span>
                            </>
                          )}
                        </span>
                        <span className="font-child">Due today</span>
                      </div>
                    </div>
                  )
                })()}
              </CardContent>
            </Card>
          )}

          {/* Regular Quest List */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
              <CardTitle className="flex items-center justify-between font-child text-gray-900 text-lg">
                <span className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Available Quests
                </span>
                <span className="text-sm text-gray-500 font-medium">
                  {child.assignedTasks.filter(task => task.completions.length === 0).length} remaining
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {child.assignedTasks.filter(task => task.completions.length === 0).slice(1).map((task) => (
                  <div 
                    key={task.id} 
                    className="group flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-lg group-hover:bg-blue-200 transition-colors">
                        <span className="text-blue-600">○</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 font-child">{task.title}</div>
                        <div className="flex items-center gap-2 mt-1">
                          {Array.from({ length: Math.min(task.starValue, 5) }).map((_, i) => (
                            <span key={i} className="text-yellow-400">⭐</span>
                          ))}
                          <span className="text-xs text-gray-500 font-child ml-1">
                            {task.starValue} stars
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity border-blue-200 text-blue-600 hover:bg-blue-50 font-child"
                    >
                      Start
                    </Button>
                  </div>
                ))}

                {/* Completed Quests */}
                {child.assignedTasks.filter(task => task.completions.length > 0).length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-600 font-child mb-3 flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      Completed Today
                    </h4>
                    <div className="space-y-2">
                      {child.assignedTasks.filter(task => task.completions.length > 0).map((task) => (
                        <div 
                          key={task.id} 
                          className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100"
                        >
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-green-600 text-sm">✓</span>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-800 font-child line-through opacity-75">
                              {task.title}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(task.starValue, 3) }).map((_, i) => (
                              <span key={i} className="text-yellow-500 text-sm">⭐</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {child.assignedTasks.length === 0 && (
                  <div className="text-center py-16">
                    <div className="text-8xl mb-6 animate-bounce-subtle">🎯</div>
                    <h3 className="text-xl font-bold text-gray-700 font-child mb-2">No quests available!</h3>
                    <p className="text-gray-500 font-child">Your next adventure is being prepared... ✨</p>
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