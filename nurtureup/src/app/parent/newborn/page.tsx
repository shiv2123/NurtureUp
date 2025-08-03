'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Baby, Clock, FileText, TrendingUp, User, Home, Droplets, Moon, Heart } from 'lucide-react'
import { useFeedingLogs } from '@/hooks/useFeedingLogs'
import { useSleepLogs } from '@/hooks/useSleepLogs'
import { useDiaperLogs } from '@/hooks/useDiaperLogs'

/**
 * Newborn/Infant Parent Interface (Blueprint 3.2)
 * 
 * Navigation: Home, Log, Growth, Profile
 * Features: Feed tracking, Sleep monitoring, Growth charts, Milestone capture
 */
export default function NewbornPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('home')
  const [childId, setChildId] = useState<string | null>(null)
  const [babyAge, setBabyAge] = useState(87) // days
  const [showFeedModal, setShowFeedModal] = useState(false)
  const [showSleepModal, setShowSleepModal] = useState(false)
  const [showDiaperModal, setShowDiaperModal] = useState(false)
  const [feedType, setFeedType] = useState<'bottle' | 'breast'>('bottle')
  const [feedAmount, setFeedAmount] = useState('')
  const [diaperType, setDiaperType] = useState<'wet' | 'dirty'>('wet')

  // Real data hooks
  const { data: feedingData, isLoading: feedingLoading, createFeedingLog } = useFeedingLogs(childId)
  const { data: sleepData, isLoading: sleepLoading, createSleepLog } = useSleepLogs(childId)
  const { data: diaperData, isLoading: diaperLoading, createDiaperLog } = useDiaperLogs(childId)

  // Get child ID from family - for demo, we'll use the first child or youngest
  useEffect(() => {
    const fetchChild = async () => {
      if (session?.user?.familyId) {
        try {
          const response = await fetch('/api/children')
          if (response.ok) {
            const children = await response.json()
            if (children.length > 0) {
              // Find the youngest child (most likely to be a newborn/infant)
              const youngest = children.reduce((youngest: any, child: any) => {
                return new Date(child.dateOfBirth) > new Date(youngest.dateOfBirth) ? child : youngest
              })
              
              setChildId(youngest.id)
              setBabyAge(calculateDaysOld(new Date(youngest.dateOfBirth)))
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
    { id: 'log', label: 'Log', icon: FileText },
    { id: 'growth', label: 'Growth', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: User }
  ]

  const quickActions = [
    { 
      id: 'feed', 
      label: 'Log Feed', 
      icon: Baby, 
      color: 'from-blue-400 to-cyan-400', 
      onClick: () => setShowFeedModal(true) 
    },
    { 
      id: 'sleep', 
      label: 'Log Sleep', 
      icon: Moon, 
      color: 'from-purple-400 to-indigo-400',
      onClick: () => setShowSleepModal(true)
    },
    { 
      id: 'diaper', 
      label: 'Log Diaper', 
      icon: Droplets, 
      color: 'from-green-400 to-emerald-400',
      onClick: () => setShowDiaperModal(true)
    },
    { id: 'photo', label: 'Add Photo', icon: Heart, color: 'from-pink-400 to-rose-400' }
  ]

  // Action handlers
  const handleFeedSubmit = async () => {
    if (!feedAmount.trim() || !childId) return
    
    try {
      await createFeedingLog({
        childId,
        type: feedType,
        amount: feedType === 'bottle' ? parseFloat(feedAmount) : undefined,
        duration: feedType === 'breast' ? parseInt(feedAmount) : undefined,
        startTime: new Date().toISOString()
      })
      
      setFeedAmount('')
      setShowFeedModal(false)
    } catch (error) {
      console.error('Failed to log feed:', error)
    }
  }

  const handleSleepStart = async () => {
    if (!childId) return
    
    try {
      await createSleepLog({
        childId,
        type: 'nap',
        startTime: new Date().toISOString(),
        notes: 'Sleep session started'
      })
      
      setShowSleepModal(false)
    } catch (error) {
      console.error('Failed to log sleep:', error)
    }
  }

  const handleDiaperSubmit = async () => {
    if (!childId) return
    
    try {
      await createDiaperLog({
        childId,
        type: diaperType,
        changedAt: new Date().toISOString()
      })
      
      setShowDiaperModal(false)
    } catch (error) {
      console.error('Failed to log diaper change:', error)
    }
  }

  // Helper functions
  const calculateDaysOld = (birthDate: Date): number => {
    const today = new Date()
    const diffMs = today.getTime() - birthDate.getTime()
    return Math.floor(diffMs / (1000 * 60 * 60 * 24))
  }

  const getTimeAgo = (date: string): string => {
    const now = new Date()
    const past = new Date(date)
    const diffMs = now.getTime() - past.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    
    if (diffHours > 0) return `${diffHours}h ${diffMinutes % 60}m ago`
    return `${diffMinutes}m ago`
  }

  // Calculate real data
  const lastFeedHours = feedingData?.stats?.lastFeeding ? 
    Math.floor((Date.now() - new Date(feedingData.stats.lastFeeding.startTime).getTime()) / (1000 * 60 * 60)) : 0
  
  const sleepToday = sleepData?.stats ? (sleepData.stats.totalSleepTime / 60) : 0 // Convert minutes to hours
  
  const diaperCount = {
    wet: diaperData?.stats?.wetChanges || 0,
    dirty: diaperData?.stats?.dirtyChanges || 0
  }

  const recentFeeds = feedingData?.feedingLogs?.slice(0, 3) || []

  const renderHomeTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center mx-auto mb-4 shadow-xl">
          <span className="text-3xl">👶</span>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
          Day {babyAge}
        </h2>
        <p className="text-lg text-slate-600 font-medium">Your little one is growing beautifully!</p>
      </div>

      {/* Cards */}
      <div className="grid gap-6">
        {/* Feed Ring */}
        <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 cursor-pointer" onClick={() => setShowFeedModal(true)}>
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="35" stroke="#E5E7EB" strokeWidth="8" fill="none" />
                  <circle
                    cx="50" cy="50" r="35"
                    stroke="#3B82F6" strokeWidth="8" fill="none"
                    strokeDasharray={`${(lastFeedHours / 4) * 220} 220`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Baby className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-800 mb-2">Last Feed</h3>
                <p className="text-slate-600 mb-3">
                  {feedingData?.stats?.lastFeeding ? 
                    `${lastFeedHours}h ago • ${feedingData.stats.lastFeeding.type} ${feedingData.stats.lastFeeding.amount ? feedingData.stats.lastFeeding.amount + ' oz' : feedingData.stats.lastFeeding.duration + ' min'}` :
                    'No feeds logged yet'
                  }
                </p>
                <Button size="sm" className="bg-blue-500 hover:bg-blue-600" onClick={() => setShowFeedModal(true)}>
                  Log Feed
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sleep Tracker */}
        <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-800">Sleep Today</h3>
              <span className="text-2xl font-bold text-purple-600">{sleepToday.toFixed(1)}h</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-4 mb-4">
              <div 
                className="bg-gradient-to-r from-purple-400 to-indigo-400 h-4 rounded-full transition-all duration-1000"
                style={{ width: `${(sleepToday / 16) * 100}%` }}
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowSleepModal(true)}>Log Sleep</Button>
          </CardContent>
        </Card>

        {/* Diaper Count */}
        <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Diaper Changes Today</h3>
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-600">{diaperCount.wet}</div>
                <div className="text-sm text-slate-600">Wet 💧</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600">{diaperCount.dirty}</div>
                <div className="text-sm text-slate-600">Dirty 💩</div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowDiaperModal(true)}>Log Diaper</Button>
          </CardContent>
        </Card>

        {/* Next Pediatric Visit */}
        <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Next Checkup</h3>
                <p className="text-slate-600 mb-2">3-month wellness visit</p>
                <p className="text-sm text-slate-500">Dr. Johnson • Next Friday, 10:00 AM</p>
              </div>
              <div className="text-right">
                <Button variant="outline" size="sm" className="mb-2">Add Questions</Button>
                <br />
                <Button variant="ghost" size="sm">Navigate</Button>
              </div>
            </div>
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

  const renderLogTab = () => (
    <div className="space-y-6">
      <div className="text-center">
        <FileText className="w-16 h-16 text-blue-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Care Log Center</h3>
        <p className="text-slate-600">Track feeds, sleep, diapers, and more</p>
      </div>

      {/* Recent Feeds */}
      <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Feeds</span>
            <Button size="sm" onClick={() => setShowFeedModal(true)}>Add Feed</Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentFeeds.length > 0 ? recentFeeds.map((feed: any) => (
              <div key={feed.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <div className="font-medium">{feed.type}</div>
                  <div className="text-sm text-slate-600">{getTimeAgo(feed.startTime)}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {feed.amount ? `${feed.amount} oz` : feed.duration ? `${feed.duration} min` : 'N/A'}
                  </div>
                  {feed.notes && <div className="text-sm text-slate-600">{feed.notes}</div>}
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-slate-500">
                <Baby className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No feeds logged yet</p>
                <p className="text-sm">Start tracking your baby's feeds!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      {/* Header */}
      <div className="backdrop-blur-lg bg-white/70 border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="w-10 h-10 rounded-2xl bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center hover:scale-105 transition-transform">
                <Home className="w-5 h-5 text-white" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Newborn Care
                </h1>
                <p className="text-sm text-slate-600">Day {babyAge} • 0-12 months</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Baby className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-slate-700">Growing Strong</span>
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
                      ? 'bg-blue-500 text-white shadow-lg'
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
        {activeTab === 'log' && renderLogTab()}
        {activeTab === 'growth' && (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Growth Tracker</h3>
            <p className="text-slate-600">Monitor weight, length, and developmental milestones</p>
          </div>
        )}
        {activeTab === 'profile' && (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Baby Profile</h3>
            <p className="text-slate-600">Manage baby info, caregivers, and immunizations</p>
          </div>
        )}

        {/* Floating Action Button */}
        <div className="fixed bottom-8 right-8 z-40">
          <Button
            className="w-16 h-16 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-xl hover:scale-110 transition-all duration-300"
          >
            <Plus className="w-8 h-8" />
          </Button>
        </div>

        {/* Feed Modal */}
        {showFeedModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-white m-4 max-w-md w-full shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-blue-700">Log Feed</CardTitle>
                  <Button variant="ghost" onClick={() => setShowFeedModal(false)}>✕</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Feed Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant={feedType === 'bottle' ? 'default' : 'outline'}
                        onClick={() => setFeedType('bottle')}
                        className={feedType === 'bottle' ? 'bg-blue-500 text-white' : ''}
                      >
                        Bottle
                      </Button>
                      <Button 
                        variant={feedType === 'breast' ? 'default' : 'outline'}
                        onClick={() => setFeedType('breast')}
                        className={feedType === 'breast' ? 'bg-blue-500 text-white' : ''}
                      >
                        Breast
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {feedType === 'bottle' ? 'Amount (oz)' : 'Duration (minutes)'}
                    </label>
                    <input
                      type="number"
                      value={feedAmount}
                      onChange={(e) => setFeedAmount(e.target.value)}
                      placeholder={feedType === 'bottle' ? 'e.g., 4' : 'e.g., 15'}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleFeedSubmit}
                      disabled={!feedAmount.trim() || feedingLoading}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Save Feed
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowFeedModal(false)
                        setFeedAmount('')
                      }}
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

        {/* Sleep Modal */}
        {showSleepModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-white m-4 max-w-md w-full shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-purple-700">Log Sleep</CardTitle>
                  <Button variant="ghost" onClick={() => setShowSleepModal(false)}>✕</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <Moon className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                    <p className="text-slate-600 mb-4">Start tracking your baby's sleep session</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSleepStart}
                      disabled={sleepLoading}
                      className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
                    >
                      Start Sleep Session
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowSleepModal(false)}
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

        {/* Diaper Modal */}
        {showDiaperModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-white m-4 max-w-md w-full shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-green-700">Log Diaper Change</CardTitle>
                  <Button variant="ghost" onClick={() => setShowDiaperModal(false)}>✕</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Diaper Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant={diaperType === 'wet' ? 'default' : 'outline'}
                        onClick={() => setDiaperType('wet')}
                        className={`${diaperType === 'wet' ? 'bg-cyan-500 text-white' : ''} flex flex-col gap-1 h-16`}
                      >
                        <span className="text-xl">💧</span>
                        <span>Wet</span>
                      </Button>
                      <Button 
                        variant={diaperType === 'dirty' ? 'default' : 'outline'}
                        onClick={() => setDiaperType('dirty')}
                        className={`${diaperType === 'dirty' ? 'bg-amber-500 text-white' : ''} flex flex-col gap-1 h-16`}
                      >
                        <span className="text-xl">💩</span>
                        <span>Dirty</span>
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleDiaperSubmit}
                      disabled={diaperLoading}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                    >
                      Log Change
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowDiaperModal(false)}
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
      </div>
    </div>
  )
}