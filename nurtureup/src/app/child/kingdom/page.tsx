import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Crown, 
  Coins, 
  Star, 
  Trophy, 
  Heart,
  ShoppingBag,
  Target,
  Sparkles,
  Gift,
  Castle,
  Gem
} from 'lucide-react'

export default async function MyKingdomPage() {
  const session = await getServerSession(authOptions)
  
  // Fetch comprehensive child data
  const [child, rewards, rewardPurchases] = await Promise.all([
    prisma.child.findUnique({
      where: { userId: session!.user.id },
      include: {
        user: true,
        earnedBadges: {
          include: { badge: true },
          orderBy: { earnedAt: 'desc' }
        },
        pet: true
      }
    }),
    prisma.reward.findMany({
      where: { familyId: session!.user.familyId! },
      orderBy: { coinCost: 'asc' }
    }),
    prisma.rewardPurchase.findMany({
      where: { 
        childId: session!.user.id,
        isRedeemed: false
      },
      include: { reward: true },
      orderBy: { purchasedAt: 'desc' }
    })
  ])

  if (!child) {
    return <div>Child profile not found</div>
  }

  // Calculate savings progress for top goals
  const topRewards = rewards.slice(0, 3)
  const savingsGoals = topRewards.map(reward => ({
    ...reward,
    progress: Math.min((child.currentCoins / reward.coinCost) * 100, 100)
  }))

  return (
    <div className="py-6 space-y-8">
      {/* Royal Kingdom Header */}
      <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-3xl p-8 text-center relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center justify-center mb-4">
            <Crown className="w-12 h-12 text-yellow-300 mr-3 animate-pulse" />
            <h1 className="text-5xl font-bold text-white font-child">My Kingdom</h1>
            <Crown className="w-12 h-12 text-yellow-300 ml-3 animate-pulse" />
          </div>
          
          <p className="text-2xl text-white/90 font-child mb-6">
            Welcome to your royal domain, {child.nickname}! 👑
          </p>

          {/* Kingdom Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
              <Coins className="w-8 h-8 text-yellow-300 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white font-child">{child.currentCoins}</div>
              <div className="text-white/80 text-sm font-child">Royal Coins</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
              <Star className="w-8 h-8 text-yellow-300 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white font-child">{child.totalStars}</div>
              <div className="text-white/80 text-sm font-child">Stars Earned</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
              <Trophy className="w-8 h-8 text-yellow-300 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white font-child">{child.earnedBadges.length}</div>
              <div className="text-white/80 text-sm font-child">Royal Badges</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
              <Heart className="w-8 h-8 text-pink-300 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white font-child">{child.currentStreak}</div>
              <div className="text-white/80 text-sm font-child">Day Streak</div>
            </div>
          </div>
        </div>
        
        {/* Magical background elements */}
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mt-16 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-1/4 w-24 h-24 bg-white/5 rounded-full animate-bounce"></div>
        <div className="absolute bottom-0 right-1/3 w-20 h-20 bg-white/5 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Kingdom Sections */}
      <div className="space-y-8">
        {/* Treasure Vault */}
        <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardHeader className="border-b border-yellow-200">
            <CardTitle className="flex items-center gap-3 text-yellow-800 text-2xl font-child">
              <div className="w-10 h-10 rounded-full bg-yellow-200 flex items-center justify-center">
                💰
              </div>
              Treasure Vault
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Current Wealth */}
              <div className="text-center">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl mb-6 animate-pulse">
                  <div className="text-5xl">💰</div>
                </div>
                <div className="text-6xl font-bold text-yellow-700 font-child mb-2">{child.currentCoins}</div>
                <div className="text-xl text-yellow-600 font-child">Royal Coins Available</div>
                
                {/* Star Jar */}
                <div className="mt-6 p-4 bg-white rounded-2xl border-2 border-yellow-200">
                  <div className="text-3xl mb-2">⭐</div>
                  <div className="text-2xl font-bold text-gray-700 font-child">{child.totalStars}</div>
                  <div className="text-sm text-gray-600 font-child">Stars in the jar</div>
                </div>
              </div>

              {/* Savings Goals */}
              <div>
                <h3 className="text-xl font-bold text-yellow-800 font-child mb-6 flex items-center gap-2">
                  <Target className="w-6 h-6" />
                  Savings Goals
                </h3>
                <div className="space-y-4">
                  {savingsGoals.map((goal, index) => (
                    <div key={goal.id} className="bg-white rounded-xl p-4 border-2 border-yellow-100">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{goal.icon || '🎁'}</div>
                          <div>
                            <div className="font-semibold text-gray-800 font-child">{goal.name}</div>
                            <div className="text-sm text-gray-600 font-child">{goal.coinCost} coins</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-yellow-600 font-child">
                            {Math.round(goal.progress)}%
                          </div>
                        </div>
                      </div>
                      <Progress value={goal.progress} className="h-4 mb-2" />
                      <div className="text-xs text-gray-500 font-child">
                        {goal.coinCost - child.currentCoins > 0 
                          ? `${goal.coinCost - child.currentCoins} more coins needed`
                          : "Ready to purchase! 🎉"
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Royal Store */}
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
          <CardHeader className="border-b border-blue-200">
            <CardTitle className="flex items-center justify-between text-blue-800 text-2xl font-child">
              <span className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center">
                  🏪
                </div>
                Royal Store
              </span>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-child">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Browse All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.slice(0, 6).map((reward) => (
                <div 
                  key={reward.id}
                  className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                >
                  <div className="text-center">
                    <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {reward.icon || '🎁'}
                    </div>
                    <h3 className="font-bold text-gray-800 font-child text-lg mb-2">{reward.name}</h3>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Coins className="w-5 h-5 text-yellow-500" />
                      <span className="text-xl font-bold text-yellow-600 font-child">{reward.coinCost}</span>
                    </div>
                    
                    <Button 
                      className={`w-full font-child ${
                        child.currentCoins >= reward.coinCost
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={child.currentCoins < reward.coinCost}
                    >
                      {child.currentCoins >= reward.coinCost ? (
                        <>
                          <Gift className="w-4 h-4 mr-2" />
                          Purchase
                        </>
                      ) : (
                        <>
                          <Coins className="w-4 h-4 mr-2" />
                          Need {reward.coinCost - child.currentCoins} more
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pet Palace & Trophy Hall Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pet Palace */}
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-teal-50">
            <CardHeader className="border-b border-green-200">
              <CardTitle className="flex items-center gap-3 text-green-800 text-xl font-child">
                <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center">
                  🐾
                </div>
                Pet Palace
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {child.pet ? (
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-4xl mb-6 animate-bounce-subtle">
                    {child.pet.type === 'dragon' ? '🐲' : child.pet.type === 'unicorn' ? '🦄' : '🐱'}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-800 font-child mb-2">
                    {child.pet.name || 'Your Pet'}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-3 border border-green-100">
                      <div className="text-2xl mb-1">😊</div>
                      <div className="text-sm text-green-600 font-child">
                        Mood: {child.pet.happiness >= 80 ? 'Happy' : child.pet.happiness >= 60 ? 'Good' : child.pet.happiness >= 40 ? 'Okay' : 'Sleepy'}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-green-100">
                      <div className="text-2xl mb-1">⚡</div>
                      <div className="text-sm text-green-600 font-child">Level {child.pet.level}</div>
                    </div>
                  </div>

                  {/* Pet Stats */}
                  <div className="space-y-3 mb-6">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 font-child">Happiness</span>
                        <span className="font-medium font-child">{child.pet.happiness}%</span>
                      </div>
                      <Progress value={child.pet.happiness} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 font-child">Energy</span>
                        <span className="font-medium font-child">{child.pet.energy}%</span>
                      </div>
                      <Progress value={child.pet.energy} className="h-2" />
                    </div>
                  </div>

                  {/* Pet Actions */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" size="sm" className="font-child border-green-200 text-green-700 hover:bg-green-50">
                      🍎 Feed
                    </Button>
                    <Button variant="outline" size="sm" className="font-child border-green-200 text-green-700 hover:bg-green-50">
                      🎾 Play
                    </Button>
                    <Button variant="outline" size="sm" className="font-child border-green-200 text-green-700 hover:bg-green-50">
                      🎨 Style
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🥚</div>
                  <h3 className="text-lg font-bold text-gray-700 font-child mb-2">Your Pet Awaits!</h3>
                  <p className="text-gray-600 font-child mb-4">Complete your first quest to hatch your companion</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trophy Hall */}
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader className="border-b border-purple-200">
              <CardTitle className="flex items-center gap-3 text-purple-800 text-xl font-child">
                <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center">
                  🏆
                </div>
                Trophy Hall
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {child.earnedBadges.length > 0 ? (
                <div className="space-y-4">
                  {/* Recent Badges */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {child.earnedBadges.slice(0, 6).map((earnedBadge) => (
                      <div 
                        key={earnedBadge.id}
                        className="bg-white rounded-xl p-3 border border-purple-100 text-center hover:shadow-md transition-shadow cursor-pointer group"
                      >
                        <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                          {earnedBadge.badge.icon}
                        </div>
                        <div className="text-xs font-medium text-purple-700 font-child">
                          {earnedBadge.badge.name}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Badge Stats */}
                  <div className="bg-white rounded-lg p-4 border border-purple-100">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-purple-600 font-child">{child.earnedBadges.length}</div>
                        <div className="text-sm text-gray-600 font-child">Total Badges</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600 font-child">
                          {child.earnedBadges.filter(b => 
                            new Date(b.earnedAt) >= new Date(new Date().setDate(new Date().getDate() - 7))
                          ).length}
                        </div>
                        <div className="text-sm text-gray-600 font-child">This Week</div>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-child">
                    <Trophy className="w-4 h-4 mr-2" />
                    View All Badges
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4 opacity-50">🏆</div>
                  <h3 className="text-lg font-bold text-gray-700 font-child mb-2">Trophy Hall Empty</h3>
                  <p className="text-gray-600 font-child">Complete quests to earn your first badge!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Purchased Rewards */}
        {rewardPurchases.length > 0 && (
          <Card className="border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-red-50">
            <CardHeader className="border-b border-pink-200">
              <CardTitle className="flex items-center gap-3 text-pink-800 text-xl font-child">
                <div className="w-8 h-8 rounded-full bg-pink-200 flex items-center justify-center">
                  🎁
                </div>
                My Treasures
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rewardPurchases.map((purchase) => (
                  <div key={purchase.id} className="bg-white rounded-xl p-4 border border-pink-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{purchase.reward.icon || '🎁'}</div>
                      <div>
                        <div className="font-semibold text-gray-800 font-child">{purchase.reward.name}</div>
                        <div className="text-sm text-gray-600 font-child">
                          Purchased {new Date(purchase.purchasedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-pink-100 text-pink-800 font-child">
                      Ready to Enjoy!
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}