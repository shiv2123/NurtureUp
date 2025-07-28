import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Star, Zap, Target } from 'lucide-react'

export default async function BadgesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'PARENT') {
    redirect('/login')
  }

  // Fetch all badges and family progress
  const [badges, children] = await Promise.all([
    prisma.badge.findMany({
      include: {
        earned: {
          include: {
            child: {
              include: { user: true }
            }
          },
          where: {
            child: {
              familyId: session.user.familyId!
            }
          }
        }
      },
      orderBy: [
        { category: 'asc' },
        { rarity: 'asc' }
      ]
    }),
    prisma.child.findMany({
      where: { familyId: session.user.familyId! },
      include: {
        user: true,
        earnedBadges: {
          include: { badge: true },
          orderBy: { earnedAt: 'desc' }
        }
      }
    })
  ])

  const rarityColors = {
    bronze: 'bg-amber-100 text-amber-800 border-amber-200',
    silver: 'bg-slate-100 text-slate-700 border-slate-200', 
    gold: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    legendary: 'bg-purple-100 text-purple-800 border-purple-200'
  }

  const categoryIcons = {
    milestone: Target,
    streak: Zap,
    special: Star
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-black">Family Badges</h1>
          <p className="text-black mt-1">
            Track your children's achievements and unlock new badges
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-warning" />
          <span className="text-lg font-semibold text-black">
            {children.reduce((total, child) => total + child.earnedBadges.length, 0)} earned
          </span>
        </div>
      </div>

      {/* Children's Badge Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children.map((child) => (
          <Card key={child.id} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-sky-blue/20 to-mint-green/20">
              <CardTitle className="flex items-center gap-3">
                <span className="text-2xl">{child.avatar || '👤'}</span>
                <div>
                  <div className="text-lg font-bold text-black">{child.nickname}</div>
                  <div className="text-sm text-black">
                    {child.earnedBadges.length} badge{child.earnedBadges.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {child.earnedBadges.length > 0 ? (
                <div className="space-y-2">
                  {child.earnedBadges.slice(0, 3).map((earnedBadge) => (
                    <div key={earnedBadge.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                      <span className="text-xl">{earnedBadge.badge.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium text-sm text-black">{earnedBadge.badge.name}</div>
                        <div className="text-xs text-black">
                          {new Date(earnedBadge.earnedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge className={rarityColors[earnedBadge.badge.rarity as keyof typeof rarityColors]}>
                        {earnedBadge.badge.rarity}
                      </Badge>
                    </div>
                  ))}
                  {child.earnedBadges.length > 3 && (
                    <div className="text-center text-sm text-black">
                      +{child.earnedBadges.length - 3} more badge{child.earnedBadges.length - 3 !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Trophy className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-black">No badges yet</p>
                  <p className="text-xs text-black">Complete tasks to earn your first badge!</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* All Available Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-warning" />
            All Available Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge) => {
              const Icon = categoryIcons[badge.category as keyof typeof categoryIcons] || Star
              const earnedCount = badge.earned.length
              const criteria = JSON.parse(badge.criteria)
              
              return (
                <div 
                  key={badge.id}
                  className={`border rounded-xl p-4 transition-all ${
                    earnedCount > 0 
                      ? 'border-sage-green bg-sage-green/5' 
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{badge.icon}</span>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-black" />
                        <Badge className={rarityColors[badge.rarity as keyof typeof rarityColors]}>
                          {badge.rarity}
                        </Badge>
                      </div>
                    </div>
                    {earnedCount > 0 && (
                      <Badge variant="outline" className="text-sage-green border-sage-green">
                        {earnedCount} earned
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-black mb-1">{badge.name}</h3>
                  <p className="text-sm text-black mb-2">{badge.description}</p>
                  
                  <div className="text-xs text-black bg-slate-100 rounded px-2 py-1">
                    <strong>Criteria:</strong> {
                      criteria.type === 'first_task' ? 'Complete your first task' :
                      criteria.type === 'total_stars' ? `Earn ${criteria.value} total stars` :
                      criteria.type === 'streak_days' ? `${criteria.value} day streak` :
                      criteria.type === 'total_tasks' ? `Complete ${criteria.value} tasks` :
                      criteria.type === 'coin_saver' ? `Save ${criteria.value} coins` :
                      criteria.type === 'perfect_week' ? 'Complete all tasks for a week' :
                      criteria.type === 'early_bird' ? 'Complete tasks before 9 AM for 5 days' :
                      criteria.type === 'weekend_warrior' ? 'Stay consistent on weekends' :
                      'Special achievement'
                    }
                  </div>
                  
                  {earnedCount > 0 && (
                    <div className="mt-2 flex items-center gap-1 flex-wrap">
                      {badge.earned.map((earned) => (
                        <span key={earned.id} className="text-xs bg-sage-green/20 text-sage-green px-2 py-1 rounded">
                          {earned.child.nickname}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}