import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Heart,
  MessageCircle,
  Calendar,
  Users,
  Camera,
  Send,
  Star,
  Clock,
  Gift,
  Sparkles,
  Trophy
} from 'lucide-react'

export default async function ChildFamilyPage() {
  const session = await getServerSession(authOptions)
  
  // Fetch family data
  const [child, family, familyMembers, recentActivities] = await Promise.all([
    prisma.child.findUnique({
      where: { userId: session!.user.id },
      include: { user: true }
    }),
    prisma.family.findUnique({
      where: { id: session!.user.familyId! },
      include: { settings: true }
    }),
    prisma.child.findMany({
      where: { 
        familyId: session!.user.familyId!
      },
      include: { 
        user: true
      }
    }),
    // Mock recent family activities - in real app this would be from database
    Promise.resolve([
      {
        id: 1,
        type: 'task_completion',
        user: 'Mom',
        message: 'approved your Math Homework task! 🎉',
        time: '2 minutes ago',
        icon: '✅'
      },
      {
        id: 2,
        type: 'badge_earned',
        user: 'Sister Emma',
        message: 'earned the Helper Hero badge! 🏆',
        time: '1 hour ago',
        icon: '🏆'
      },
      {
        id: 3,
        type: 'milestone',
        user: 'Dad',
        message: 'added a new family milestone: Beach Trip! 🏖️',
        time: '3 hours ago',
        icon: '📸'
      }
    ])
  ])

  if (!child) {
    return <div>Profile not found</div>
  }

  // Mock upcoming family events
  const upcomingEvents = [
    {
      id: 1,
      title: 'Family Movie Night',
      date: 'Tonight, 7:00 PM',
      description: 'Vote on what movie to watch!',
      icon: '🍿'
    },
    {
      id: 2,
      title: 'Saturday Chores',
      date: 'Tomorrow, 10:00 AM',
      description: 'Team cleaning day with music',
      icon: '🧹'
    },
    {
      id: 3,
      title: 'Grandma Visit',
      date: 'Sunday, 2:00 PM',
      description: 'Grandma is coming for lunch!',
      icon: '👵'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Family Hero Header */}
      <Card className="bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-600 border-0 text-white overflow-hidden">
        <CardContent className="p-6 relative">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold font-child mb-2 flex items-center gap-2">
                  <Heart className="w-8 h-8 text-pink-300" />
                  Family Hub
                </h1>
                <p className="text-purple-100 font-child">
                  Stay connected with your family, {child.user.name}! 👨‍👩‍👧‍👦
                </p>
              </div>
              <div className="text-center bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold mb-1">{familyMembers.length}</div>
                <div className="text-sm text-white/90 font-child">Family Members</div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/15 rounded-xl p-3 text-center backdrop-blur-sm">
                <MessageCircle className="w-5 h-5 mx-auto mb-1 text-white/90" />
                <div className="text-lg font-bold">12</div>
                <div className="text-xs text-white/80 font-child">Messages</div>
              </div>
              <div className="bg-white/15 rounded-xl p-3 text-center backdrop-blur-sm">
                <Calendar className="w-5 h-5 mx-auto mb-1 text-white/90" />
                <div className="text-lg font-bold">3</div>
                <div className="text-xs text-white/80 font-child">Events</div>
              </div>
              <div className="bg-white/15 rounded-xl p-3 text-center backdrop-blur-sm">
                <Camera className="w-5 h-5 mx-auto mb-1 text-white/90" />
                <div className="text-lg font-bold">8</div>
                <div className="text-xs text-white/80 font-child">Photos</div>
              </div>
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 opacity-50"></div>
        </CardContent>
      </Card>

      {/* Quick Communication */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800 font-child flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Quick Message
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white rounded-xl p-4 border border-blue-100">
            <textarea 
              className="w-full p-3 border border-gray-200 rounded-lg resize-none font-child" 
              rows={3}
              placeholder="Send a message to your family... (e.g., 'I finished my homework!' or 'Can someone help me?')"
            />
            <div className="flex justify-between items-center mt-3">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="font-child">
                  <Camera className="w-4 h-4 mr-1" />
                  Photo
                </Button>
                <Button variant="outline" size="sm" className="font-child">
                  📍 Location
                </Button>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-child">
                <Send className="w-4 h-4 mr-1" />
                Send
              </Button>
            </div>
          </div>

          {/* Quick message buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="font-child text-left justify-start h-auto p-3">
              <div>
                <div className="font-semibold">✅ Task Done!</div>
                <div className="text-xs text-gray-500">I completed my task</div>
              </div>
            </Button>
            <Button variant="outline" className="font-child text-left justify-start h-auto p-3">
              <div>
                <div className="font-semibold">🆘 Need Help</div>
                <div className="text-xs text-gray-500">Can someone help me?</div>
              </div>
            </Button>
            <Button variant="outline" className="font-child text-left justify-start h-auto p-3">
              <div>
                <div className="font-semibold">❤️ Love You!</div>
                <div className="text-xs text-gray-500">Send love to family</div>
              </div>
            </Button>
            <Button variant="outline" className="font-child text-left justify-start h-auto p-3">
              <div>
                <div className="font-semibold">🎉 Great News!</div>
                <div className="text-xs text-gray-500">Share good news</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Family Members */}
      <Card>
        <CardHeader>
          <CardTitle className="font-child flex items-center gap-2">
            <Users className="w-5 h-5 text-green-600" />
            My Family
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {familyMembers.map((member: any) => (
              <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br from-green-500 to-emerald-600">
                    {member.user.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 font-child">{member.user.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">
                        👧 Child
                      </Badge>
                      <span className="text-xs text-gray-500 flex items-center">
                        <Star className="w-3 h-3 mr-1 text-yellow-500" />
                        {member.totalStars} stars
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="font-child">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Message
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Family Events */}
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-yellow-800 font-child flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Upcoming Family Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-center space-x-4 p-4 bg-white rounded-xl border border-yellow-100 hover:shadow-md transition-shadow">
                <div className="text-3xl">{event.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 font-child">{event.title}</h3>
                  <p className="text-sm text-gray-600 font-child">{event.description}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-yellow-700">
                    <Clock className="w-3 h-3" />
                    {event.date}
                  </div>
                </div>
                <Button variant="outline" size="sm" className="font-child">
                  Details
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Family Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="font-child flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Family Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivities.map((activity: any) => (
              <div key={activity.id} className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-xl">{activity.icon}</div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 font-child">
                    <span className="font-semibold">{activity.user}</span> {activity.message}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {activity.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <Button variant="outline" className="font-child">
              View More Activity
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Family Achievements */}
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
        <CardContent className="p-6 text-center">
          <Trophy className="w-8 h-8 mx-auto mb-3 text-emerald-600" />
          <h3 className="text-lg font-bold text-gray-900 font-child mb-2">
            Family Team Power! 💪
          </h3>
          <p className="text-emerald-700 font-child mb-4">
            Together we've earned {familyMembers.reduce((sum: number, m: any) => sum + (m.totalStars || 0), 0)} stars this month! 
            Keep working as a team! 🌟
          </p>
          <div className="bg-white rounded-full p-3 inline-block">
            <div className="text-2xl">👨‍👩‍👧‍👦✨</div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Help */}
      <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-gray-900 font-child mb-4 flex items-center gap-2">
            🆘 Need Help?
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="font-child h-auto p-4 justify-start">
              <div className="text-left">
                <div className="font-semibold text-red-700">Emergency Button</div>
                <div className="text-xs text-gray-500">For urgent help</div>
              </div>
            </Button>
            <Button variant="outline" className="font-child h-auto p-4 justify-start">
              <div className="text-left">
                <div className="font-semibold text-blue-700">Ask Parent</div>
                <div className="text-xs text-gray-500">Send help request</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}