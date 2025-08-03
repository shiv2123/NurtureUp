'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Plus, Calendar, DollarSign, BookOpen, MapPin, MessageSquare, Clock, TrendingUp, Target, AlertCircle } from 'lucide-react'
import { useMood } from '@/hooks/useMood'

/**
 * Adolescence Home Screen - Personal Feed (Blueprint 7.4.1)
 * 
 * Per blueprint:
 * - Header: avatar thumbnail, first-name greeting ("Morning, Alex"), privacy shield icon (color reflects contract level)
 * - Feed Stack (scrollable): Deadline Card, Mood Pulse Card, Financial Snapshot, Life-Skill Spotlight, Nudge Card (conditional)
 * - Button: "+" radial menu (Task, Event, Mood, Expense, Check-In)
 * - Navigation Cue: horizontal dots indicating feed pages
 */
export default function AdolescenceHomePage() {
  const { data: session } = useSession()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showFabMenu, setShowFabMenu] = useState(false)
  const [feedPage, setFeedPage] = useState(0)
  const [lastPlannerUpdate] = useState(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)) // 2 days ago
  const [childId, setChildId] = useState<string | null>(null)

  // Get child ID from session or URL params
  useEffect(() => {
    // TODO: Get actual child ID from context or URL
    setChildId('child-1') // Placeholder
  }, [session])

  // Fetch real mood data
  const { 
    data: moodData, 
    getMoodEmoji, 
    getWeeklyAverage, 
    getMoodTrend,
    isLoading: moodLoading 
  } = useMood(childId, '7') // Last 7 days

  const [userStats, setUserStats] = useState({
    balance: 156.75,
    savingsGoal: { item: 'MacBook Pro', amount: 2000, saved: 756 },
    lifeSkillsXP: 340
  })

  // Use real mood data or fallback
  const lastMood = moodData?.stats.latestMood?.emoji || '😊'
  const moodTrend = moodData?.trendData?.map(day => day.averageMood || 5).slice(-7) || [6, 7, 5, 8, 7, 6, 8]
  const weeklyAverage = getWeeklyAverage()

  const actions = [
    { id: 'task', label: 'Add Task', icon: BookOpen, color: 'bg-blue-500' },
    { id: 'event', label: 'Add Event', icon: Calendar, color: 'bg-green-500' },
    { id: 'mood', label: 'Log Mood', icon: MessageSquare, color: 'bg-purple-500' },
    { id: 'expense', label: 'Log Expense', icon: DollarSign, color: 'bg-red-500' },
    { id: 'checkin', label: 'Check-In', icon: MapPin, color: 'bg-orange-500' },
  ]

  const upcomingDeadlines = [
    {
      id: 1,
      title: 'College Application Essay',
      type: 'college',
      due: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      urgent: true,
      icon: '🎓'
    },
    {
      id: 2,
      title: 'AP Biology Lab Report',
      type: 'academic',
      due: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
      urgent: false,
      icon: '🔬'
    }
  ]

  const lifeSkillSuggestions = [
    { task: 'Cook pasta for dinner', xp: 15, category: 'home', icon: '🍝' },
    { task: 'Update resume', xp: 25, category: 'career', icon: '📄' },
    { task: 'Practice driving parallel parking', xp: 20, category: 'life', icon: '🚗' },
    { task: 'Research college scholarships', xp: 30, category: 'education', icon: '💰' },
  ]

  const [todaysSuggestion] = useState(lifeSkillSuggestions[0])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getTimeUntilDeadline = (due: Date) => {
    const now = new Date()
    const diff = due.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return 'Due today'
    if (days === 1) return 'Due tomorrow'
    return `Due in ${days} days`
  }

  const handleFabAction = (action: string) => {
    setShowFabMenu(false)
    switch (action) {
      case 'task':
        window.location.href = '/child/adolescence/planner?tab=tasks&add=true'
        break
      case 'event':
        window.location.href = '/child/adolescence/planner?tab=calendar&add=true'
        break
      case 'mood':
        window.location.href = '/child/adolescence/wellbeing?action=mood'
        break
      case 'expense':
        window.location.href = '/child/adolescence/wallet?add=expense'
        break
      case 'checkin':
        // TODO: Implement location check-in
        alert('📍 Location check-in: Currently at home')
        break
    }
  }

  const needsPlannerNudge = () => {
    const daysSinceUpdate = Math.floor((Date.now() - lastPlannerUpdate.getTime()) / (1000 * 60 * 60 * 24))
    return daysSinceUpdate >= 3
  }

  const savingsProgress = (userStats.savingsGoal.saved / userStats.savingsGoal.amount) * 100
  const firstName = session?.user?.name?.split(' ')[0] || 'Student'

  return (
    <div 
      className="min-h-screen p-4 pt-16"
      style={{ 
        backgroundColor: '#F8FAFC', // Blueprint adolescence surface color
        backgroundImage: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)'
      }}
    >
      {/* Header - Blueprint Adolescence Design */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-card-parent flex items-center justify-center text-white font-bold shadow-card"
            style={{ backgroundColor: '#2E4A9F' }} // Blueprint adolescence primary
          >
            {firstName[0]}
          </div>
          <div>
            <h1 className="text-xl font-bold text-blue-700 mb-1">
              {getGreeting()}, {firstName}
            </h1>
            <p className="text-sm text-gray-500">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </header>

      {/* Feed Stack */}
      <div className="space-y-4 mb-20">
        {/* Deadline Card - Blueprint Dashboard-A template */}
        {upcomingDeadlines.length > 0 && (
          <Card 
            variant={upcomingDeadlines[0].urgent ? "destructive" : "elevated"} 
            stage="child" 
            className={`${upcomingDeadlines[0].urgent ? 'border-red-300 bg-red-50' : 'bg-white'} shadow-lg hover:shadow-xl`}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{upcomingDeadlines[0].icon}</div>
                <div className="flex-1">
                  <h3 className={`font-bold text-lg ${
                    upcomingDeadlines[0].urgent ? 'text-red-700' : 'text-gray-700'
                  }`}>
                    {upcomingDeadlines[0].title}
                  </h3>
                  <p className={`text-sm ${
                    upcomingDeadlines[0].urgent ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {getTimeUntilDeadline(upcomingDeadlines[0].due)}
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => window.location.href = `/child/adolescence/planner?highlight=${upcomingDeadlines[0].id}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <span className="text-white text-sm">
                    Open Planner
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mood Pulse Card - Blueprint Dashboard-A template */}
        <Card variant="interactive" stage="child" className="bg-white shadow-lg hover:shadow-xl">
          <CardContent className="p-4">
            <Button
              variant="ghost"
              onClick={() => window.location.href = '/child/adolescence/wellbeing?tab=history'}
              className="w-full text-left bg-transparent hover:bg-gray-50 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">{lastMood}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-700">
                    Mood Pulse
                  </h3>
                  <p className="text-sm text-gray-500">
                    {moodData?.stats.latestMood ? 
                      `Last: ${new Date(moodData.stats.latestMood.date).toLocaleDateString()}` :
                      'No recent entries'
                    }
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex gap-1 mb-1">
                    {moodTrend.map((score, i) => (
                      <div
                        key={i}
                        className="w-2 bg-primary/30 rounded-pill transition-all duration-sm ease-blueprint"
                        style={{ 
                          height: `${Math.max(score * 3, 6)}px`,
                          backgroundColor: score >= 7 ? '#10B981' : score >= 5 ? '#F59E0B' : '#EF4444'
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-400">
                    Avg: {weeklyAverage ? weeklyAverage.toFixed(1) : 'N/A'}
                  </p>
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Financial Snapshot - Blueprint Dashboard-A template */}
        <Card variant="interactive" stage="child" className="bg-white shadow-lg hover:shadow-xl">
          <CardContent className="p-4">
            <Button
              variant="ghost"
              onClick={() => window.location.href = '/child/adolescence/wallet'}
              className="w-full text-left bg-transparent hover:bg-gray-50 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">💰</div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-700">
                    Financial Snapshot
                  </h3>
                  <p className="text-sm text-gray-500">
                    Balance: ${userStats.balance.toFixed(2)}
                  </p>
                </div>
                <div className="text-right flex flex-col items-center">
                  <BlueprintProgress 
                    value={savingsProgress} 
                    size={48}
                    strokeWidth={6}
                    color="#2E4A9F" // Blueprint adolescence primary
                    stage="adolescence"
                    showValue={false}
                  />
                  <div className="absolute">
                    <Target className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    {Math.round(savingsProgress)}% to goal
                  </p>
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Life-Skill Spotlight - Blueprint Gamify-Star template */}
        <Card 
          variant="gradient" 
          stage="child" 
          className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg hover:shadow-xl"
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{todaysSuggestion.icon}</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-green-800">
                  Life-Skill Spotlight
                </h3>
                <p className="text-sm text-green-700">
                  {todaysSuggestion.task}
                </p>
              </div>
              <div className="text-right">
                <div className="bg-success text-white px-2 py-1 rounded-pill text-xs font-bold">
                  +{todaysSuggestion.xp} XP
                </div>
                <p className="text-sm text-green-600 mt-1">
                  Life Skills
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nudge Card (conditional) - Blueprint notification pattern */}
        {needsPlannerNudge() && (
          <Card 
            variant="warning" 
            stage="child" 
            className="bg-yellow-50 border-yellow-300 shadow-lg hover:shadow-xl"
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-warning" />
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-yellow-700">
                    Friendly Reminder
                  </h3>
                  <p className="text-sm text-yellow-600">
                    Haven't updated your planner in a few days. Stay on track! 📝
                  </p>
                </div>
                <Button
                  variant="warning"
                  size="sm"
                  onClick={() => window.location.href = '/child/adolescence/planner'}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  <span className="text-white text-sm">
                    Update Now
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current XP Stats - Blueprint Progress template */}
        <Card variant="elevated" stage="child" className="bg-white shadow-lg hover:shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-700">
                Life Skills Progress
              </h3>
              <h3 className="text-lg text-purple-600 font-bold">
                {userStats.lifeSkillsXP} XP
              </h3>
            </div>
            <div className="flex items-center justify-center mb-3">
              <BlueprintProgress 
                value={(userStats.lifeSkillsXP % 100)} 
                size={60}
                strokeWidth={8}
                color="#7C3AED" // Purple for XP
                stage="adolescence"
                showValue={true}
              />
            </div>
            <p className="text-sm text-gray-500 text-center">
              {100 - (userStats.lifeSkillsXP % 100)} XP to next level
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Button with Radial Menu */}
      <div className="fixed bottom-20 right-4 z-40">
        {showFabMenu && (
          <div className="absolute bottom-16 right-0 space-y-3">
            {fabMenuItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => handleFabAction(item.id)}
                className={`${item.color} text-white p-3 rounded-full shadow-lg hover:scale-110 transition-all flex items-center gap-2 opacity-0 animate-fade-in-up whitespace-nowrap`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        )}
        
        <Button
          variant="gradient"
          size="lg"
          onClick={() => setShowFabMenu(!showFabMenu)}
          className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-full shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center ${
            showFabMenu ? 'rotate-45' : ''
          }`}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* Navigation Cue - Blueprint navigation pattern */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {[0, 1, 2].map((page) => (
          <div
            key={page}
            className={`w-2 h-2 rounded-pill transition-all duration-sm ease-blueprint ${
              feedPage === page ? 'bg-primary' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}