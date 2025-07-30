import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ApprovalButton } from '@/components/parent/ApprovalButton'
import { 
  Users,
  CheckCircle,
  Clock,
  Star,
  Plus,
  ArrowRight
} from 'lucide-react'

export default async function ParentHomePage() {
  const session = await getServerSession(authOptions)
  
  // Fetch dashboard data
  const [children, pendingTasks, familyStats] = await Promise.all([
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
        }
      }
    }),
    prisma.taskCompletion.findMany({
      where: {
        isApproved: false,
        task: { familyId: session!.user.familyId! }
      },
      include: {
        task: true,
        child: { include: { user: true } }
      },
      take: 3
    }),
    Promise.resolve({
      totalTasks: 12,
      completedTasks: 8,
      totalStars: 247,
      activeChildren: 3
    })
  ])

  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Clean Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-semibold text-slate-800 mb-2">
            {greeting}, {session?.user?.name?.split(' ')[0]}
          </h1>
          <p className="text-slate-600 text-lg">
            Here's what's happening with your family today
          </p>
        </div>

        {/* Clean Overview */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-800">Today's Overview</h2>
            <div className="text-sm text-slate-500">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800 mb-1">{familyStats.completedTasks}</div>
              <div className="text-sm text-slate-600">Tasks Done</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800 mb-1">{pendingTasks.length}</div>
              <div className="text-sm text-slate-600">Need Approval</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800 mb-1">{children.length}</div>
              <div className="text-sm text-slate-600">Children</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800 mb-1">{familyStats.totalStars}</div>
              <div className="text-sm text-slate-600">Stars Earned</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Family Progress */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-800">Family Progress</h2>
                <Link href="/parent/children" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View all →
                </Link>
              </div>
              
              <div className="space-y-4">
                {children.map((child) => {
                  const todaysTasks = child.assignedTasks.length
                  const completed = child.assignedTasks.filter(task => task.completions.length > 0).length
                  const progress = todaysTasks > 0 ? Math.round((completed / todaysTasks) * 100) : 0
                  
                  return (
                    <div key={child.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-xl flex items-center justify-center font-semibold">
                          {child.user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">{child.user.name}</div>
                          <div className="text-sm text-slate-600">{completed} of {todaysTasks} tasks done</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-slate-800">{progress}%</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Pending Actions - Takes 1 column */}
          <div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-800">Needs Approval</h2>
                {pendingTasks.length > 0 && (
                  <span className="bg-red-100 text-red-700 text-sm px-2 py-1 rounded-full font-medium">
                    {pendingTasks.length}
                  </span>
                )}
              </div>
            
              {pendingTasks.length > 0 ? (
                <div className="space-y-4">
                  {pendingTasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                      <div className="font-medium text-slate-800 mb-1">
                        {task.task.title}
                      </div>
                      <div className="text-sm text-slate-600 mb-3">
                        By {task.child.user.name}
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-slate-500">
                          {new Date(task.completedAt).toLocaleTimeString()}
                        </div>
                        <ApprovalButton 
                          completionId={task.id}
                          taskTitle={task.task.title}
                          childName={task.child.user.name}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  ))}
                  
                  {pendingTasks.length > 3 && (
                    <Link href="/parent/approvals" className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2">
                      View {pendingTasks.length - 3} more →
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-sm text-slate-600">All caught up!</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Quick Actions</h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/parent/tasks" className="flex flex-col items-center p-6 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-slate-800">Create Task</span>
            </Link>

            <Link href="/parent/children" className="flex flex-col items-center p-6 rounded-xl border border-slate-200 hover:border-green-300 hover:bg-green-50 transition-colors group">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-green-200 transition-colors">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm font-medium text-slate-800">Manage Children</span>
            </Link>

            <Link href="/parent/monitor" className="flex flex-col items-center p-6 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-colors group">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-slate-800">View Reports</span>
            </Link>

            <Link href="/parent/tasks" className="flex flex-col items-center p-6 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50 transition-colors group">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-orange-200 transition-colors">
                <ArrowRight className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-slate-800">All Tasks</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}