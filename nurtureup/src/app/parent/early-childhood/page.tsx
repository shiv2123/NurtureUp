'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Plus, BookOpen, CheckSquare, Calendar, User, Home, Star, Clock, GraduationCap, Target } from 'lucide-react'
import { useChoreManagement } from '@/hooks/useChoreManagement'
import { useLearningActivities } from '@/hooks/useLearningActivities'

/**
 * Early Childhood Parent Interface (Blueprint 3.4)
 * 
 * Navigation: Home, Chores, Learn, Calendar
 * Features: Chore board, Learning games, School readiness, Family calendar, Star rewards
 */
export default function EarlyChildhoodParentPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('home')
  const [childId, setChildId] = useState<string | null>(null)
  const [childAge, setChildAge] = useState('5 yrs 2 mos')
  const [showSchoolReadiness, setShowSchoolReadiness] = useState(false)
  const [showAddChore, setShowAddChore] = useState(false)
  const [newChoreTitle, setNewChoreTitle] = useState('')
  const [newChoreStars, setNewChoreStars] = useState(3)

  // Real data hooks
  const { chores, stats: choreStats, addChore, completeChore, deleteChore, loading: choresLoading } = useChoreManagement(childId || undefined)
  const { activities, stats: learningStats, spotlight, startLearningActivity, loading: learningLoading } = useLearningActivities(childId || undefined)

  // Get child ID from family - for demo, we'll use the first child in early childhood age
  useEffect(() => {
    const fetchChild = async () => {
      if (session?.user?.familyId) {
        try {
          const response = await fetch('/api/children')
          if (response.ok) {
            const children = await response.json()
            if (children.length > 0) {
              const earlyChild = children.find((child: any) => {
                const age = calculateAge(new Date(child.dateOfBirth))
                return age >= 4 && age <= 6
              }) || children[0] // Fallback to first child
              
              setChildId(earlyChild.id)
              setChildAge(formatChildAge(new Date(earlyChild.dateOfBirth)))
            }
          }
        } catch (error) {
          console.error('Failed to fetch children:', error)
        }
      }
    }
    
    fetchChild()
  }, [session])

  const tabs = [
    { id: 'home', label: 'Home', icon: BookOpen },
    { id: 'chores', label: 'Chores', icon: CheckSquare },
    { id: 'learn', label: 'Learn', icon: GraduationCap },
    { id: 'calendar', label: 'Calendar', icon: Calendar }
  ]

  // Helper functions
  const calculateAge = (birthDate: Date): number => {
    const today = new Date()
    const diffMs = today.getTime() - birthDate.getTime()
    return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365))
  }

  const formatChildAge = (birthDate: Date): string => {
    const today = new Date()
    const years = today.getFullYear() - birthDate.getFullYear()
    const months = today.getMonth() - birthDate.getMonth()
    const adjustedMonths = months < 0 ? months + 12 : months
    const adjustedYears = months < 0 ? years - 1 : years
    
    return `${adjustedYears} yrs ${adjustedMonths} mos`
  }

  const todaysAgenda = [
    { time: '9:00 AM', event: 'Preschool', location: 'Sunshine Academy', type: 'school' },
    { time: '3:30 PM', event: 'Soccer Practice', location: 'Community Park', type: 'activity' },
    { time: '6:00 PM', event: 'Family Dinner', location: 'Home', type: 'family' }
  ]

  const quickActions = [
    { 
      id: 'chore', 
      label: 'Add Chore', 
      icon: CheckSquare, 
      color: 'from-green-400 to-emerald-400',
      onClick: () => setShowAddChore(true)
    },
    { id: 'event', label: 'Add Event', icon: Calendar, color: 'from-blue-400 to-cyan-400' },
    { 
      id: 'game', 
      label: 'Start Game', 
      icon: GraduationCap, 
      color: 'from-purple-400 to-indigo-400',
      onClick: () => handleStartLearning()
    },
    { 
      id: 'checklist', 
      label: 'School Checklist', 
      icon: Target, 
      color: 'from-amber-400 to-orange-400', 
      onClick: () => setShowSchoolReadiness(true) 
    }
  ]

  // Action handlers
  const handleAddChore = async () => {
    if (!newChoreTitle.trim()) return
    
    const success = await addChore(newChoreTitle, newChoreStars)
    if (success) {
      setNewChoreTitle('')
      setNewChoreStars(3)
      setShowAddChore(false)
    }
  }

  const handleStartLearning = async () => {
    const success = await startLearningActivity('letter', spotlight.letter)
    if (success) {
      // Optional: Show success feedback
    }
  }

  const schoolReadinessItems = [
    {
      section: 'Health & Safety',
      items: [
        { task: 'Annual physical exam', completed: true },
        { task: 'Vision and hearing test', completed: true },
        { task: 'Immunizations up to date', completed: false },
        { task: 'Emergency contact forms', completed: true }
      ]
    },
    {
      section: 'School Supplies',
      items: [
        { task: 'Backpack and lunch box', completed: true },
        { task: 'School uniforms/clothes', completed: false },
        { task: 'Art supplies (crayons, scissors)', completed: true },
        { task: 'Rest mat for nap time', completed: false }
      ]
    },
    {
      section: 'Skills & Readiness',
      items: [
        { task: 'Can write first name', completed: true },
        { task: 'Knows basic colors and shapes', completed: true },
        { task: 'Can count to 20', completed: true },
        { task: 'Toilet trained', completed: true }
      ]
    }
  ]

  const renderHomeTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-r from-amber-400 to-orange-400 flex items-center justify-center mx-auto mb-4 shadow-xl">
          <span className="text-3xl">🎓</span>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
          {childAge}
        </h2>
        <p className="text-lg text-slate-600 font-medium">Ready for big kid adventures!</p>
      </div>

      {/* Today's Agenda */}
      <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <CardHeader>
          <CardTitle className="text-amber-700 flex items-center gap-2">
            📅 Today's Agenda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {todaysAgenda.map((item, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                  item.type === 'school' ? 'bg-blue-50 border-l-4 border-blue-400' :
                  item.type === 'activity' ? 'bg-green-50 border-l-4 border-green-400' :
                  'bg-amber-50 border-l-4 border-amber-400'
                }`}
              >
                <div className="text-2xl">
                  {item.type === 'school' ? '🏫' : item.type === 'activity' ? '⚽' : '🍽️'}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-slate-800">{item.event}</div>
                  <div className="text-sm text-slate-600">{item.time} • {item.location}</div>
                </div>
                <Button variant="ghost" size="sm">View</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chore Stars Ticker */}
      <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-800">Weekly Stars</h3>
            <div className="text-2xl font-bold text-yellow-600">{choreStats.starsEarned}/{choreStats.weeklyGoal} ⭐</div>
          </div>
          <Progress value={(choreStats.starsEarned / choreStats.weeklyGoal) * 100} className="mb-4 h-3" />
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>This week's progress</span>
            <span>{Math.max(0, choreStats.weeklyGoal - choreStats.starsEarned)} more for weekend reward!</span>
          </div>
        </CardContent>
      </Card>

      {/* Learning Spotlight */}
      <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Learning Spotlight</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl font-bold text-white">{spotlight.letter}</span>
              </div>
              <div className="font-medium text-slate-800">Letter of the Day</div>
              <Button 
                size="sm" 
                className="mt-2" 
                variant="outline"
                onClick={() => startLearningActivity('letter', spotlight.letter)}
              >
                Practice Writing
              </Button>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl font-bold text-white">{spotlight.number}</span>
              </div>
              <div className="font-medium text-slate-800">Number of the Day</div>
              <Button 
                size="sm" 
                className="mt-2" 
                variant="outline"
                onClick={() => startLearningActivity('number', spotlight.number.toString())}
              >
                Counting Game
              </Button>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Weekly Learning Goal</span>
              <span className="text-sm text-slate-600">{Math.round(learningStats.currentProgress)}%</span>
            </div>
            <Progress value={learningStats.currentProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Quick Action Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Button
            key={action.id}
            onClick={action.onClick}
            className={`h-20 bg-gradient-to-r ${action.color} text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex flex-col gap-2`}
          >
            <action.icon className="w-6 h-6" />
            <span className="text-sm font-bold">{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  )

  const renderChoresTab = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckSquare className="w-16 h-16 text-amber-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Chore Board</h3>
        <p className="text-slate-600">Track daily tasks and earn stars</p>
      </div>

      <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Today's Chores</CardTitle>
            <Button size="sm" onClick={() => setShowAddChore(true)} disabled={choresLoading}>
              Add Chore
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {chores.length > 0 ? chores.map((chore) => (
              <div
                key={chore.id}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                  chore.status === 'done' ? 'bg-green-50 border-green-300' :
                  chore.status === 'in-progress' ? 'bg-yellow-50 border-yellow-300' :
                  'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="text-2xl">
                  {chore.status === 'done' ? '✅' : 
                   chore.status === 'in-progress' ? '🔄' : '📋'}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-slate-800">{chore.title}</div>
                  <div className="text-sm text-amber-600">{chore.starValue} stars</div>
                  {chore.description && (
                    <div className="text-sm text-slate-500">{chore.description}</div>
                  )}
                </div>
                <div className="flex gap-2">
                  {chore.status !== 'done' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => completeChore(chore.id)}
                      disabled={choresLoading}
                    >
                      Complete
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => deleteChore(chore.id)}
                    disabled={choresLoading}
                    className="text-red-600 hover:text-red-700"
                  >
                    ✕
                  </Button>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-slate-500">
                <CheckSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No chores assigned</p>
                <p className="text-sm">Add some chores to get started!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <div className="backdrop-blur-lg bg-white/70 border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="w-10 h-10 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 flex items-center justify-center hover:scale-105 transition-transform">
                <Home className="w-5 h-5 text-white" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Early Childhood Hub
                </h1>
                <p className="text-sm text-slate-600">{childAge} • 4-6 years</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium text-slate-700">{choreStats.starsEarned} Stars This Week</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white/60 backdrop-blur-sm rounded-2xl p-1 shadow-lg">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-amber-500 text-white shadow-lg'
                      : 'text-slate-600 hover:bg-white/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'home' && renderHomeTab()}
        {activeTab === 'chores' && renderChoresTab()}
        {activeTab === 'learn' && (
          <div className="space-y-6">
            <div className="text-center">
              <GraduationCap className="w-16 h-16 text-amber-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Learning Games Hub</h3>
              <p className="text-slate-600">Educational games and school readiness activities</p>
            </div>

            {/* Learning Progress Overview */}
            <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="text-amber-700">Weekly Learning Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{learningStats.activitiesCompleted}</div>
                    <div className="text-sm text-blue-700">Activities</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{Math.round(learningStats.totalTimeSpent / 60)}h</div>
                    <div className="text-sm text-green-700">Time Spent</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{learningStats.streakDays}</div>
                    <div className="text-sm text-purple-700">Day Streak</div>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-lg">
                    <div className="text-2xl font-bold text-amber-600">{Math.round(learningStats.currentProgress)}%</div>
                    <div className="text-sm text-amber-700">Goal Progress</div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Weekly Goal Progress</span>
                    <span className="text-sm text-slate-600">{learningStats.totalTimeSpent}/{learningStats.weeklyGoal} minutes</span>
                  </div>
                  <Progress value={learningStats.currentProgress} className="h-3" />
                </div>
              </CardContent>
            </Card>

            {/* Recent Learning Activities */}
            <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="text-amber-700">Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activities.length > 0 ? activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border transition-all hover:bg-slate-100"
                    >
                      <div className="text-2xl">
                        {activity.type === 'letter' ? '🔤' : 
                         activity.type === 'number' ? '🔢' :
                         activity.type === 'reading' ? '📚' :
                         activity.type === 'math' ? '🧮' : '🔬'}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-800">{activity.title}</div>
                        <div className="text-sm text-slate-600">{activity.description}</div>
                        {activity.score && (
                          <div className="text-sm text-green-600">Score: {activity.score}/100</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-500">
                          {activity.completedAt && new Date(activity.completedAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-amber-600">
                          {activity.estimatedMinutes} min
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-slate-500">
                      <GraduationCap className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No learning activities yet</p>
                      <p className="text-sm">Start with today's letter or number!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Learning Games */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Button
                onClick={() => startLearningActivity('letter', spotlight.letter)}
                disabled={learningLoading}
                className="h-24 bg-gradient-to-r from-blue-400 to-purple-400 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex flex-col gap-2"
              >
                <span className="text-2xl">🔤</span>
                <span className="text-sm font-bold">Letter Practice</span>
              </Button>
              <Button
                onClick={() => startLearningActivity('number', spotlight.number.toString())}
                disabled={learningLoading}
                className="h-24 bg-gradient-to-r from-green-400 to-teal-400 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex flex-col gap-2"
              >
                <span className="text-2xl">🔢</span>
                <span className="text-sm font-bold">Number Game</span>
              </Button>
              <Button
                onClick={() => startLearningActivity('reading', 'phonics')}
                disabled={learningLoading}
                className="h-24 bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex flex-col gap-2"
              >
                <span className="text-2xl">📚</span>
                <span className="text-sm font-bold">Reading Time</span>
              </Button>
              <Button
                onClick={() => startLearningActivity('math', 'counting')}
                disabled={learningLoading}
                className="h-24 bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex flex-col gap-2"
              >
                <span className="text-2xl">🧮</span>
                <span className="text-sm font-bold">Math Fun</span>
              </Button>
              <Button
                onClick={() => startLearningActivity('science', 'discovery')}
                disabled={learningLoading}
                className="h-24 bg-gradient-to-r from-cyan-400 to-blue-400 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex flex-col gap-2"
              >
                <span className="text-2xl">🔬</span>
                <span className="text-sm font-bold">Science</span>
              </Button>
              <Button
                onClick={() => startLearningActivity('letter', 'writing')}
                disabled={learningLoading}
                className="h-24 bg-gradient-to-r from-indigo-400 to-purple-400 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex flex-col gap-2"
              >
                <span className="text-2xl">✏️</span>
                <span className="text-sm font-bold">Writing</span>
              </Button>
            </div>
          </div>
        )}
        {activeTab === 'calendar' && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Family Calendar</h3>
            <p className="text-slate-600">Coordinate schedules and family activities</p>
          </div>
        )}

        {/* Floating Action Button */}
        <div className="fixed bottom-8 right-8 z-40">
          <Button
            className="w-16 h-16 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-xl hover:scale-110 transition-all duration-300"
          >
            <Plus className="w-8 h-8" />
          </Button>
        </div>

        {/* Add Chore Modal */}
        {showAddChore && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-white m-4 max-w-md w-full shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-amber-700">Add New Chore</CardTitle>
                  <Button variant="ghost" onClick={() => setShowAddChore(false)}>✕</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Chore Title
                    </label>
                    <input
                      type="text"
                      value={newChoreTitle}
                      onChange={(e) => setNewChoreTitle(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="e.g., Make bed, Set table"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Star Value
                    </label>
                    <select
                      value={newChoreStars}
                      onChange={(e) => setNewChoreStars(Number(e.target.value))}
                      className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value={1}>1 star (Easy)</option>
                      <option value={2}>2 stars (Medium)</option>
                      <option value={3}>3 stars (Hard)</option>
                      <option value={4}>4 stars (Very Hard)</option>
                      <option value={5}>5 stars (Extra Credit)</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleAddChore}
                      disabled={!newChoreTitle.trim() || choresLoading}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                    >
                      Add Chore
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAddChore(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* School Readiness Checklist Overlay */}
        {showSchoolReadiness && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-white m-4 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-amber-700">School Readiness Checklist</CardTitle>
                  <Button variant="ghost" onClick={() => setShowSchoolReadiness(false)}>✕</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {schoolReadinessItems.map((section, index) => (
                    <div key={index}>
                      <h4 className="font-bold text-slate-800 mb-3">{section.section}</h4>
                      <div className="space-y-2">
                        {section.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                            <input 
                              type="checkbox" 
                              defaultChecked={item.completed}
                              className="w-4 h-4 text-amber-600"
                            />
                            <span className={`text-sm ${item.completed ? 'text-slate-600 line-through' : 'text-slate-800'}`}>
                              {item.task}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t">
                    <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                      Share with School
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}