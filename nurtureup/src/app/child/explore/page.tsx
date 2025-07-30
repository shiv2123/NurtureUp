import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Compass,
  BookOpen,
  Gamepad2,
  Star,
  Play,
  Award,
  Zap,
  Brain,
  Target,
  Clock
} from 'lucide-react'

export default async function ChildExplorePage() {
  const session = await getServerSession(authOptions)
  
  // Fetch child data
  const child = await prisma.child.findUnique({
    where: { userId: session!.user.id },
    include: {
      user: true,
      earnedBadges: {
        where: {
          badge: {
            category: 'LEARNING'
          }
        },
        include: { badge: true }
      }
    }
  })

  if (!child) {
    return <div>Profile not found</div>
  }

  // Mock learning games data - in real app this would come from database
  const learningGames = [
    {
      id: 1,
      title: 'Math Adventure',
      description: 'Solve puzzles and rescue the kingdom!',
      subject: 'Math',
      difficulty: 2,
      estimatedTime: '15 min',
      stars: 25,
      icon: '🔢',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 2,
      title: 'Reading Quest',
      description: 'Journey through magical stories',
      subject: 'Reading',
      difficulty: 1,
      estimatedTime: '20 min',
      stars: 30,
      icon: '📚',
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 3,
      title: 'Science Lab',
      description: 'Conduct cool experiments!',
      subject: 'Science',
      difficulty: 3,
      estimatedTime: '25 min',
      stars: 40,
      icon: '🧪',
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 4,
      title: 'Geography Explorer',
      description: 'Discover amazing places around the world',
      subject: 'Geography',
      difficulty: 2,
      estimatedTime: '18 min',
      stars: 35,
      icon: '🌍',
      color: 'from-orange-500 to-red-600'
    }
  ]

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 1) return { label: 'Easy', color: 'bg-green-100 text-green-800' }
    if (difficulty <= 2) return { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' }
    return { label: 'Hard', color: 'bg-red-100 text-red-800' }
  }

  return (
    <div className="space-y-6">
      {/* Explore Hero Header */}
      <Card className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 border-0 text-white overflow-hidden">
        <CardContent className="p-6 relative">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold font-child mb-2 flex items-center gap-2">
                  <Compass className="w-8 h-8 text-yellow-300" />
                  Explore & Learn
                </h1>
                <p className="text-purple-100 font-child">
                  Discover amazing adventures, {child.user.name}! 🌟
                </p>
              </div>
              <div className="text-center bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold mb-1">{child.earnedBadges.length}</div>
                <div className="text-sm text-white/90 font-child">Learning Badges</div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/15 rounded-xl p-3 text-center backdrop-blur-sm">
                <Brain className="w-5 h-5 mx-auto mb-1 text-white/90" />
                <div className="text-lg font-bold">12</div>
                <div className="text-xs text-white/80 font-child">Games Played</div>
              </div>
              <div className="bg-white/15 rounded-xl p-3 text-center backdrop-blur-sm">
                <Star className="w-5 h-5 mx-auto mb-1 text-yellow-300" />
                <div className="text-lg font-bold">480</div>
                <div className="text-xs text-white/80 font-child">Learning Stars</div>
              </div>
              <div className="bg-white/15 rounded-xl p-3 text-center backdrop-blur-sm">
                <Award className="w-5 h-5 mx-auto mb-1 text-yellow-300" />
                <div className="text-lg font-bold">Level 3</div>
                <div className="text-xs text-white/80 font-child">Explorer</div>
              </div>
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 opacity-50"></div>
        </CardContent>
      </Card>

      {/* Learning Games */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 font-child flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-purple-600" />
          Learning Adventures
        </h2>

        <div className="grid gap-4">
          {learningGames.map((game) => {
            const difficulty = getDifficultyLabel(game.difficulty)
            
            return (
              <Card key={game.id} className="hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-purple-300 group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`w-16 h-16 bg-gradient-to-br ${game.color} rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform`}>
                        {game.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900 font-child">{game.title}</h3>
                          <Badge className={`${difficulty.color} font-child text-xs`}>
                            {difficulty.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 font-child mb-3">{game.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1 text-blue-600">
                            <BookOpen className="w-4 h-4" />
                            <span className="font-child">{game.subject}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span className="font-child">{game.estimatedTime}</span>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-600">
                            <Star className="w-4 h-4" />
                            <span className="font-bold font-child">{game.stars} stars</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-3">
                    <Button className={`flex-1 bg-gradient-to-r ${game.color} text-white hover:scale-105 transition-transform font-child`}>
                      <Play className="w-4 h-4 mr-2" />
                      Start Adventure
                    </Button>
                    <Button variant="outline" className="font-child">
                      <Target className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Subject Areas */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 font-child flex items-center gap-2">
          <Brain className="w-5 h-5 text-green-600" />
          Subject Areas
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🔢</div>
              <h3 className="font-bold text-blue-900 font-child mb-2">Mathematics</h3>
              <p className="text-sm text-blue-700 font-child mb-3">Numbers, puzzles & problem solving</p>
              <Badge className="bg-blue-200 text-blue-800 font-child">5 games available</Badge>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📚</div>
              <h3 className="font-bold text-green-900 font-child mb-2">Reading & Writing</h3>
              <p className="text-sm text-green-700 font-child mb-3">Stories, words & creative writing</p>
              <Badge className="bg-green-200 text-green-800 font-child">7 games available</Badge>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🧪</div>
              <h3 className="font-bold text-purple-900 font-child mb-2">Science</h3>
              <p className="text-sm text-purple-700 font-child mb-3">Experiments & discoveries</p>
              <Badge className="bg-purple-200 text-purple-800 font-child">4 games available</Badge>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🌍</div>
              <h3 className="font-bold text-orange-900 font-child mb-2">Geography</h3>
              <p className="text-sm text-orange-700 font-child mb-3">Explore the world & cultures</p>
              <Badge className="bg-orange-200 text-orange-800 font-child">3 games available</Badge>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Learning Progress */}
      {child.earnedBadges.length > 0 && (
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-800 font-child flex items-center gap-2">
              <Award className="w-5 h-5" />
              Learning Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {child.earnedBadges.slice(0, 6).map((earnedBadge) => (
                <div key={earnedBadge.id} className="text-center p-4 bg-white rounded-xl border border-yellow-200 hover:shadow-md transition-shadow">
                  <div className="text-3xl mb-2">{earnedBadge.badge.icon}</div>
                  <h3 className="font-bold text-gray-900 font-child text-sm">{earnedBadge.badge.name}</h3>
                  <p className="text-xs text-gray-600 font-child mt-1">{earnedBadge.badge.description}</p>
                </div>
              ))}
            </div>
            {child.earnedBadges.length > 6 && (
              <div className="text-center mt-4">
                <Button variant="outline" className="font-child">
                  View All {child.earnedBadges.length} Learning Badges
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Daily Learning Goal */}
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 font-child flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-600" />
                Daily Learning Goal
              </h3>
              <p className="text-emerald-700 font-child">Complete 2 learning games today</p>
            </div>
            <div className="text-center bg-white rounded-xl p-3">
              <div className="text-2xl font-bold text-emerald-600">1/2</div>
              <div className="text-xs text-emerald-600 font-child">Games</div>
            </div>
          </div>
          
          <div className="bg-emerald-200 rounded-full h-3 mb-2">
            <div className="bg-emerald-600 h-3 rounded-full w-1/2"></div>
          </div>
          
          <p className="text-sm text-emerald-700 font-child">
            🎯 You're halfway there! Complete one more game to earn bonus stars!
          </p>
        </CardContent>
      </Card>

      {/* Encouragement Message */}
      <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200">
        <CardContent className="p-6 text-center">
          <div className="text-4xl mb-3">🌟</div>
          <h3 className="text-lg font-bold text-gray-900 font-child mb-2">
            Keep Exploring!
          </h3>
          <p className="text-pink-700 font-child">
            Every game you play makes you smarter and stronger! 
            Learning is the greatest adventure of all! 🚀
          </p>
        </CardContent>
      </Card>
    </div>
  )
}