import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { 
  BarChart3,
  Clock,
  TrendingUp,
  Trophy,
  Calendar,
  Eye,
  Target,
  Zap
} from 'lucide-react'

export default async function ParentMonitorPage() {
  const session = await getServerSession(authOptions)
  
  // Fetch analytics data
  const [children, weeklyData, familyStats] = await Promise.all([
    prisma.child.findMany({
      where: { familyId: session!.user.familyId! },
      include: {
        user: true,
        earnedBadges: {
          include: { badge: true },
          orderBy: { earnedAt: 'desc' }
        },
        assignedTasks: {
          where: { isActive: true },
          include: {
            completions: {
              where: {
                isApproved: true,
                completedAt: {
                  gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                }
              }
            }
          }
        }
      }
    }),
    // Mock weekly data - in real app this would be calculated
    Promise.resolve([
      { day: 'Mon', completed: 8, total: 12 },
      { day: 'Tue', completed: 10, total: 12 },
      { day: 'Wed', completed: 7, total: 12 },
      { day: 'Thu', completed: 11, total: 12 },
      { day: 'Fri', completed: 9, total: 12 },
      { day: 'Sat', completed: 6, total: 8 },
      { day: 'Sun', completed: 5, total: 8 }
    ]),
    prisma.family.findUnique({
      where: { id: session!.user.familyId! },
      include: { settings: true }
    })
  ])

  // Calculate insights
  const totalTasksThisWeek = weeklyData.reduce((sum, day) => sum + day.completed, 0)
  const averageCompletion = Math.round(
    (weeklyData.reduce((sum, day) => sum + (day.completed / day.total), 0) / weeklyData.length) * 100
  )

  return (
    <div className="min-h-screen bg-parent-base relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-white/10 rounded-full blur-lg"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-12 space-y-12">
        {/* Modern Header Card */}
        <div className="card-floating p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Family Monitor
              </h1>
              <p className="text-white/80 text-lg">
                Analytics, insights, and screen time tracking for your family
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card-floating p-6 text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">{totalTasksThisWeek}</div>
            <div className="text-white/70 font-medium">Tasks This Week</div>
          </div>
          
          <div className="card-floating p-6 text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">{averageCompletion}%</div>
            <div className="text-white/70 font-medium">Avg Completion</div>
          </div>
          
          <div className="card-floating p-6 text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-violet-400 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {children.reduce((sum, child) => sum + child.earnedBadges.length, 0)}
            </div>
            <div className="text-white/70 font-medium">Total Badges</div>
          </div>
          
          <div className="card-floating p-6 text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">2.5h</div>
            <div className="text-white/70 font-medium">Avg Screen Time</div>
          </div>
        </div>

        {/* Weekly Progress Chart */}
        <div className="card-floating p-8">
          <div className="flex items-center gap-3 text-xl font-bold text-white mb-6">
            <Calendar className="w-6 h-6" />
            Weekly Progress Overview
          </div>
          <div className="space-y-4">
            {weeklyData.map((day, index) => (
              <div key={day.day} className="flex items-center space-x-6">
                <div className="w-16 text-base font-semibold text-white">{day.day}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-white/70 font-medium">
                      {day.completed}/{day.total} tasks
                    </span>
                    <span className="text-sm font-bold text-white">
                      {Math.round((day.completed / day.total) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-3 rounded-full transition-all duration-300" 
                      style={{width: `${(day.completed / day.total) * 100}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Child Analytics */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {children.map((child) => {
            const weeklyCompletions = child.assignedTasks.reduce(
              (sum, task) => sum + task.completions.length, 0
            )
            const recentBadges = child.earnedBadges.slice(0, 3)
            
            return (
              <div key={child.id} className="card-floating p-6 hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-violet-400 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                      {child.user.name.charAt(0)}
                    </div>
                    <span className="text-xl font-bold text-white">{child.user.name}</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2">
                    <span className="text-white/90 font-semibold text-sm">
                      Level {Math.floor(child.totalStars / 100) + 1}
                    </span>
                  </div>
                </div>
                {/* Progress Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                    <div className="text-xl font-bold text-white mb-1">{weeklyCompletions}</div>
                    <div className="text-sm text-white/70 font-medium">Week Tasks</div>
                  </div>
                  <div className="text-center p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                    <div className="text-xl font-bold text-white mb-1">{child.currentStreak}</div>
                    <div className="text-sm text-white/70 font-medium">Day Streak</div>
                  </div>
                  <div className="text-center p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                    <div className="text-xl font-bold text-white mb-1">{child.totalStars}</div>
                    <div className="text-sm text-white/70 font-medium">Total Stars</div>
                  </div>
                </div>

                {/* Recent Badges */}
                {recentBadges.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-base font-semibold text-white mb-3">Recent Badges</h4>
                    <div className="flex gap-3 flex-wrap">
                      {recentBadges.map((earnedBadge) => (
                        <div 
                          key={earnedBadge.id}
                          className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-400/30 rounded-xl px-4 py-3"
                        >
                          <span className="text-2xl">{earnedBadge.badge.icon}</span>
                          <span className="text-sm font-semibold text-yellow-300">
                            {earnedBadge.badge.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Screen Time */}
                <div className="p-5 bg-orange-500/20 rounded-xl border border-orange-400/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-base font-semibold text-white">Screen Time Today</span>
                    <Eye className="w-5 h-5 text-orange-400" />
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl font-bold text-white">2h 15m</span>
                    <span className="text-sm text-white/70 font-medium">of 3h limit</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div className="bg-gradient-to-r from-orange-400 to-red-400 h-3 rounded-full transition-all duration-300" style={{width: '75%'}}></div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Family Insights */}
        <div className="card-floating p-8 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20">
          <div className="flex items-center gap-3 text-xl font-bold text-white mb-6">
            <Zap className="w-6 h-6 text-emerald-400" />
            Smart Insights
          </div>
          <div className="space-y-6">
            <div className="p-6 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
              <h4 className="font-bold text-white mb-3 text-lg">🎯 This Week's Wins</h4>
              <p className="text-white/80">
                Your family completed {totalTasksThisWeek} tasks this week! 
                That's a {averageCompletion}% completion rate - excellent consistency!
              </p>
            </div>
            
            <div className="p-6 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
              <h4 className="font-bold text-white mb-3 text-lg">💡 Suggestion</h4>
              <p className="text-white/80">
                Consider adding more weekend activities to maintain engagement. 
                Saturday and Sunday show slightly lower completion rates.
              </p>
            </div>
            
            <div className="p-6 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
              <h4 className="font-bold text-white mb-3 text-lg">🌟 Celebration Opportunity</h4>
              <p className="text-white/80">
                {children.find(c => c.earnedBadges.length > 0)?.user.name || 'Someone'} earned new badges recently! 
                Consider celebrating their achievements during family time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}