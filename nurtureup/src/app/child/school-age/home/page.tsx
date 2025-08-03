'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'



import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Plus, BookOpen, Calendar, DollarSign, Star, Settings, Clock, Home, GraduationCap, Trophy, Zap } from 'lucide-react'
import { useHomework } from '@/hooks/useHomework'
import { useScreenTime } from '@/hooks/useScreenTime'

/**
 * School Age Home Screen - Smart Agenda (Blueprint 6.4.1)
 * 
 * Per blueprint:
 * - Header: avatar badge with grade ("Grade 4"), settings gear hidden via long-press
 * - Smart Agenda Card: shows next due homework and upcoming activity (time + icon). Tapping item jumps to School tab with item highlighted
 * - Streak Meter: consecutive days homework completed; thermometer style bar; pulses at milestones (7, 14, 21)
 * - Screen-Time Ring: if limits active, radial graph with remaining minutes. Turns red at 0 and greys apps requiring limit
 * - Quick-Action Row: "Add HW", "Add Activity", "Log Expense", "Spend Stars"
 * - Button: "+" radial (Homework, Activity, Expense, Note)
 */
export default function SchoolAgeHomePage() {
  const { data: session } = useSession()
  const [grade] = useState(4)
  const [childId, setChildId] = useState<string | null>(null)
  const [showFabMenu, setShowFabMenu] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Get child ID from session or URL params
  useEffect(() => {
    // TODO: Get actual child ID from context or URL
    setChildId('child-1') // Placeholder
  }, [session])

  // Fetch real homework and screen time data
  const { data: homeworkData, isLoading: homeworkLoading } = useHomework(childId, 'active')
  const { data: screenTimeData, isLoading: screenTimeLoading } = useScreenTime(childId)

  // Calculate derived values from real data
  const streak = homeworkData?.stats.currentStreak || 0
  const stars = 156 // TODO: Get from child profile
  const screenTimeUsed = screenTimeData?.stats.totalMinutesUsed || 0
  const screenTimeLimit = screenTimeData?.stats.totalAllowedMinutes || 120
  const screenTimeProgress = (screenTimeUsed / screenTimeLimit) * 100
  const isScreenTimeLimited = screenTimeProgress >= 100
  const streakMilestone = streak >= 21 ? 21 : streak >= 14 ? 14 : streak >= 7 ? 7 : 0

  // Transform homework data into upcoming items format
  const homeworkItems = homeworkData?.homework?.slice(0, 2)?.map(hw => {
    const metadata = hw.metadata ? JSON.parse(hw.metadata) : {}
    const dueDate = hw.dueDate ? new Date(hw.dueDate) : null
    const isUrgent = dueDate ? dueDate.getTime() - Date.now() < 24 * 60 * 60 * 1000 : false
    
    return {
      id: hw.id,
      type: 'homework',
      title: hw.title,
      due: dueDate ? formatDueDate(dueDate) : 'No due date',
      icon: getSubjectIcon(metadata.subject || 'homework'),
      subject: metadata.subject || 'Homework',
      urgent: isUrgent
    }
  }) || []

  // TODO: Add activities from a separate activities API
  const activityItems = [
    { 
      id: 'activity-1', 
      type: 'activity', 
      title: 'Soccer Practice', 
      due: 'Today 4:00 PM', 
      icon: '⚽',
      location: 'School Field',
      urgent: false
    }
  ]

  const upcomingItems = [...homeworkItems, ...activityItems]
  const nextItem = upcomingItems[0]

  function formatDueDate(date: Date): string {
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays === -1) return 'Yesterday'
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`
    return `${diffDays} days`
  }

  function getSubjectIcon(subject: string): string {
    const subjectLower = subject.toLowerCase()
    if (subjectLower.includes('math')) return '📐'
    if (subjectLower.includes('science')) return '🔬'
    if (subjectLower.includes('english')) return '📚'
    if (subjectLower.includes('history')) return '🏛️'
    if (subjectLower.includes('art')) return '🎨'
    return '📝'
  }

  const actions = [
    { id: 'homework', label: 'Add Homework', icon: BookOpen, color: 'bg-blue-500' },
    { id: 'activity', label: 'Add Activity', icon: Calendar, color: 'bg-green-500' },
    { id: 'expense', label: 'Log Expense', icon: DollarSign, color: 'bg-purple-500' },
    { id: 'note', label: 'Quick Note', icon: '📝', color: 'bg-orange-500' },
  ]

  const quickActions = [
    { id: 'homework', label: 'Add HW', icon: BookOpen, color: 'from-blue-400 to-blue-600' },
    { id: 'activity', label: 'Add Activity', icon: Calendar, color: 'from-green-400 to-green-600' },
    { id: 'expense', label: 'Log Expense', icon: DollarSign, color: 'from-purple-400 to-purple-600' },
    { id: 'stars', label: 'Spend Stars', icon: Star, color: 'from-yellow-400 to-orange-500' },
  ]

  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'homework':
        window.location.href = '/child/school-age/school?tab=homework&add=true'
        break
      case 'activity':
        window.location.href = '/child/school-age/school?tab=activities&add=true'
        break
      case 'expense':
        window.location.href = '/child/school-age/wallet?add=expense'
        break
      case 'stars':
        window.location.href = '/child/school-age/badges?store=true'
        break
    }
  }

  const handleFabAction = (action: string) => {
    setShowFabMenu(false)
    handleQuickAction(action)
  }

  const navigateToItem = (item: typeof nextItem) => {
    if (item.type === 'homework') {
      window.location.href = `/child/school-age/school?tab=homework&highlight=${item.id}`
    } else {
      window.location.href = `/child/school-age/school?tab=activities&highlight=${item.id}`
    }
  }

  const handleLongPressSettings = () => {
    // Long-press to reveal settings (hidden by default for children)
    setShowSettings(true)
    setTimeout(() => setShowSettings(false), 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      {/* Header */}
      <div className="backdrop-blur-lg bg-white/70 border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/child/phases" className="w-10 h-10 rounded-2xl bg-gradient-to-r from-purple-400 to-indigo-400 flex items-center justify-center hover:scale-105 transition-transform">
                <Home className="w-5 h-5 text-white" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Smart Agenda
                </h1>
                <p className="text-sm text-slate-600">School Age Interface • Grade {grade}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-medium text-slate-700">{stars} Stars</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Smart Agenda Card */}
        <Card className="mb-8 border-0 bg-white/60 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-400 to-indigo-400 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  📋 Today's Agenda
                </CardTitle>
                <p className="text-sm text-slate-600">What's coming up next?</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingItems.slice(0, 2).map((item) => (
              <div
                key={item.id}
                onClick={() => navigateToItem(item)}
                className={`p-4 rounded-2xl transition-all duration-300 cursor-pointer hover:scale-105 ${
                  item.urgent 
                    ? 'bg-gradient-to-r from-red-100 to-orange-100 border-2 border-red-300' 
                    : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-indigo-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{item.icon}</span>
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg ${
                      item.urgent ? 'text-red-700' : 'text-slate-800'
                    }`}>
                      {item.title}
                    </h3>
                    <p className={`text-sm font-medium ${
                      item.urgent ? 'text-red-600' : 'text-slate-600'
                    }`}>
                      {item.due}
                    </p>
                    {item.type === 'homework' && (
                      <p className="text-purple-600 font-medium text-sm">
                        {item.subject}
                      </p>
                    )}
                  </div>
                  {item.urgent && (
                    <div className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold">
                      URGENT!
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {upcomingItems.length === 0 && (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">All caught up!</h3>
                <p className="text-slate-600">No homework or activities scheduled right now.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Homework Streak */}
          <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-orange-400 to-red-400 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Homework Streak</h3>
                    <p className="text-sm text-slate-600">Keep it going! 🔥</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${
                    streakMilestone > 0 ? 'text-orange-600 animate-pulse' : 'text-indigo-600'
                  }`}>
                    {streak}
                  </div>
                  <div className="text-sm text-slate-600">days</div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="relative mb-4">
                <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      streakMilestone >= 21 ? 'bg-gradient-to-r from-red-400 to-red-600' :
                      streakMilestone >= 14 ? 'bg-gradient-to-r from-orange-400 to-red-500' :
                      streakMilestone >= 7 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                      'bg-gradient-to-r from-indigo-400 to-purple-500'
                    }`}
                    style={{ width: `${Math.min((streak / 21) * 100, 100)}%` }}
                  />
                </div>
                
                {/* Milestone markers */}
                {[7, 14, 21].map((milestone) => (
                  <div
                    key={milestone}
                    className={`absolute top-0 w-1 h-4 ${
                      streak >= milestone ? 'bg-white' : 'bg-slate-400'
                    }`}
                    style={{ left: `${(milestone / 21) * 100}%` }}
                  />
                ))}
              </div>
              
              <div className="flex justify-between text-xs text-slate-500">
                <span>Start</span>
                <span>7d</span>
                <span>14d</span>
                <span>21d!</span>
              </div>
              
              {streakMilestone > 0 && (
                <div className="mt-3 p-2 bg-orange-100 rounded-lg text-center">
                  <p className="text-orange-700 font-bold text-sm">
                    🎉 {streakMilestone} day milestone!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Screen Time */}
          <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Screen Time</h3>
                    <p className="text-sm text-slate-600">{screenTimeUsed}m / {screenTimeLimit}m used</p>
                  </div>
                </div>
                
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="35"
                      stroke="#E5E7EB"
                      strokeWidth="10"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="35"
                      stroke={isScreenTimeLimited ? "#EF4444" : screenTimeProgress >= 80 ? "#F59E0B" : "#6366F1"}
                      strokeWidth="10"
                      fill="none"
                      strokeDasharray={`${screenTimeProgress * 2.2} 220`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-slate-600">
                      {Math.round(screenTimeProgress)}%
                    </span>
                  </div>
                </div>
              </div>

              {isScreenTimeLimited && (
                <div className="mt-4 p-3 bg-red-100 rounded-xl text-center">
                  <p className="text-red-700 font-bold text-sm">
                    🔒 Time limit reached!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              onClick={() => handleQuickAction(action.id)}
              disabled={action.id !== 'stars' && isScreenTimeLimited}
              className={`h-20 bg-gradient-to-r ${action.color} text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-2xl flex flex-col gap-2 ${
                action.id !== 'stars' && isScreenTimeLimited ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <action.icon className="w-6 h-6" />
              <span className="text-sm font-bold">
                {action.label}
              </span>
            </Button>
          ))}
        </div>

        {/* Navigation Links */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/child/school-age/school">
            <Button className="w-full h-16 bg-gradient-to-r from-purple-400 to-indigo-400 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-lg font-bold rounded-2xl">
              <BookOpen className="w-6 h-6 mr-2" />
              School Center 🎓
            </Button>
          </Link>
          
          <Link href="/child/school-age/wallet">
            <Button className="w-full h-16 bg-gradient-to-r from-green-400 to-emerald-400 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-lg font-bold rounded-2xl">
              <DollarSign className="w-6 h-6 mr-2" />
              My Wallet 💰
            </Button>
          </Link>
        </div>

        <div className="text-center mt-8">
          <p className="text-lg text-slate-600 font-medium">
            📚 Stay organized and reach your goals! 🌟
          </p>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-40">
        <Button
          onClick={() => setShowFabMenu(!showFabMenu)}
          className={`w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full shadow-xl hover:scale-110 transition-all duration-300 ${
            showFabMenu ? 'rotate-45' : ''
          }`}
        >
          <Plus className="w-8 h-8" />
        </Button>
      </div>
    </div>
  )
}