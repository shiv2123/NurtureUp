import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { QuestActions } from '@/components/child/QuestActions'
import { PetActions } from '@/components/child/PetActions'
import { 
  Sword,
  Star,
  Clock,
  CheckCircle,
  Heart,
  Target
} from 'lucide-react'

export default async function ChildQuestPage() {
  const session = await getServerSession(authOptions)
  
  // Fetch child data and quests
  const [child, todaysTasks, pet] = await Promise.all([
    prisma.child.findUnique({
      where: { userId: session!.user.id },
      include: { user: true }
    }),
    prisma.task.findMany({
      where: {
        assignedToId: session!.user.id,
        isActive: true,
        dueDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lte: new Date(new Date().setHours(23, 59, 59, 999))
        }
      },
      include: {
        completions: {
          where: {
            childId: session!.user.id,
            completedAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        }
      }
    }),
    prisma.virtualPet.findUnique({
      where: { childId: session!.user.id }
    })
  ])

  if (!child) {
    return <div>Profile not found</div>
  }

  const completedTasks = todaysTasks.filter(task => task.completions.length > 0)
  const pendingTasks = todaysTasks.filter(task => task.completions.length === 0)
  const dailyProgress = todaysTasks.length > 0 ? Math.round((completedTasks.length / todaysTasks.length) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-slate-800 mb-2">
            Quest Dashboard
          </h1>
          <p className="text-slate-600">
            Ready for adventure, {child.user.name}? ⚔️
          </p>
        </div>

        {/* Progress Stats */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-semibold text-slate-800 mb-1">{completedTasks.length}</div>
              <div className="text-sm text-slate-600">Done Today</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-slate-800 mb-1">{pendingTasks.length}</div>
              <div className="text-sm text-slate-600">Remaining</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-slate-800 mb-1">{child.totalStars}</div>
              <div className="text-sm text-slate-600">Total Stars</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-slate-800 mb-1">{child.currentStreak}</div>
              <div className="text-sm text-slate-600">Day Streak</div>
            </div>
          </div>
        </div>

        {/* Virtual Pet Companion */}
        {pet && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex items-center gap-6 flex-1">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0">
                  {pet.type === 'dragon' ? '🐲' : pet.type === 'unicorn' ? '🦄' : '🐱'}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">
                    {pet.name || 'Your Pet'}
                  </h3>
                  <p className="text-slate-600 mb-4">
                    Level {pet.level} • {pet.happiness >= 80 ? 'Very Happy! 😊' : pet.happiness >= 60 ? 'Happy 😄' : pet.happiness >= 40 ? 'Okay 😐' : 'Needs attention 😢'}
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-600">Happiness</span>
                        <span className="font-semibold text-slate-800">{pet.happiness}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
                          style={{width: `${pet.happiness}%`}}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-600">Energy</span>
                        <span className="font-semibold text-slate-800">{pet.energy}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-pink-500 h-2 rounded-full transition-all duration-300" 
                          style={{width: `${pet.energy}%`}}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <PetActions petId={pet.id} />
              </div>
            </div>
          </div>
        )}

        {/* Active Quests */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-800">Today's Tasks</h2>
            <div className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              {pendingTasks.length} remaining
            </div>
          </div>

          {pendingTasks.length > 0 ? (
            <div className="space-y-4">
              {pendingTasks.map((task) => (
                <div key={task.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-800 mb-2">
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-slate-600 mb-3">
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">⭐</span>
                          <span className="text-slate-600 text-sm">{task.starValue} stars</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.difficulty <= 2 ? 'bg-green-100 text-green-700' :
                          task.difficulty <= 3 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {task.difficulty <= 2 ? 'Easy' : task.difficulty <= 3 ? 'Medium' : 'Hard'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="ml-6">
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
          ) : (
            <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-200 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                All Tasks Complete!
              </h3>
              <p className="text-slate-600">
                Amazing work! You've completed all your tasks for today.
              </p>
            </div>
          )}
        </div>

        {/* Completed Today */}
        {completedTasks.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              Completed Today
            </h2>
            
            <div className="space-y-3">
              {completedTasks.map((task) => (
                <div key={task.id} className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                      <div>
                        <h3 className="font-semibold text-slate-800">{task.title}</h3>
                        <p className="text-sm text-green-600">
                          {task.completions[0]?.isApproved ? 'Approved ✅' : 'Waiting for approval ⏳'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-slate-700 font-medium">{task.starValue}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}