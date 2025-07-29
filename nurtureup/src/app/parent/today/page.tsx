import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Camera, 
  Pause, 
  Target, 
  Clock, 
  TrendingUp,
  Heart,
  Star,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Calendar
} from 'lucide-react'

export default async function TodaysCommandPage() {
  const session = await getServerSession(authOptions)
  
  // Fetch comprehensive dashboard data
  const [family, children, pendingTasks, recentActivity] = await Promise.all([
    prisma.family.findUnique({
      where: { id: session!.user.familyId! },
      include: { settings: true }
    }),
    prisma.child.findMany({
      where: { familyId: session!.user.familyId! },
      include: {
        user: true,
        assignedTasks: {
          where: { 
            isActive: true,
            dueDate: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lte: new Date(new Date().setHours(23, 59, 59, 999))
            }
          },
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
          where: {
            earnedAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          },
          include: { badge: true }
        }
      }
    }),
    prisma.taskCompletion.findMany({
      where: {
        isApproved: false,
        task: {
          familyId: session!.user.familyId!
        }
      },
      include: {
        task: true,
        child: { include: { user: true } }
      },
      orderBy: { completedAt: 'desc' },
      take: 5
    }),
    prisma.taskCompletion.findMany({
      where: {
        isApproved: true,
        task: {
          familyId: session!.user.familyId!
        },
        completedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      },
      include: {
        task: true,
        child: { include: { user: true } }
      },
      orderBy: { completedAt: 'desc' },
      take: 10
    })
  ])

  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening'
  
  // Calculate family progress
  const totalTasks = children.reduce((sum, child) => sum + child.assignedTasks.length, 0)
  const completedTasks = children.reduce((sum, child) => 
    sum + child.assignedTasks.filter(task => task.completions.length > 0).length, 0
  )
  const familyProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Get child status
  const getChildStatus = (child: any) => {
    const todaysTasks = child.assignedTasks.length
    const completed = child.assignedTasks.filter((task: any) => task.completions.length > 0).length
    const pending = child.assignedTasks.filter((task: any) => 
      task.completions.length > 0 && !task.completions[0].isApproved
    ).length
    
    if (pending > 2) return { mood: '🤔', status: 'Needs attention', color: 'orange' }
    if (completed === todaysTasks && todaysTasks > 0) return { mood: '😊', status: 'Great day!', color: 'green' }
    if (completed / todaysTasks >= 0.7) return { mood: '🎯', status: 'On track', color: 'blue' }
    return { mood: '⚡', status: 'Getting started', color: 'gray' }
  }

  return (
    <div className="space-y-8">
      {/* Header with Greeting and Family Progress */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {greeting}, {session?.user?.name}! 🌅
              </h1>
              <p className="text-xl text-blue-100 mb-4">
                Your family adventure is {familyProgress}% complete today
              </p>
              <div className="flex items-center space-x-4 text-blue-100">
                <span className="flex items-center">
                  <Target className="w-4 h-4 mr-1" />
                  {completedTasks}/{totalTasks} quests done
                </span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {pendingTasks.length} awaiting review
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{familyProgress}%</div>
              <Progress value={familyProgress} className="w-32 mt-2" />
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
      </div>

      {/* Family Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {children.map((child) => {
          const status = getChildStatus(child)
          const todaysCompletions = child.assignedTasks.filter(task => task.completions.length > 0).length
          const pendingApprovals = child.assignedTasks.filter(task => 
            task.completions.length > 0 && !task.completions[0].isApproved
          ).length
          
          return (
            <Card key={child.id} className="border-2 hover:shadow-lg transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{status.mood}</div>
                    <div>
                      <CardTitle className="text-lg">{child.user.name}</CardTitle>
                      <p className={`text-sm font-medium ${
                        status.color === 'green' ? 'text-green-600' :
                        status.color === 'blue' ? 'text-blue-600' :
                        status.color === 'orange' ? 'text-orange-600' :
                        'text-gray-600'
                      }`}>
                        {status.status}
                      </p>
                    </div>
                  </div>
                  {child.earnedBadges.length > 0 && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <Sparkles className="w-3 h-3 mr-1" />
                      New badge!
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Today's quests</span>
                    <span className="font-medium">{todaysCompletions}/{child.assignedTasks.length}</span>
                  </div>
                  <Progress 
                    value={child.assignedTasks.length > 0 ? (todaysCompletions / child.assignedTasks.length) * 100 : 0} 
                    className="h-2"
                  />
                  {pendingApprovals > 0 && (
                    <div className="flex items-center text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {pendingApprovals} pending approval{pendingApprovals > 1 ? 's' : ''}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>⭐ {child.totalStars} stars</span>
                    <span>💰 {child.currentCoins} coins</span>
                    <span>🔥 {child.currentStreak} day streak</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Urgent Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Urgent Actions */}
          <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader className="border-b border-orange-100">
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertCircle className="w-5 h-5" />
                Urgent Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {pendingTasks.length > 0 || children.some(child => child.earnedBadges.length > 0) ? (
                <div className="space-y-4">
                  {/* Pending Approvals */}
                  {pendingTasks.map((completion) => (
                    <div key={completion.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-orange-200">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            📸 {completion.child.user.name} completed "{completion.task.title}"
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {new Date(completion.completedAt).toLocaleTimeString()} • Awaiting review
                          </div>
                        </div>
                      </div>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                        Review & Celebrate
                      </Button>
                    </div>
                  ))}

                  {/* New Badges */}
                  {children.map(child => 
                    child.earnedBadges.map(earnedBadge => (
                      <div key={`${child.id}-${earnedBadge.id}`} className="flex items-center justify-between p-4 bg-white rounded-xl border border-yellow-200">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-lg">
                            {earnedBadge.badge.icon}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              🎉 {child.user.name} earned "{earnedBadge.badge.name}" badge!
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {earnedBadge.badge.description}
                            </div>
                          </div>
                        </div>
                        <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-white">
                          Celebrate!
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">✨</div>
                  <p className="text-gray-600 font-medium">All caught up!</p>
                  <p className="text-sm text-gray-500 mt-2">No urgent actions needed right now.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {activity.child.user.name} completed "{activity.task.title}"
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(activity.completedAt).toLocaleString()} • 
                          <span className="text-green-600 ml-1">Approved</span>
                        </div>
                      </div>
                      <div className="flex items-center text-yellow-500">
                        <Star className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">{activity.task.starValue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">📈</div>
                  <p className="text-gray-600">No recent activity yet today.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Actions & Stats */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">⚡ Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Quest
              </Button>
              <Button variant="outline" className="w-full justify-start border-blue-200 text-blue-700 hover:bg-blue-50">
                <Camera className="w-4 h-4 mr-2" />
                Add Milestone
              </Button>
              <Button variant="outline" className="w-full justify-start border-red-200 text-red-700 hover:bg-red-50">
                <Pause className="w-4 h-4 mr-2" />
                Family Pause
              </Button>
              <Button variant="outline" className="w-full justify-start border-purple-200 text-purple-700 hover:bg-purple-50">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Tasks
              </Button>
            </CardContent>
          </Card>

          {/* Family Stats */}
          <Card>
            <CardHeader>
              <CardTitle>📊 Today's Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
                  <div className="text-xs text-green-600">Completed</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{pendingTasks.length}</div>
                  <div className="text-xs text-orange-600">Pending</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{children.length}</div>
                  <div className="text-xs text-blue-600">Active Kids</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {children.reduce((sum, child) => sum + child.earnedBadges.length, 0)}
                  </div>
                  <div className="text-xs text-purple-600">New Badges</div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Family Progress</span>
                  <span className="font-medium">{familyProgress}%</span>
                </div>
                <Progress value={familyProgress} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-yellow-800 flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Parenting Tip
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-yellow-700 leading-relaxed">
                🌟 <strong>Celebrate small wins!</strong> Acknowledging completed tasks within 2 hours 
                increases motivation by 40% and builds stronger family connections.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}