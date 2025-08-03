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
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-neutral-900">Family Monitor</h1>
            <p className="text-sm text-neutral-600">Analytics, insights, and screen time tracking</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 pb-20 space-y-8">

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card variant="elevated" interactive>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasks This Week</CardTitle>
              <Target className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTasksThisWeek}</div>
              <p className="text-xs text-neutral-600">
                +{Math.round(((totalTasksThisWeek - 45) / 45) * 100)}% from last week
              </p>
            </CardContent>
          </Card>
          
          <Card variant="interactive">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle level={3} className="text-sm font-medium">Avg Completion</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageCompletion}%</div>
              <div className="flex justify-center mt-2">
                <Progress value={averageCompletion} size={40} />
              </div>
            </CardContent>
          </Card>
          
          <Card variant="interactive">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle level={3} className="text-sm font-medium">Total Badges</CardTitle>
              <Trophy className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {children.reduce((sum, child) => sum + child.earnedBadges.length, 0)}
              </div>
              <p className="text-xs text-neutral-600">
                Across all children
              </p>
            </CardContent>
          </Card>
          
          <Card variant="interactive">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle level={3} className="text-sm font-medium">Avg Screen Time</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.5h</div>
              <p className="text-xs text-neutral-600">
                Within healthy limits
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Progress Chart */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle level={2} className="flex items-center gap-3">
              <Calendar className="w-5 h-5" />
              Weekly Progress Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {weeklyData.map((day, index) => (
              <div key={day.day} className="flex items-center space-x-6">
                <div className="w-16 text-sm font-semibold text-neutral-900">{day.day}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-neutral-600 font-medium">
                      {day.completed}/{day.total} tasks
                    </span>
                    <span className="text-sm font-bold text-neutral-900">
                      {Math.round((day.completed / day.total) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{width: `${(day.completed / day.total) * 100}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Child Analytics */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {children.map((child) => {
            const weeklyCompletions = child.assignedTasks.reduce(
              (sum, task) => sum + task.completions.length, 0
            )
            const recentBadges = child.earnedBadges.slice(0, 3)
            
            return (
              <Card key={child.id} variant="interactive">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                        {child.user.name.charAt(0)}
                      </div>
                      <CardTitle level={2} className="text-lg">{child.user.name}</CardTitle>
                    </div>
                    <div className="bg-secondary text-neutral-900 text-sm px-3 py-1 rounded-full font-medium">
                      Level {Math.floor(child.totalStars / 100) + 1}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Progress Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-neutral-50 rounded-lg">
                      <div className="text-xl font-bold text-neutral-900 mb-1">{weeklyCompletions}</div>
                      <div className="text-xs text-neutral-600 font-medium">Week Tasks</div>
                    </div>
                    <div className="text-center p-3 bg-neutral-50 rounded-lg">
                      <div className="text-xl font-bold text-neutral-900 mb-1">{child.currentStreak}</div>
                      <div className="text-xs text-neutral-600 font-medium">Day Streak</div>
                    </div>
                    <div className="text-center p-3 bg-neutral-50 rounded-lg">
                      <div className="text-xl font-bold text-neutral-900 mb-1">{child.totalStars}</div>
                      <div className="text-xs text-neutral-600 font-medium">Total Stars</div>
                    </div>
                  </div>

                  {/* Recent Badges */}
                  {recentBadges.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-900 mb-3">Recent Badges</h4>
                      <div className="flex gap-2 flex-wrap">
                        {recentBadges.map((earnedBadge) => (
                          <div 
                            key={earnedBadge.id}
                            className="flex items-center gap-2 bg-secondary text-neutral-900 rounded-lg px-3 py-2"
                          >
                            <span className="text-lg">{earnedBadge.badge.icon}</span>
                            <span className="text-xs font-semibold">
                              {earnedBadge.badge.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Screen Time */}
                  <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-neutral-900">Screen Time Today</span>
                      <Eye className="w-4 h-4 text-warning" />
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-neutral-900">2h 15m</span>
                      <span className="text-xs text-neutral-600 font-medium">of 3h limit</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div className="bg-warning h-2 rounded-full transition-all duration-300" style={{width: '75%'}}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Family Insights */}
        <Card variant="elevated" className="bg-success/5 border-success/20">
          <CardHeader>
            <CardTitle level={2} className="flex items-center gap-3 text-success">
              <Zap className="w-5 h-5" />
              Smart Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-white rounded-lg border border-neutral-200">
              <h4 className="font-bold text-neutral-900 mb-2 text-sm">🎯 This Week's Wins</h4>
              <p className="text-sm text-neutral-600">
                Your family completed {totalTasksThisWeek} tasks this week! 
                That's a {averageCompletion}% completion rate - excellent consistency!
              </p>
            </div>
            
            <div className="p-4 bg-white rounded-lg border border-neutral-200">
              <h4 className="font-bold text-neutral-900 mb-2 text-sm">💡 Suggestion</h4>
              <p className="text-sm text-neutral-600">
                Consider adding more weekend activities to maintain engagement. 
                Saturday and Sunday show slightly lower completion rates.
              </p>
            </div>
            
            <div className="p-4 bg-white rounded-lg border border-neutral-200">
              <h4 className="font-bold text-neutral-900 mb-2 text-sm">🌟 Celebration Opportunity</h4>
              <p className="text-sm text-neutral-600">
                {children.find(c => c.earnedBadges.length > 0)?.user.name || 'Someone'} earned new badges recently! 
                Consider celebrating their achievements during family time.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}