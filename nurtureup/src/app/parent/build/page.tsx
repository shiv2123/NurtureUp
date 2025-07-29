import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { 
  Hammer, 
  Gift, 
  Users, 
  Plus,
  Wand2,
  Trophy,
  Settings
} from 'lucide-react'

export default async function FamilyBuilderPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <Hammer className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Family Builder</h1>
          </div>
          <p className="text-xl text-purple-100 mb-4">
            Design your family's growth system - create quests, rewards, and set up your adventure
          </p>
          <div className="flex items-center space-x-6 text-purple-100">
            <span className="flex items-center">
              <Wand2 className="w-4 h-4 mr-2" />
              Quest Forge
            </span>
            <span className="flex items-center">
              <Gift className="w-4 h-4 mr-2" />
              Reward Atelier
            </span>
            <span className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Family Settings
            </span>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
      </div>

      {/* Main Builder Interface */}
      <Tabs defaultValue="quests" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-14 bg-white border border-gray-200 p-1">
          <TabsTrigger value="quests" className="flex items-center space-x-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Wand2 className="w-4 h-4" />
            <span>Quest Forge</span>
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center space-x-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
            <Gift className="w-4 h-4" />
            <span>Reward Atelier</span>
          </TabsTrigger>
          <TabsTrigger value="family" className="flex items-center space-x-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <Users className="w-4 h-4" />
            <span>Family Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Quest Forge Tab */}
        <TabsContent value="quests" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Templates */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-blue-600" />
                  Quick Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { icon: '🛏️', name: 'Make Bed', stars: 5 },
                    { icon: '🧽', name: 'Dishes', stars: 8 },
                    { icon: '🎒', name: 'Homework', stars: 15 },
                    { icon: '🐕', name: 'Feed Pet', stars: 5 },
                    { icon: '🚿', name: 'Shower', stars: 10 },
                    { icon: '🧹', name: 'Tidy Room', stars: 12 },
                    { icon: '📚', name: 'Reading', stars: 20 },
                    { icon: '🌱', name: 'Water Plants', stars: 6 }
                  ].map((template) => (
                    <Card key={template.name} className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-300">
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl mb-2">{template.icon}</div>
                        <div className="font-medium text-sm">{template.name}</div>
                        <div className="text-xs text-yellow-600 mt-1">
                          {'⭐'.repeat(Math.min(template.stars / 5, 5))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Custom Quest
                </Button>
              </CardContent>
            </Card>

            {/* Quest Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">📱 Child's View Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border-2 border-dashed border-blue-200">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🎯</div>
                    <div className="font-bold text-blue-800 mb-1">New Quest Available!</div>
                    <div className="text-sm text-gray-600 mb-3">Make Your Bed</div>
                    <div className="flex justify-center mb-3">
                      {'⭐'.repeat(3)}
                    </div>
                    <div className="text-xs text-gray-500 mb-3">📸 Photo proof needed</div>
                    <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                      Accept Quest
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Quests */}
          <Card>
            <CardHeader>
              <CardTitle>🎯 Active Quests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Your created quests will appear here</p>
                <p className="text-sm mt-2">Start by creating your first quest above!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reward Atelier Tab */}
        <TabsContent value="rewards" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reward Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-green-600" />
                  Reward Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: '🍦', name: 'Treats', count: 5 },
                    { icon: '🎮', name: 'Screen Time', count: 3 },
                    { icon: '🎬', name: 'Experiences', count: 4 },
                    { icon: '🎁', name: 'Items', count: 6 }
                  ].map((category) => (
                    <Card key={category.name} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl mb-2">{category.icon}</div>
                        <div className="font-medium text-sm">{category.name}</div>
                        <div className="text-xs text-gray-500">{category.count} rewards</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Custom Reward
                </Button>
              </CardContent>
            </Card>

            {/* Budget Settings */}
            <Card>
              <CardHeader>
                <CardTitle>💰 Budget Guardrails</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Monthly Coin Limit</label>
                  <div className="mt-1 text-2xl font-bold text-green-600">500 coins</div>
                  <div className="text-xs text-gray-500">Prevents reward inflation</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Star to Coin Ratio</label>
                  <div className="mt-1 text-lg font-medium">10 ⭐ = 1 💰</div>
                </div>
                <Button variant="outline" className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Adjust Settings
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Wishlist from Kids */}
          <Card>
            <CardHeader>
              <CardTitle>📝 Kids' Wish List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Gift className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Kids' dream items will appear here</p>
                <p className="text-sm mt-2">When children add items to their wishlist, you can approve or edit them here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Family Settings Tab */}
        <TabsContent value="family" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Family Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Manage your family members</p>
                  <p className="text-sm mt-2">Add children, set preferences, and configure their adventure settings</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>⚙️ Family Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Configure family rules</p>
                  <p className="text-sm mt-2">Set limits, preferences, and customize the family experience</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}