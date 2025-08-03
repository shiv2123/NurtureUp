'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useFeedingLogs } from '@/hooks/useFeedingLogs'
import { useSleepLogs } from '@/hooks/useSleepLogs'
import { useDiaperLogs } from '@/hooks/useDiaperLogs'
import { formatChildAge } from '@/lib/stage-engine'
import { 
  Plus, 
  Timer, 
  Moon, 
  Droplets, 
  CheckCircle, 
  Camera,
  Bell,
  Settings,
  Baby
} from 'lucide-react'

interface ParentHomeClientProps {
  greeting: string
  children: any[]
  parentStage: string
}

export function ParentHomeClient({ greeting, children, parentStage }: ParentHomeClientProps) {
  const youngestChild = children.length > 0 ? children[0] : null
  const childId = youngestChild?.id
  
  // Hooks for data fetching and mutations
  const { data: feedingData, logFeeding, isLoading: feedingLoading } = useFeedingLogs(childId)
  const { data: sleepData, startSleep, endSleep, isLoading: sleepLoading } = useSleepLogs(childId)
  const { data: diaperData, logDiaperChange, isLoading: diaperLoading } = useDiaperLogs(childId)
  
  // Modal states
  const [showFeedingModal, setShowFeedingModal] = useState(false)
  const [showSleepModal, setShowSleepModal] = useState(false)
  const [showDiaperModal, setShowDiaperModal] = useState(false)

  // Quick action handlers
  const handleQuickFeedLog = async () => {
    if (!childId) return
    try {
      await logFeeding({
        type: 'bottle',
        amount: 120, // Default 4oz
        notes: 'Quick logged feeding'
      })
    } catch (error) {
      console.error('Failed to log feeding:', error)
    }
  }

  const handleStartNapTimer = async () => {
    if (!childId) return
    try {
      await startSleep({
        type: 'nap',
        notes: 'Nap started via timer'
      })
    } catch (error) {
      console.error('Failed to start nap timer:', error)
    }
  }

  const handleQuickDiaperLog = async () => {
    if (!childId) return
    try {
      await logDiaperChange({
        type: 'wet',
        notes: 'Quick logged diaper change'
      })
    } catch (error) {
      console.error('Failed to log diaper change:', error)
    }
  }

  if (parentStage === 'newborn_infant' && youngestChild) {
    const infantData = {
      age: formatChildAge(youngestChild.dateOfBirth || new Date()),
      lastFeed: feedingData?.stats?.lastFeeding ? 
        `${Math.round((new Date().getTime() - new Date(feedingData.stats.lastFeeding.startTime).getTime()) / (1000 * 60 * 60))}h ago` : 
        '2 hours ago',
      lastSleep: sleepData?.stats?.lastSleep ? 
        `${Math.round((new Date().getTime() - new Date(sleepData.stats.lastSleep.startTime).getTime()) / (1000 * 60 * 60))}h ago` : 
        '1 hour ago',
    }

    return (
      <>
        {/* Beautiful Header for Newborn */}
        <header className="sticky top-0 z-40 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 shadow-lg">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-xl border border-white/30 backdrop-blur-xl flex-shrink-0">
                  <Baby className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-lg" />
                </div>
                <div className="min-w-0">
                  <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white drop-shadow-lg">
                    {greeting}
                  </h1>
                  <p className="text-white/90 text-base sm:text-lg lg:text-xl font-medium mt-1">
                    {youngestChild?.user.name} • {infantData.age} • Growing strong! 🌟
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 self-start sm:self-center">
                <Button variant="glass" size="lg" className="rounded-xl sm:rounded-2xl bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-xl transition-all duration-300 p-2 sm:p-3">
                  <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                </Button>
                <Button variant="glass" size="lg" className="rounded-xl sm:rounded-2xl bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-xl transition-all duration-300 p-2 sm:p-3">
                  <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative">
          {/* Decorative elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-br from-emerald-300/30 to-teal-300/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-40 left-10 w-48 h-48 bg-gradient-to-br from-blue-300/30 to-cyan-300/30 rounded-full blur-3xl"></div>
            <div className="absolute top-60 left-1/2 w-32 h-32 bg-gradient-to-br from-green-300/20 to-emerald-300/20 rounded-full blur-2xl"></div>
          </div>
          
          <div className="space-y-10 relative z-10">
            {/* Feed Ring Card */}
            <Card variant="gradient" className="group overflow-hidden bg-gradient-to-br from-white via-emerald-50 to-green-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-3xl">
              <CardContent className="p-8 lg:p-10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8 flex-1">
                    <div className="relative flex-shrink-0">
                      <div className="absolute -inset-4 bg-gradient-to-r from-emerald-400/20 to-green-400/20 rounded-full blur-xl"></div>
                      <Progress 
                        value={feedingData?.stats?.totalFeedings ? Math.min((feedingData.stats.totalFeedings / 8) * 100, 100) : 75} 
                        size={100} 
                        color="rgb(16, 185, 129)" 
                        className="drop-shadow-lg relative z-10"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center bg-white/95 rounded-full w-16 h-16 flex flex-col items-center justify-center backdrop-blur-sm border border-emerald-100 shadow-md">
                          <div className="text-xl font-bold text-emerald-600">
                            {feedingData?.stats?.totalFeedings || '2h'}
                          </div>
                          <div className="text-xs text-emerald-500">
                            {feedingData?.stats?.totalFeedings ? 'today' : 'ago'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-3">
                        Last Feed 🍼
                      </h3>
                      <p className="text-gray-700 text-base sm:text-lg mb-2">
                        {infantData.lastFeed} • <span className="text-emerald-600 font-semibold">Time for next feed</span>
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-emerald-600 font-medium text-sm">
                          {feedingLoading ? 'Updating...' : 'Feeding schedule on track'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Button 
                      variant="gradient"
                      size="lg" 
                      onClick={handleQuickFeedLog}
                      disabled={feedingLoading}
                      className="bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 px-6 py-3 rounded-2xl w-full sm:w-auto"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      {feedingLoading ? 'Logging...' : 'Log Feed'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sleep Tracker Card */}
            <Card variant="gradient" className="group overflow-hidden bg-gradient-to-br from-white via-blue-50 to-indigo-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-3xl">
              <CardContent className="p-8 lg:p-10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-6 sm:gap-8 flex-1">
                    <div className="relative flex-shrink-0">
                      <div className="absolute -inset-3 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-lg"></div>
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg relative z-10">
                        <Moon className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                        Sleep Tracker 😴
                      </h3>
                      <p className="text-gray-700 text-base sm:text-lg mb-4">
                        Last nap: {infantData.lastSleep} • 
                        <span className="text-blue-600 font-semibold ml-1">
                          {sleepData?.stats?.totalSleepTime ? 
                            `${Math.round(sleepData.stats.totalSleepTime / 60)}h total today` : 
                            '6.5h total today'
                          }
                        </span>
                      </p>
                      {/* Beautiful sleep chart */}
                      <div className="flex gap-2 mb-3">
                        {[1,1,0,1,0,1,1,0,1,0,0,1].map((sleep, i) => (
                          <div 
                            key={i} 
                            className={`w-4 h-6 rounded-full transition-all duration-300 ${
                              sleep 
                                ? 'bg-gradient-to-t from-blue-500 to-indigo-400 shadow-sm' 
                                : 'bg-gray-200'
                            }`} 
                          />
                        ))}
                      </div>
                      <p className="text-blue-600 font-medium text-sm">
                        {sleepLoading ? 'Updating...' : 'Sleep pattern looks healthy'}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Button 
                      variant="gradient"
                      size="lg" 
                      onClick={handleStartNapTimer}
                      disabled={sleepLoading}
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 px-6 py-3 rounded-2xl w-full sm:w-auto"
                    >
                      <Timer className="w-5 h-5 mr-2" />
                      {sleepLoading ? 'Starting...' : 'Start Nap Timer'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions for Infants */}
            <div className="mt-12">
              <h4 className="text-xl font-semibold text-gray-800 mb-6">Quick Actions</h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                  { 
                    icon: Droplets, 
                    label: 'Log Feed', 
                    color: 'from-emerald-500 to-green-500',
                    onClick: handleQuickFeedLog,
                    loading: feedingLoading
                  },
                  { 
                    icon: Moon, 
                    label: 'Log Sleep', 
                    color: 'from-blue-500 to-indigo-500',
                    onClick: handleStartNapTimer,
                    loading: sleepLoading
                  },
                  { 
                    icon: CheckCircle, 
                    label: 'Log Diaper', 
                    color: 'from-orange-500 to-yellow-500',
                    onClick: handleQuickDiaperLog,
                    loading: diaperLoading
                  },
                  { 
                    icon: Camera, 
                    label: 'Add Photo', 
                    color: 'from-purple-500 to-pink-500',
                    onClick: () => console.log('Add photo clicked'),
                    loading: false
                  }
                ].map((action, index) => (
                  <Button
                    key={index}
                    variant="glass"
                    onClick={action.onClick}
                    disabled={action.loading}
                    className="h-20 sm:h-24 flex flex-col gap-2 sm:gap-3 bg-white/90 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 rounded-2xl"
                  >
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center shadow-md`}>
                      <action.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium text-sm">
                      {action.loading ? 'Loading...' : action.label}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </main>
      </>
    )
  }

  // Return placeholder for other stages (can be expanded later)
  return (
    <div className="p-8 text-center">
      <h2 className="text-3xl font-bold mb-4">
        {parentStage === 'ttc_pregnancy' && 'TTC & Pregnancy Dashboard'}
        {parentStage === 'toddler' && 'Toddler Dashboard'}
        {parentStage === 'early_childhood' && 'Early Childhood Dashboard'}
        {parentStage === 'school_age' && 'School Age Dashboard'}
        {parentStage === 'adolescence' && 'Adolescence Dashboard'}
      </h2>
      <p className="text-gray-600">Interactive features coming soon for this stage!</p>
    </div>
  )
}