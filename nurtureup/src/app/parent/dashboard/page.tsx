import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardWidgets } from '@/components/parent/DashboardWidgets'
import { PendingApprovalsSummary } from '@/components/parent/PendingApprovalsSummary'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Plus, Target, Bell } from 'lucide-react'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  // Fetch dashboard data
  const [family, children, pendingTasks] = await Promise.all([
    prisma.family.findUnique({
      where: { id: session!.user.familyId! },
      include: { settings: true }
    }),
    prisma.child.findMany({
      where: { familyId: session!.user.familyId! },
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
      take: 10
    })
  ])

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-display">
            Family Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </Button>
          <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Quick Add
          </Button>
        </div>
      </div>

      <DashboardWidgets 
        children={children} 
        pendingTasks={pendingTasks}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Activity Feed */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-gray-900 font-display">
                <Target className="w-5 h-5 text-blue-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {pendingTasks.length > 0 ? (
                <div className="space-y-4">
                  {pendingTasks.slice(0, 5).map((completion) => (
                    <div key={completion.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <div>
                        <div className="font-medium text-gray-900">
                          {completion.child.user.name} completed "{completion.task.title}"
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {new Date(completion.completedAt).toLocaleTimeString()}
                        </div>
                      </div>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                        Approve
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-5xl mb-4">📋</div>
                  <p className="text-gray-600 font-medium">No recent activity to review.</p>
                  <p className="text-sm text-gray-500 mt-2">When kids complete tasks, they'll appear here for approval!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Pending Approvals */}
          <PendingApprovalsSummary />
          
          {/* Weekly Pulse Report */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-gray-900 font-display">Weekly Pulse</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Tasks Completed
                  </span>
                  <span className="font-bold text-gray-900">47/52</span>
                </div>
                <Progress value={90} className="h-2" />
              </div>
              
              <div className="pt-2 border-t border-gray-100">
                <p className="text-sm font-semibold text-green-600 mb-3">
                  Top Wins 🎉
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Emma's 7-day streak!
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Leo mastered multiplication
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Zero screen time battles
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Family Stats */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-gray-900 font-display">Family Stats</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Active Children</span>
                  <span className="font-bold text-gray-900">{children.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Pending Approvals</span>
                  <span className="font-bold text-amber-600">{pendingTasks.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Family Level</span>
                  <span className="font-bold text-green-600">12</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 