import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users,
  Settings,
  Gift,
  UserPlus,
  Crown,
  Star,
  Coins,
  Shield,
  Bell,
  Clock
} from 'lucide-react'

export default async function ParentFamilyPage() {
  const session = await getServerSession(authOptions)
  
  // Fetch family data
  const [family, children, rewards] = await Promise.all([
    prisma.family.findUnique({
      where: { id: session!.user.familyId! },
      include: { 
        settings: true,
        members: {
          include: { user: true }
        }
      }
    }),
    prisma.child.findMany({
      where: { familyId: session!.user.familyId! },
      include: {
        user: true,
        earnedBadges: true
      }
    }),
    prisma.reward.findMany({
      where: { familyId: session!.user.familyId! },
      orderBy: { coinCost: 'asc' }
    })
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Users className="w-6 h-6" />
          Family Management
        </h1>
        <p className="text-purple-100">
          Manage family settings, profiles, and rewards marketplace
        </p>
      </div>

      {/* Quick Settings */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-4 text-center">
            <Settings className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-sm font-medium text-blue-900">Family Settings</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-4 text-center">
            <UserPlus className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <div className="text-sm font-medium text-green-900">Add Child</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-4 text-center">
            <Gift className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <div className="text-sm font-medium text-purple-900">Manage Rewards</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-4 text-center">
            <Bell className="w-8 h-8 mx-auto mb-2 text-orange-600" />
            <div className="text-sm font-medium text-orange-900">Notifications</div>
          </CardContent>
        </Card>
      </div>

      {/* Family Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-600" />
              Family Members
            </span>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Child
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {/* Parents */}
            {family?.members.filter(member => member.role === 'PARENT').map((parent) => (
              <div key={parent.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {parent.user.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{parent.user.name}</h3>
                    <p className="text-sm text-gray-600">{parent.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-blue-100 text-blue-800">
                    <Shield className="w-3 h-3 mr-1" />
                    Parent
                  </Badge>
                  <Button variant="outline" size="sm">
                    Settings
                  </Button>
                </div>
              </div>
            ))}

            {/* Children */}
            {children.map((child) => (
              <div key={child.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {child.user.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{child.user.name}</h3>
                    <p className="text-sm text-gray-600">Age {child.age || 'Not set'}</p>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-xs text-gray-500 flex items-center">
                        <Star className="w-3 h-3 mr-1 text-yellow-500" />
                        {child.totalStars} stars
                      </span>
                      <span className="text-xs text-gray-500 flex items-center">
                        <Coins className="w-3 h-3 mr-1 text-yellow-500" />
                        {child.currentCoins} coins
                      </span>
                      <span className="text-xs text-gray-500">
                        🏆 {child.earnedBadges.length} badges
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-100 text-green-800">
                    Level {Math.floor(child.totalStars / 100) + 1}
                  </Badge>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Family Settings Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Currency & Rewards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-600" />
              Currency System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-yellow-800">Star to Coin Ratio</span>
                <span className="text-lg font-bold text-yellow-900">
                  10:1
                </span>
              </div>
              <p className="text-xs text-yellow-700">
                Every 10 stars = 1 coin
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Daily task limit per child</span>
                <span className="font-medium">Unlimited</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Family timezone</span>
                <span className="font-medium">UTC</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Screen Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Screen Time Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">Default Daily Limit</span>
                <span className="text-lg font-bold text-blue-900">3h 00m</span>
              </div>
              <p className="text-xs text-blue-700">
                Can be customized per child
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Bonus time per task</span>
                <span className="font-medium">15 minutes</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Weekend multiplier</span>
                <span className="font-medium">1.5x</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rewards Marketplace */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-purple-600" />
              Rewards Marketplace ({rewards.length} rewards)
            </span>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              <Gift className="w-4 h-4 mr-2" />
              Add Reward
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.slice(0, 6).map((reward) => (
              <div 
                key={reward.id}
                className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">🎁</div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{reward.title}</h3>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-bold text-yellow-600">{reward.coinCost}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {reward.category}
                  </Badge>
                </div>
              </div>
            ))}
            
            {rewards.length > 6 && (
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl mb-2">➕</div>
                  <p className="text-sm text-purple-700 font-medium">
                    +{rewards.length - 6} more rewards
                  </p>
                  <Button variant="outline" size="sm" className="mt-2 text-purple-600 border-purple-300">
                    View All
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Family Statistics */}
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-800">📊 Family Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-emerald-600">
                {children.reduce((sum, child) => sum + child.totalStars, 0)}
              </div>
              <div className="text-sm text-emerald-700">Total Family Stars</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-emerald-600">
                {children.reduce((sum, child) => sum + child.currentCoins, 0)}
              </div>
              <div className="text-sm text-emerald-700">Total Family Coins</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-emerald-600">
                {children.reduce((sum, child) => sum + child.earnedBadges.length, 0)}
              </div>
              <div className="text-sm text-emerald-700">Total Badges Earned</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-emerald-600">
                {Math.max(...children.map(child => child.currentStreak))}
              </div>
              <div className="text-sm text-emerald-700">Longest Streak</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}