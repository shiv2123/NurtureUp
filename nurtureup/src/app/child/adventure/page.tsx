import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { VirtualPetWidget } from '@/components/child/VirtualPetWidget'
import { WalletDisplay } from '@/components/child/WalletDisplay'
import { QuestList } from '@/components/child/QuestList'
import { QuestActions } from '@/components/child/QuestActions'
import { ScreenTimeTracker } from '@/components/child/ScreenTimeTracker'
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Clean Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">{child.avatar || '🌟'}</div>
          <h1 className="text-2xl font-semibold text-slate-800 mb-2 font-child">
            {greeting}, {child.nickname}!
          </h1>
          <p className="text-slate-600">
            {todaysCompletedTasks === child.assignedTasks.length && child.assignedTasks.length > 0 
              ? "All tasks complete! Great job!" 
              : child.assignedTasks.length > 0 
              ? `${child.assignedTasks.length - todaysCompletedTasks} tasks left today`
              : "No tasks for today"
            }
          </p>
        </div>

        {/* Simple Progress Overview */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xl font-semibold text-slate-800 mb-1">{todaysCompletedTasks}</div>
              <div className="text-sm text-slate-600">Done Today</div>
            </div>
            <div>
              <div className="text-xl font-semibold text-slate-800 mb-1">{child.totalStars}</div>
              <div className="text-sm text-slate-600">Total Stars</div>
            </div>
            <div>
              <div className="text-xl font-semibold text-slate-800 mb-1">{child.currentCoins}</div>
              <div className="text-sm text-slate-600">Coins</div>
            </div>
            <div>
              <div className="text-xl font-semibold text-slate-800 mb-1">{child.currentStreak}</div>
              <div className="text-sm text-slate-600">Day Streak</div>
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div className="space-y-6">
          {/* Today's Tasks */}
          {child.assignedTasks.filter(task => task.completions.length === 0).length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Today's Tasks</h2>
              <div className="space-y-4">
                {child.assignedTasks.filter(task => task.completions.length === 0).map((task) => (
                  <div key={task.id} className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-800 mb-1">{task.title}</h3>
                        {task.description && (
                          <p className="text-sm text-slate-600 mb-2">{task.description}</p>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-yellow-500">⭐</span>
                          <span className="text-slate-600">{task.starValue} stars</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <QuestActions 
                          taskId={task.id}
                          taskTitle={task.title}
                          requiresProof={task.requiresProof}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Tasks */}
          {child.assignedTasks.filter(task => task.completions.length > 0).length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Completed Today
              </h2>
              <div className="space-y-3">
                {child.assignedTasks.filter(task => task.completions.length > 0).map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                      <span className="text-sm">✓</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-slate-800 line-through opacity-75">
                        {task.title}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-slate-600 text-sm">{task.starValue}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Tasks Message */}
          {child.assignedTasks.length === 0 && (
            <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-200 text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No tasks today!</h3>
              <p className="text-slate-600">Your next adventure is being prepared... ✨</p>
            </div>
          )}
          </div>

        {/* Additional Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Virtual Pet */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <VirtualPetWidget viewMode="child" />
          </div>

          {/* Screen Time Tracker */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <ScreenTimeTracker initialData={screenTimeData} />
          </div>
        </div>

        {/* Recent Badges */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <h3 className="text-xl font-semibold text-slate-800">Recent Badges</h3>
          </div>
          {child.earnedBadges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {child.earnedBadges.map((earnedBadge) => (
                <div key={earnedBadge.id} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-3xl">{earnedBadge.badge.icon}</div>
                  <div>
                    <div className="font-medium text-slate-800">{earnedBadge.badge.name}</div>
                    <div className="text-sm text-slate-600">{earnedBadge.badge.description}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-5xl mb-3">🏆</div>
              <p className="text-slate-600">
                Complete tasks to earn your first badge!
              </p>
            </div>
          )}
        </div>

        {/* Wallet Preview */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 shadow-sm border border-yellow-200 text-center">
          <div className="text-4xl mb-3">💰</div>
          <div className="text-3xl font-bold text-slate-800 mb-2">{child.currentCoins}</div>
          <div className="text-slate-600 mb-4">Coins Available</div>
          <button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            <Coins className="w-4 h-4 mr-2 inline" />
            Visit Store
          </button>
        </div>
      </div>
    </div>
  )
} 