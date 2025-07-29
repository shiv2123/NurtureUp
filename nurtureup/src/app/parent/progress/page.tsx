import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Calendar, 
  Trophy, 
  TrendingUp, 
  Camera,
  BarChart3,
  Star,
  Target,
  Heart,
  Sparkles,
  Clock
} from 'lucide-react'

export default async function ProgressHubPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <BarChart3 className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Progress Hub</h1>
          </div>
          <p className="text-xl text-green-100 mb-4">
            Track your family's growth journey - celebrate milestones, achievements, and memories
          </p>
          <div className="flex items-center space-x-6 text-green-100">
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Family Timeline
            </span>
            <span className="flex items-center">
              <Trophy className="w-4 h-4 mr-2" />
              Achievement Gallery
            </span>
            <span className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Insights Dashboard
            </span>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
      </div>

      {/* Main Progress Interface */}
      <Tabs defaultValue="timeline" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-14 bg-white border border-gray-200 p-1">
          <TabsTrigger value="timeline" className="flex items-center space-x-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
            <Calendar className="w-4 h-4" />
            <span>Family Timeline</span>
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center space-x-2 data-[state=active]:bg-yellow-600 data-[state=active]:text-white">
            <Trophy className="w-4 h-4" />
            <span>Achievement Gallery</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center space-x-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <TrendingUp className="w-4 h-4" />
            <span>Insights Dashboard</span>
          </TabsTrigger>
        </TabsList>

        {/* Family Timeline Tab */}
        <TabsContent value="timeline" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Timeline Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">📅 Timeline View</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Camera className="w-4 h-4 mr-2" />
                  Add Milestone
                </Button>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full">Calendar View</Button>
                  <Button variant="outline" size="sm" className="w-full">Photo Feed</Button>
                  <Button variant="outline" size="sm" className="w-full">Monthly View</Button>
                </div>
                <div className="pt-4 border-t">
                  <div className="text-xs font-medium text-gray-600 mb-2">Quick Filters</div>
                  <div className="space-y-1">
                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                      🎉 Celebrations
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                      🏆 Achievements
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                      📚 Learning
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                      🎨 Activities
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline Feed */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-green-600" />
                      Family Memories
                    </span>
                    <Button variant="outline" size="sm">
                      Export Timeline
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-16 text-gray-500">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">Your Family Timeline Awaits</h3>
                    <p className="mb-4">Capture precious moments, milestones, and achievements</p>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Camera className="w-4 h-4 mr-2" />
                      Add Your First Milestone
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Achievement Gallery Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Achievement Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">🏆 Badge Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">12</div>
                    <div className="text-xs text-yellow-600">Total Badges</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">3</div>
                    <div className="text-xs text-blue-600">This Week</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-600">Badge Categories</div>
                  <div className="space-y-2">
                    {[
                      { name: 'Streak Master', count: 4, color: 'bg-red-100 text-red-600' },
                      { name: 'Learning Star', count: 3, color: 'bg-blue-100 text-blue-600' },
                      { name: 'Helper Hero', count: 3, color: 'bg-green-100 text-green-600' },
                      { name: 'Special Events', count: 2, color: 'bg-purple-100 text-purple-600' }
                    ].map(category => (
                      <div key={category.name} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">{category.name}</span>
                        <span className={`px-2 py-1 rounded-full ${category.color}`}>
                          {category.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Badge Gallery */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                    Achievement Gallery
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-16 text-gray-500">
                    <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">Badge Collection Coming Soon</h3>
                    <p className="mb-4">As your children complete quests and reach milestones, their badges will appear here</p>
                    <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-gray-300" />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Insights Dashboard Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Family Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Family Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">This Week's Progress</span>
                    <span className="text-sm text-gray-600">85%</span>
                  </div>
                  <Progress value={85} className="h-3" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Target className="w-6 h-6 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold text-green-600">47</div>
                    <div className="text-xs text-green-600">Quests Completed</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <Star className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
                    <div className="text-2xl font-bold text-yellow-600">235</div>
                    <div className="text-xs text-yellow-600">Stars Earned</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-medium text-gray-700">Weekly Trends</div>
                  {[
                    { day: 'Monday', value: 90 },
                    { day: 'Tuesday', value: 75 },
                    { day: 'Wednesday', value: 95 },
                    { day: 'Thursday', value: 80 },
                    { day: 'Friday', value: 85 },
                  ].map(day => (
                    <div key={day.day} className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">{day.day}</span>
                      <div className="flex-1 mx-3">
                        <Progress value={day.value} className="h-2" />
                      </div>
                      <span className="text-xs font-medium">{day.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Individual Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-600" />
                  Individual Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: 'Emma', avatar: '👧', progress: 95, streak: 7, mood: 'Excellent' },
                  { name: 'Leo', avatar: '👦', progress: 80, streak: 4, mood: 'Good' },
                  { name: 'Mia', avatar: '👶', progress: 70, streak: 2, mood: 'Improving' }
                ].map(child => (
                  <div key={child.name} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{child.avatar}</div>
                        <div>
                          <div className="font-medium">{child.name}</div>
                          <div className="text-xs text-gray-600">{child.mood}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">{child.progress}%</div>
                        <div className="text-xs text-gray-600">{child.streak} day streak</div>
                      </div>
                    </div>
                    <Progress value={child.progress} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Weekly Pulse Report */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  Weekly Pulse Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div className="text-sm font-semibold text-green-600 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Top 3 Wins 🎉
                    </div>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Emma's 7-day streak!
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Leo mastered multiplication
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Zero screen time battles
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="text-sm font-semibold text-blue-600">
                      Growth Areas 📈
                    </div>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        Morning routine consistency
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        Homework time management
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        Sibling cooperation
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="text-sm font-semibold text-purple-600">
                      Next Week's Focus 🎯
                    </div>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                        Bedtime routine quest
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                        Family cooking adventure
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                        Reading challenge
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}