'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'






import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Star, Plus, PartyPopper, Rocket, Home, Heart, Timer, Droplets, Sparkles } from 'lucide-react'
import { useFeedingLogs } from '@/hooks/useFeedingLogs'
import { useSleepLogs } from '@/hooks/useSleepLogs'
import { useOptimisticTasks } from '@/hooks/useOptimisticTasks'

/**
 * Toddler Home Screen - Star Jar (Blueprint 4.4.1)
 * 
 * Per blueprint:
 * - Header: friendly mascot speaking today's positive mantra
 * - Star Jar: large glass jar occupying 50% height, shows collected stars
 * - Routine Rings: two concentric rings under jar (Meal & Nap timers)
 * - Action Buttons Row: ➕ Star, 🎉 Dance, 🚀 Go Play
 * - Navigation Cue: tiny indicator dots encourage horizontal swipe
 */
export default function ToddlerHomePage() {
  const { data: session } = useSession()
  const [mantra, setMantra] = useState("Let's have fun cleaning!")
  const [childId, setChildId] = useState<string | null>(null)

  // Get child ID from session or URL params
  useEffect(() => {
    // TODO: Get actual child ID from context or URL
    // For now, assume first child
    setChildId('child-1') // Placeholder
  }, [session])

  // Fetch real data using hooks
  const { data: feedingData } = useFeedingLogs(childId)
  const { data: sleepData } = useSleepLogs(childId)
  const { data: tasksData } = useOptimisticTasks()

  // Calculate stars from completed tasks
  const totalStars = tasksData?.completedTasks?.length || 12

  // Calculate time since last meal and nap
  const getHoursSince = (dateString: string | null) => {
    if (!dateString) return 0
    const now = new Date()
    const past = new Date(dateString)
    const diffMs = now.getTime() - past.getTime()
    return Math.floor(diffMs / (1000 * 60 * 60))
  }

  const lastMeal = feedingData?.stats.lastFeeding 
    ? getHoursSince(feedingData.stats.lastFeeding.startTime)
    : 2

  const lastNap = sleepData?.stats.lastSleep 
    ? getHoursSince(sleepData.stats.lastSleep.endTime || sleepData.stats.lastSleep.startTime)
    : 4

  const handleAddStar = () => {
    // This should be controlled by parent approval
    // For now, just provide feedback
    alert('🌟 Great job! Ask mom or dad to approve your star!')
    // Play twinkling chime sound (blueprint requirement)
    // Trigger star sparkle animation
  }

  const handleDance = () => {
    // Play 5-sec celebration GIF (blueprint requirement)
    alert('🎉 Dance time! *plays celebration animation*')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <div className="backdrop-blur-lg bg-white/70 border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/child/phases" className="w-10 h-10 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 flex items-center justify-center hover:scale-105 transition-transform">
                <Home className="w-5 h-5 text-white" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Star Collection
                </h1>
                <p className="text-sm text-slate-600">Toddler Interface • Age 1-3</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-medium text-slate-700">Good Job!</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Mascot Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-r from-emerald-400 to-teal-400 flex items-center justify-center mx-auto mb-4 shadow-xl hover:scale-105 transition-transform">
            <span className="text-5xl">🐻</span>
          </div>
          <Button
            onClick={() => alert(`"${mantra}"`)}
            className="px-8 py-4 bg-gradient-to-r from-emerald-400 to-teal-400 text-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 text-xl font-bold hover:scale-105"
          >
            {mantra} 🔊
          </Button>
        </div>

        {/* Star Jar - Large and Beautiful */}
        <Card className="mb-8 border-0 bg-white/60 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6">
                My Star Jar ⭐
              </h2>
              
              {/* Beautiful Glass Jar */}
              <div className="relative mx-auto w-48 h-56 mb-6">
                <div className="w-full h-full bg-gradient-to-b from-blue-100/50 to-blue-200/30 rounded-t-3xl rounded-b-2xl border-4 border-blue-300/50 backdrop-blur-sm relative overflow-hidden shadow-xl">
                  {/* Floating Stars inside jar */}
                  <div className="absolute inset-6 flex flex-wrap gap-2 items-end justify-center">
                    {Array.from({ length: Math.min(totalStars, 25) }).map((_, i) => (
                      <div 
                        key={i} 
                        className="text-yellow-400 text-2xl animate-bounce transition-all duration-1000" 
                        style={{ 
                          animationDelay: `${i * 0.1}s`,
                          animationDuration: '3s'
                        }}
                      >
                        ⭐
                      </div>
                    ))}
                  </div>
                  
                  {/* Star counter */}
                  <div className="absolute top-4 left-4 right-4 text-center">
                    <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-lg">
                      <span className="text-2xl font-bold text-yellow-600">{totalStars} Stars!</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-lg text-slate-600 font-medium">
                Wow! You collected {totalStars} stars today! 🌟
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Routine Rings */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="mb-4 text-4xl">🍎</div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">Snack Time</h3>
              <div className="relative w-20 h-20 mx-auto mb-4">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
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
                    stroke={lastMeal > 3 ? "#EF4444" : "#10B981"}
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={`${Math.max(0, 100 - ((lastMeal / 4) * 100)) * 2.2} 220`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-slate-600">{lastMeal}h</span>
                </div>
              </div>
              <p className="text-sm text-slate-600">Last meal {lastMeal}h ago</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="mb-4 text-4xl">😴</div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">Nap Time</h3>
              <div className="relative w-20 h-20 mx-auto mb-4">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
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
                    stroke={lastNap > 5 ? "#EF4444" : "#10B981"}
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={`${Math.max(0, 100 - ((lastNap / 6) * 100)) * 2.2} 220`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-slate-600">{lastNap}h</span>
                </div>
              </div>
              <p className="text-sm text-slate-600">Last nap {lastNap}h ago</p>
            </CardContent>
          </Card>
        </div>

        {/* Big Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Button 
            onClick={handleAddStar}
            className="h-20 bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-2xl font-bold rounded-3xl"
          >
            <Star className="w-8 h-8 mr-3" />
            Get Star! ⭐
          </Button>

          <Button 
            onClick={handleDance}
            className="h-20 bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-2xl font-bold rounded-3xl"
          >
            <PartyPopper className="w-8 h-8 mr-3" />
            Dance! 🎉
          </Button>

          <Link href="/child/toddler/play">
            <Button 
              className="w-full h-20 bg-gradient-to-r from-blue-400 to-cyan-400 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-2xl font-bold rounded-3xl"
            >
              <Rocket className="w-8 h-8 mr-3" />
              Play! 🚀
            </Button>
          </Link>
        </div>

        {/* Navigation and More Options */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-200"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-200"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-200"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Link href="/child/toddler/potty">
              <Button className="w-full h-16 bg-gradient-to-r from-emerald-400 to-teal-400 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-lg font-bold rounded-2xl">
                <Timer className="w-6 h-6 mr-2" />
                Potty Time 🚽
              </Button>
            </Link>
            
            <Link href="/child/toddler/calm">
              <Button className="w-full h-16 bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-lg font-bold rounded-2xl">
                <Heart className="w-6 h-6 mr-2" />
                Calm Space 🧘‍♀️
              </Button>
            </Link>
          </div>
          
          <p className="text-lg text-slate-600 mt-6 font-medium">
            👆 Tap the big buttons! Great job! 🌟
          </p>
        </div>
      </div>
    </div>
  )
}