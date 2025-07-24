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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-black">
            Family Dashboard
          </h1>
          <p className="text-black mt-1">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </Button>
          <Button variant="default" size="sm">
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingTasks.length > 0 ? (
                <div className="space-y-3">
                  {pendingTasks.slice(0, 5).map((completion) => (
                    <div key={completion.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <div className="font-medium text-slate-gray">
                          {completion.child.user.name} completed "{completion.task.title}"
                        </div>
                        <div className="text-sm text-black">
                          {new Date(completion.completedAt).toLocaleTimeString()}
                        </div>
                      </div>
                      <Button variant="success" size="sm">
                        Approve
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-black">
                  <p>No recent activity to review.</p>
                  <p className="text-sm mt-1">When kids complete tasks, they'll appear here for approval!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Pending Approvals */}
          <PendingApprovalsSummary />
          
          {/* Weekly Pulse Report */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Pulse</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-black">
                    Tasks Completed
                  </span>
                  <span className="font-semibold text-slate-gray">47/52</span>
                </div>
                <Progress value={90} />
              </div>
              
              <div className="pt-2">
                <p className="text-sm font-medium text-success mb-2">
                  Top Wins 🎉
                </p>
                <ul className="space-y-1 text-sm text-black">
                  <li>• Emma's 7-day streak!</li>
                  <li>• Leo mastered multiplication</li>
                  <li>• Zero screen time battles</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Family Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Family Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-black">Active Children</span>
                  <span className="font-semibold text-slate-gray">{children.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-black">Pending Approvals</span>
                  <span className="font-semibold text-warning">{pendingTasks.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-black">Family Level</span>
                  <span className="font-semibold text-sage-green">12</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 