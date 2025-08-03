'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Plus, Heart, Clock, Gamepad2, User, Settings, Timer, Star, Coffee, Home, Smile, Frown } from 'lucide-react'
import { useBehaviorTracking } from '@/hooks/useBehaviorTracking'
import { useRoutineTracking } from '@/hooks/useRoutineTracking'
import { usePottyLogs } from '@/hooks/usePottyLogs'

/**
 * Toddler Parent Interface (Blueprint 3.3)
 * 
 * Navigation: Home, Routine, Play, Profile
 * Features: Behavior tracking with stars, Potty training, Routine building, Calm-down tools
 */
export default function ToddlerParentPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('home')
  const [childId, setChildId] = useState<string | null>(null)
  const [childAge, setChildAge] = useState('2 yrs 3 mos')
  const [showBehaviorSummary, setShowBehaviorSummary] = useState(false)
  const [showCalmDown, setShowCalmDown] = useState(false)

  // Real data hooks
  const { events: behaviorEvents, stats: behaviorStats, logBehavior } = useBehaviorTracking(childId || undefined)
  const { stats: routineStats, logMeal, logNap } = useRoutineTracking(childId || undefined)
  const { data: pottyData, startTimer } = usePottyLogs(childId || undefined)

  // Get child ID from family - for demo, we'll use the first child
  useEffect(() => {
    const fetchChild = async () => {
      if (session?.user?.familyId) {
        try {
          const response = await fetch('/api/children')
          if (response.ok) {
            const children = await response.json()
            if (children.length > 0) {
              const toddler = children.find((child: any) => {
                const age = calculateAge(new Date(child.dateOfBirth))
                return age >= 1 && age <= 3
              }) || children[0] // Fallback to first child
              
              setChildId(toddler.id)
              setChildAge(formatChildAge(new Date(toddler.dateOfBirth)))
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
    { id: 'home', label: 'Home', icon: Heart },
    { id: 'routine', label: 'Routine', icon: Clock },
    { id: 'play', label: 'Play', icon: Gamepad2 },
    { id: 'profile', label: 'Profile', icon: User }
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

  const quickActions = [
    { 
      id: 'behavior', 
      label: 'Log Behavior', 
      icon: Star, 
      color: 'from-yellow-400 to-orange-400',
      onClick: () => handleQuickBehavior()
    },
    { 
      id: 'potty', 
      label: 'Start Potty Timer', 
      icon: Timer, 
      color: 'from-blue-400 to-cyan-400',
      onClick: () => handlePottyTimer()
    },
    { 
      id: 'play', 
      label: 'Play Idea', 
      icon: Gamepad2, 
      color: 'from-green-400 to-emerald-400' 
    },
    { 
      id: 'calm', 
      label: 'Calm-Down', 
      icon: Heart, 
      color: 'from-purple-400 to-pink-400', 
      onClick: () => setShowCalmDown(true) 
    }
  ]

  // Action handlers
  const handleQuickBehavior = async () => {
    const success = await logBehavior('positive', 'Great behavior!', 2)
    if (success) {
      // Optional: Show success feedback
    }
  }

  const handlePottyTimer = async () => {
    if (startTimer) {
      await startTimer()
      // Optional: Show timer started feedback
    }
  }

  const handleLogMeal = async () => {
    const success = await logMeal('snack')
    if (success) {
      // Optional: Show success feedback
    }
  }

  const handleLogNap = async () => {
    const success = await logNap(60) // 1 hour nap
    if (success) {
      // Optional: Show success feedback
    }
  }

  const treasureBoxItems = [
    { id: 1, name: 'Sticker Sheet', price: 5, icon: '✨' },
    { id: 2, name: 'Extra Story', price: 8, icon: '📚' },
    { id: 3, name: 'Special Snack', price: 10, icon: '🍪' },
    { id: 4, name: 'Park Trip', price: 15, icon: '🏞️' }
  ]

  const renderHomeTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center mx-auto mb-4 shadow-xl">
          <span className="text-3xl">🧸</span>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          {childAge}
        </h2>
        <p className="text-lg text-slate-600 font-medium">Building great habits together!</p>
      </div>

      {/* Behavior Timeline */}
      <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-purple-700">Today's Behavior</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setShowBehaviorSummary(true)}>
              View Summary
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {behaviorEvents.length > 0 ? behaviorEvents.map((event, index) => (
              <div
                key={event.id || index}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                  event.type === 'positive' 
                    ? 'bg-green-50 border-l-4 border-green-400' 
                    : 'bg-red-50 border-l-4 border-red-400'
                }`}
              >
                <div className="text-2xl">
                  {event.type === 'positive' ? '⭐' : '🚩'}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-slate-800">{event.event}</div>
                  <div className="text-sm text-slate-600">{event.time}</div>
                </div>
                {event.stars > 0 && (
                  <div className="text-yellow-600 font-bold">+{event.stars} ⭐</div>
                )}
              </div>
            )) : (
              <div className="text-center py-8 text-slate-500">
                <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No behavior logged today</p>
                <p className="text-sm">Tap "Log Behavior" to start tracking!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reward Progress Bar */}
      <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-800">Star Progress</h3>
            <div className="text-2xl font-bold text-yellow-600">{behaviorStats.starsToday}/{behaviorStats.targetStars} ⭐</div>
          </div>
          <Progress value={(behaviorStats.starsToday / behaviorStats.targetStars) * 100} className="mb-4 h-3" />
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Today's stars</span>
            <span>{Math.max(0, behaviorStats.targetStars - behaviorStats.starsToday)} more for Treasure Box!</span>
          </div>
        </CardContent>
      </Card>

      {/* Routine Rings */}
      <div className="grid grid-cols-2 gap-6">
        {/* Meal Ring */}
        <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-6 text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="35" stroke="#E5E7EB" strokeWidth="8" fill="none" />
                <circle
                  cx="50" cy="50" r="35"
                  stroke={routineStats.mealStatus === 'urgent' ? "#EF4444" : routineStats.mealStatus === 'warning' ? "#F59E0B" : "#10B981"}
                  strokeWidth="8" fill="none"
                  strokeDasharray={`${Math.max(0, 100 - ((routineStats.lastMeal / 4) * 100)) * 2.2} 220`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Coffee className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            <h3 className="font-bold text-slate-800 mb-2">Last Meal</h3>
            <p className="text-sm text-slate-600">{routineStats.lastMeal}h ago</p>
            <Button size="sm" className="mt-2" variant="outline" onClick={handleLogMeal}>Log Meal</Button>
          </CardContent>
        </Card>

        {/* Nap Ring */}
        <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-6 text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="35" stroke="#E5E7EB" strokeWidth="8" fill="none" />
                <circle
                  cx="50" cy="50" r="35"
                  stroke={routineStats.napStatus === 'urgent' ? "#EF4444" : routineStats.napStatus === 'warning' ? "#F59E0B" : "#8B5CF6"}
                  strokeWidth="8" fill="none"
                  strokeDasharray={`${Math.max(0, 100 - ((routineStats.lastNap / 6) * 100)) * 2.2} 220`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">😴</span>
              </div>
            </div>
            <h3 className="font-bold text-slate-800 mb-2">Last Nap</h3>
            <p className="text-sm text-slate-600">{routineStats.lastNap}h ago</p>
            <Button size="sm" className="mt-2" variant="outline" onClick={handleLogNap}>Start Nap</Button>
          </CardContent>
        </Card>
      </div>

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      {/* Header */}
      <div className="backdrop-blur-lg bg-white/70 border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="w-10 h-10 rounded-2xl bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center hover:scale-105 transition-transform">
                <Home className="w-5 h-5 text-white" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Toddler Parent Hub
                </h1>
                <p className="text-sm text-slate-600">{childAge} • 1-3 years</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium text-slate-700">{starsToday} Stars Today</span>
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
                      ? 'bg-purple-500 text-white shadow-lg'
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
        {activeTab === 'routine' && (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Routine Center</h3>
            <p className="text-slate-600">Behavior tracking, potty training, and daily schedules</p>
          </div>
        )}
        {activeTab === 'play' && (
          <div className="text-center py-12">
            <Gamepad2 className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Play Hub</h3>
            <p className="text-slate-600">Age-appropriate activities and developmental play ideas</p>
          </div>
        )}
        {activeTab === 'profile' && (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Child Profile</h3>
            <p className="text-slate-600">Manage settings, caregivers, and reward system</p>
          </div>
        )}

        {/* Floating Action Button */}
        <div className="fixed bottom-8 right-8 z-40">
          <Button
            className="w-16 h-16 bg-purple-500 hover:bg-purple-600 text-white rounded-full shadow-xl hover:scale-110 transition-all duration-300"
          >
            <Plus className="w-8 h-8" />
          </Button>
        </div>

        {/* Behavior Summary Overlay */}
        {showBehaviorSummary && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-white m-4 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-purple-700">Behavior Summary</CardTitle>
                  <Button variant="ghost" onClick={() => setShowBehaviorSummary(false)}>✕</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{behaviorStats.positiveEvents}</div>
                      <div className="text-sm text-green-700">Positive behaviors</div>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{behaviorStats.tantrums}</div>
                      <div className="text-sm text-red-700">Tantrums today</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">{behaviorStats.starsToday} ⭐</div>
                    <div className="text-sm text-slate-600">Stars earned today</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Calm-Down Toolbox */}
        {showCalmDown && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
            <Card className="bg-white m-4 max-w-md w-full shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-purple-700">Calm-Down Toolbox</CardTitle>
                  <Button 
                    variant="ghost" 
                    onMouseDown={() => setShowCalmDown(false)}
                    className="bg-red-100 hover:bg-red-200"
                  >
                    Hold to Exit
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 text-center">
                  <div>
                    <h4 className="font-bold mb-4">Deep Breathing</h4>
                    <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center animate-pulse">
                      <span className="text-white text-2xl">🫁</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-2">Breathe in... and out...</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <Button className="h-16 bg-gradient-to-r from-green-400 to-blue-400">
                      🌧️<br />Rain Sounds
                    </Button>
                    <Button className="h-16 bg-gradient-to-r from-purple-400 to-pink-400">
                      💖<br />Heartbeat
                    </Button>
                    <Button className="h-16 bg-gradient-to-r from-blue-400 to-cyan-400">
                      🌊<br />Ocean Waves
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