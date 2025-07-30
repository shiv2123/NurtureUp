import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  User,
  Crown,
  Star,
  Coins,
  Trophy,
  Gift,
  Settings,
  Palette,
  Heart,
  Zap,
  Target,
  ShoppingBag,
  Award,
  Calendar
} from 'lucide-react'

export default async function ChildMePage() {
  const session = await getServerSession(authOptions)
  
  // Fetch comprehensive child data
  const [child, rewards, rewardPurchases, recentBadges] = await Promise.all([
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
      orderBy: { coinCost: 'asc' },
      take: 6
    }),
    prisma.rewardPurchase.findMany({
      where: { 
        childId: session!.user.id,
        isRedeemed: false
      },
      include: { reward: true },
      orderBy: { purchasedAt: 'desc' }
    }),
    Promise.resolve([]) // Simplified for now - recent badges would come from child.earnedBadges
  ])

  if (!child) {
    return <div>Profile not found</div>
  }

  // Calculate level and progress
  const currentLevel = Math.floor(child.totalStars / 100) + 1
  const starsInCurrentLevel = child.totalStars % 100
  const starsToNextLevel = 100 - starsInCurrentLevel
  const levelProgress = (starsInCurrentLevel / 100) * 100

  return (
    <div className="space-y-6">
      {/* Profile Hero Header */}
      <Card className="bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 border-0 text-white overflow-hidden">
        <CardContent className="p-6 relative">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl backdrop-blur-sm animate-pulse">
                  👑
                </div>
                <div>
                  <h1 className="text-3xl font-bold font-child mb-1">
                    {child.user.name}
                  </h1>
                  <p className="text-purple-100 font-child text-lg">
                    Level {currentLevel} Explorer
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-4 h-4 text-yellow-300" />
                    <span className="text-sm text-white/90 font-child">
                      {child.totalStars} total stars earned
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-center bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
                <Crown className="w-8 h-8 mx-auto mb-1 text-yellow-300" />
                <div className="text-lg font-bold">Level {currentLevel}</div>
                <div className="text-xs text-white/90 font-child">Current Level</div>
              </div>
            </div>

            {/* Level Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-sm font-child mb-2">
                <span>Progress to Level {currentLevel + 1}</span>
                <span>{starsInCurrentLevel}/100 stars</span>
              </div>
              <Progress value={levelProgress} className="h-3 bg-white/20" />
              <p className="text-xs text-white/80 font-child mt-1">
                {starsToNextLevel} more stars to level up! 🚀
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-white/15 rounded-xl p-3 text-center backdrop-blur-sm">
                <Coins className="w-5 h-5 mx-auto mb-1 text-yellow-300" />
                <div className="text-lg font-bold">{child.currentCoins}</div>
                <div className="text-xs text-white/80 font-child">Coins</div>
              </div>
              <div className="bg-white/15 rounded-xl p-3 text-center backdrop-blur-sm">
                <Trophy className="w-5 h-5 mx-auto mb-1 text-yellow-300" />
                <div className="text-lg font-bold">{child.earnedBadges.length}</div>
                <div className="text-xs text-white/80 font-child">Badges</div>
              </div>
              <div className="bg-white/15 rounded-xl p-3 text-center backdrop-blur-sm">
                <Zap className="w-5 h-5 mx-auto mb-1 text-yellow-300" />
                <div className="text-lg font-bold">{child.currentStreak}</div>
                <div className="text-xs text-white/80 font-child">Day Streak</div>
              </div>
              <div className="bg-white/15 rounded-xl p-3 text-center backdrop-blur-sm">
                <Heart className="w-5 h-5 mx-auto mb-1 text-pink-300" />
                <div className="text-lg font-bold">98%</div>
                <div className="text-xs text-white/80 font-child">Happiness</div>
              </div>
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 opacity-50"></div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all cursor-pointer group">
          <CardContent className="p-4 text-center">
            <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-blue-600 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-medium text-blue-900 font-child">Shop Rewards</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all cursor-pointer group">
          <CardContent className="p-4 text-center">
            <Palette className="w-8 h-8 mx-auto mb-2 text-green-600 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-medium text-green-900 font-child">Customize</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all cursor-pointer group">
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-purple-600 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-medium text-purple-900 font-child">My Badges</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all cursor-pointer group">
          <CardContent className="p-4 text-center">
            <Settings className="w-8 h-8 mx-auto mb-2 text-orange-600 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-medium text-orange-900 font-child">Settings</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements */}
      {child.earnedBadges.length > 0 && (
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-800 font-child flex items-center gap-2">
              <Award className="w-5 h-5" />
              Recent Achievements 🎉
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {child.earnedBadges.slice(0, 3).map((earnedBadge: any) => (
                <div key={earnedBadge.id} className="text-center p-4 bg-white rounded-xl border border-yellow-200 hover:shadow-md transition-shadow group">
                  <div className="text-4xl mb-2 group-hover:animate-bounce">{earnedBadge.badge.icon}</div>
                  <h3 className="font-bold text-gray-900 font-child text-sm">{earnedBadge.badge.name}</h3>
                  <p className="text-xs text-gray-600 font-child mt-1">{earnedBadge.badge.description}</p>
                  <div className="text-xs text-yellow-700 mt-2 flex items-center justify-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(earnedBadge.earnedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-4">
              <Button className="bg-yellow-600 hover:bg-yellow-700 text-white font-child">
                <Trophy className="w-4 h-4 mr-2" />
                View All {child.earnedBadges.length} Badges
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rewards Shopping */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-child">
              <Gift className="w-5 h-5 text-purple-600" />
              Reward Shop
            </span>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white font-child">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Browse All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {rewards.map((reward: any) => (
              <div 
                key={reward.id}
                className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="text-center">
                  <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">🎁</div>
                  <h3 className="font-semibold text-gray-900 font-child text-sm mb-1">{reward.title}</h3>
                  <div className="flex items-center justify-center gap-1 mb-3">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-bold text-yellow-600 font-child">{reward.coinCost} coins</span>
                  </div>
                  
                  <Button 
                    className={`w-full font-child text-xs ${
                      child.currentCoins >= reward.coinCost
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={child.currentCoins < reward.coinCost}
                  >
                    {child.currentCoins >= reward.coinCost ? (
                      <>
                        <Gift className="w-3 h-3 mr-1" />
                        Buy Now
                      </>
                    ) : (
                      <>
                        <Coins className="w-3 h-3 mr-1" />
                        Need {reward.coinCost - child.currentCoins} more
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Savings Goal */}
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h4 className="font-semibold text-blue-900 font-child mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Savings Goal
            </h4>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-700 font-child">Saving for: Nintendo Switch Game</span>
              <span className="text-sm font-bold text-blue-900">{child.currentCoins}/150 coins</span>
            </div>
            <Progress value={(child.currentCoins / 150) * 100} className="h-3 mb-2" />
            <p className="text-xs text-blue-600 font-child">
              You're {Math.round((child.currentCoins / 150) * 100)}% of the way there! Keep earning stars! 🌟
            </p>
          </div>
        </CardContent>
      </Card>

      {/* My Treasures */}
      {rewardPurchases.length > 0 && (
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-800 font-child flex items-center gap-2">
              <Gift className="w-5 h-5" />
              My Treasures 💎
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rewardPurchases.map((purchase: any) => (
                <div key={purchase.id} className="bg-white rounded-xl p-4 border border-emerald-100 flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">🎁</div>
                    <div>
                      <div className="font-semibold text-gray-800 font-child">{purchase.reward.title}</div>
                      <div className="text-sm text-gray-600 font-child">
                        Purchased {new Date(purchase.purchasedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 font-child">
                    Ready! ✨
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Customization */}
      <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200">
        <CardHeader>
          <CardTitle className="text-pink-800 font-child flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Personalize Your Space
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-xl border border-pink-100 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🎨</div>
              <div className="text-sm font-medium text-pink-900 font-child">Theme Colors</div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl border border-pink-100 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🖼️</div>
              <div className="text-sm font-medium text-pink-900 font-child">Avatar</div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl border border-pink-100 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🎵</div>
              <div className="text-sm font-medium text-pink-900 font-child">Sounds</div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl border border-pink-100 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🌟</div>
              <div className="text-sm font-medium text-pink-900 font-child">Effects</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Summary */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <CardContent className="p-6 text-center">
          <User className="w-8 h-8 mx-auto mb-3 text-indigo-600" />
          <h3 className="text-lg font-bold text-gray-900 font-child mb-2">
            You're Amazing! 🌟
          </h3>
          <p className="text-indigo-700 font-child mb-4">
            Level {currentLevel} • {child.totalStars} stars earned • {child.earnedBadges.length} badges collected
          </p>
          <div className="bg-white rounded-full p-3 inline-block">
            <div className="text-2xl">🏆✨👑</div>
          </div>
          <p className="text-sm text-indigo-600 font-child mt-3">
            Keep being awesome and reaching for the stars!
          </p>
        </CardContent>
      </Card>
    </div>
  )
}