'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ApprovalButton } from '@/components/parent/ApprovalButton'
import { Progress } from '@/components/ui/progress'
import { getParentStage, formatChildAge } from '@/lib/stage-engine'
// import { ParentHomeClient } from '@/components/parent/ParentHomeClient' // Now using stage-specific dashboards instead
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
// 
import { 
  Users,
  CheckCircle,
  Clock,
  Star,
  Plus,
  ArrowRight,
  Heart,
  Calendar,
  Bell,
  Settings,
  Sparkles,
  Trophy,
  Home,
  Baby,
  GraduationCap,
  Activity,
  TrendingUp,
  Zap,
  Target,
  Award,
  ChevronRight,
  MoreHorizontal,
  Droplets,
  Scale,
  Stethoscope,
  Timer,
  BookOpen,
  Camera,
  HeartHandshake,
  MapPin,
  Clipboard,
  Pregnancy,
  Moon,
  Sun,
  StickyNote
} from 'lucide-react'

export default function ParentHomePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [children, setChildren] = useState([])
  const [pendingTasks, setPendingTasks] = useState([])
  const [familyStats, setFamilyStats] = useState({
    totalTasks: 12,
    completedTasks: 8,
    totalStars: 247,
    activeChildren: 3,
    screenTime: '2h 15m',
    familyMood: 'Great',
    upcomingEvents: 3
  })
  const [loading, setLoading] = useState(true)

  // Fetch dashboard data
  useEffect(() => {
    if (!session?.user?.familyId) return

    async function fetchData() {
      try {
        const [childrenRes, pendingTasksRes] = await Promise.all([
          fetch('/api/children'),
          fetch('/api/parent/pending-approvals')
        ])

        if (childrenRes.ok) {
          const childrenData = await childrenRes.json()
          setChildren(childrenData.children || [])
        }

        if (pendingTasksRes.ok) {
          const pendingData = await pendingTasksRes.json()
          setPendingTasks(Array.isArray(pendingData) ? pendingData.slice(0, 3) : (pendingData.tasks || []).slice(0, 3))
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session])

  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening'

  // Navigation handlers
  const handleNotifications = () => {
    router.push('/parent/notifications')
  }

  const handleSettings = () => {
    router.push('/parent/settings')
  }

  // Quick action handlers
  const handleLogFeed = async () => {
    if (children.length === 0) {
      alert('Please add a child first')
      return
    }
    
    try {
      const response = await fetch('/api/child/feeding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId: children[0].id,
          type: 'bottle', // Default to bottle
          amount: 120, // Default amount
          notes: 'Quick logged from dashboard'
        })
      })
      
      if (response.ok) {
        alert('✅ Feed logged successfully!')
      } else {
        throw new Error('Failed to log feed')
      }
    } catch (error) {
      console.error('Error logging feed:', error)
      alert('❌ Failed to log feed')
    }
  }

  const handleLogSleep = async () => {
    if (children.length === 0) {
      alert('Please add a child first')
      return
    }
    
    try {
      const response = await fetch('/api/child/sleep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId: children[0].id,
          type: 'nap',
          startTime: new Date().toISOString(),
          notes: 'Quick logged from dashboard'
        })
      })
      
      if (response.ok) {
        alert('✅ Sleep logged successfully!')
      } else {
        throw new Error('Failed to log sleep')
      }
    } catch (error) {
      console.error('Error logging sleep:', error)
      alert('❌ Failed to log sleep')
    }
  }

  const handleLogDiaper = async () => {
    if (children.length === 0) {
      alert('Please add a child first')
      return
    }
    
    try {
      const response = await fetch('/api/child/diaper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId: children[0].id,
          type: 'wet',
          notes: 'Quick logged from dashboard'
        })
      })
      
      if (response.ok) {
        alert('✅ Diaper change logged successfully!')
      } else {
        throw new Error('Failed to log diaper')
      }
    } catch (error) {
      console.error('Error logging diaper:', error)
      alert('❌ Failed to log diaper change')
    }
  }

  const handleAddPhoto = () => {
    router.push('/parent/timeline?action=add-photo')
  }

  const handleStartNapTimer = () => {
    const startTime = new Date()
    localStorage.setItem('napTimerStart', startTime.toISOString())
    alert('⏰ Nap timer started! Check back when nap is finished.')
  }

  // Toddler specific handlers
  const handleLogPottySuccess = async () => {
    if (children.length === 0) {
      alert('Please add a child first')
      return
    }
    
    try {
      const response = await fetch('/api/child/potty-training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId: children[0].id,
          type: 'success',
          notes: 'Success logged from dashboard'
        })
      })
      
      if (response.ok) {
        alert('🎉 Potty success logged!')
      } else {
        throw new Error('Failed to log potty success')
      }
    } catch (error) {
      console.error('Error logging potty success:', error)
      alert('❌ Failed to log potty success')
    }
  }

  const handleCalmDownTimer = () => {
    const duration = 5 // 5 minutes default
    alert(`🧘‍♀️ Calm down timer started for ${duration} minutes. Take deep breaths together!`)
    
    // Could integrate with a proper timer component
    setTimeout(() => {
      alert('✨ Calm down time is over! Great job staying calm!')
    }, duration * 60 * 1000)
  }

  // Universal handlers to pass to all stage components
  const handlers = {
    handleNotifications,
    handleSettings,
    handleLogFeed,
    handleLogSleep,
    handleLogDiaper,
    handleAddPhoto,
    handleStartNapTimer,
    handleLogPottySuccess,
    handleCalmDownTimer
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your family dashboard...</p>
        </div>
      </div>
    )
  }

  // Calculate parent stage based on youngest child (or pregnancy if no children)
  const parentStage = getParentStage(children.map(child => ({
    id: child.id,
    name: child.user.name,
    dateOfBirth: child.dateOfBirth || new Date()
  })))
  
  const youngestChild = children.length > 0 
    ? children.reduce((youngest, child) => {
        const childDate = child.dateOfBirth || new Date(child.user.createdAt)
        const youngestDate = youngest.dateOfBirth || new Date(youngest.user.createdAt)
        return childDate > youngestDate ? child : youngest
      })
    : null

  // Render stage-specific dashboard
  const renderStageSpecificDashboard = () => {
    // TEMPORARY: Force newborn dashboard to show demo UI
    return <NewbornInfantDashboard greeting={greeting} pendingTasks={pendingTasks} familyStats={familyStats} youngestChild={youngestChild} handlers={handlers} router={router} />
    
    // Original logic (commented out for demo)
    // switch (parentStage) {
    //   case 'ttc_pregnancy':
    //     return <TtcPregnancyDashboard greeting={greeting} pendingTasks={pendingTasks} familyStats={familyStats} handlers={handlers} router={router} />
    //   case 'newborn_infant':
    //     return <NewbornInfantDashboard greeting={greeting} pendingTasks={pendingTasks} familyStats={familyStats} youngestChild={youngestChild} handlers={handlers} router={router} />
    //   case 'toddler':
    //     return <ToddlerDashboard greeting={greeting} pendingTasks={pendingTasks} familyStats={familyStats} children={children} handlers={handlers} router={router} />
    //   case 'early_childhood':
    //     return <EarlyChildhoodDashboard greeting={greeting} pendingTasks={pendingTasks} familyStats={familyStats} children={children} handlers={handlers} router={router} />
    //   case 'school_age':
    //     return <SchoolAgeDashboard greeting={greeting} pendingTasks={pendingTasks} familyStats={familyStats} children={children} handlers={handlers} router={router} />
    //   case 'adolescence':
    //     return <AdolescenceDashboard greeting={greeting} pendingTasks={pendingTasks} familyStats={familyStats} children={children} handlers={handlers} router={router} />
    //   default:
    //     return <TtcPregnancyDashboard greeting={greeting} pendingTasks={pendingTasks} familyStats={familyStats} handlers={handlers} router={router} />
    // }
  }

  return (
    <div className="min-h-screen bg-app-bg">
      {renderStageSpecificDashboard()}

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8">
        <Button
          size="fab"
          variant="pink"
          className="fab"
        >
          <Plus className="h-7 w-7 text-white" />
        </Button>
      </div>
    </div>
  )
}

// TTC & Pregnancy Stage Dashboard (Section 3.1A from blueprint)
function TtcPregnancyDashboard({ greeting, pendingTasks, familyStats, handlers, router }: {
  greeting: string
  pendingTasks: any[]
  familyStats: any
  handlers: any
  router: any
}) {
  // Mock pregnancy data - would come from database in production
  const pregnancyData = {
    gestationWeek: 18,
    gestationDay: 3,
    babySize: 'Sweet Potato',
    nextAppointment: {
      date: 'Nov 15, 2024',
      time: '2:30 PM',
      clinic: 'Women\'s Health Center'
    },
    hydrationGoal: 8,
    hydrationCurrent: 5,
    dueDate: new Date('2025-03-15')
  }

  return (
    <>
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white sticky top-0 z-40 border-none">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{greeting}</h1>
              <p className="text-pink-100 mt-1">
                Week {pregnancyData.gestationWeek} + {pregnancyData.gestationDay} • Your magical journey ✨
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="glass"
                size="sm"
                onClick={handlers.handleNotifications}
              >
                <Bell className="w-5 h-5" />
              </Button>
              <Button 
                variant="glass"
                size="sm"
                onClick={handlers.handleSettings}
              >
                <Settings className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12 relative">
        {/* Decorative background elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-br from-pink-300/30 to-purple-300/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 left-10 w-48 h-48 bg-gradient-to-br from-indigo-300/30 to-blue-300/30 rounded-full blur-3xl"></div>
          <div className="absolute top-60 left-1/2 w-32 h-32 bg-gradient-to-br from-yellow-300/20 to-orange-300/20 rounded-full blur-2xl"></div>
        </div>
        
        {/* Beautiful card stack */}
        <div className="space-y-8 relative z-10">
          {/* Fetal Growth Card */}
          <Card variant="gradient" className="group overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2">
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-pink-400/20 to-purple-400/20 rounded-full blur-xl"></div>
                    <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-xl relative z-10">
                      <Baby className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <div>
                    <CardTitle level={1} gradient className="text-3xl mb-2">
                      Baby is {pregnancyData.babySize} size! 🥔
                    </CardTitle>
                    <p className="text-base-content/70 text-lg">Week {pregnancyData.gestationWeek} development milestone</p>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-pulse"></div>
                      <span className="text-pink-600 font-semibold">Growing perfectly!</span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="gradient"
                  size="lg" 
                  className="px-8 py-4 text-lg"
                  onClick={() => router.push('/parent/progress')}
                >
                  View Details <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Next Appointment Card */}
          <Card variant="interactive" className="group overflow-hidden border-0 shadow-2xl">
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-emerald-400/20 to-blue-400/20 rounded-full blur-xl"></div>
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center shadow-xl relative z-10">
                      <Calendar className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <div>
                    <CardTitle level={1} gradient className="text-3xl mb-2">
                      Next Appointment 👩‍⚕️
                    </CardTitle>
                    <p className="text-base-content/70 text-lg">{pregnancyData.nextAppointment.date} at {pregnancyData.nextAppointment.time}</p>
                    <p className="text-base-content/60">{pregnancyData.nextAppointment.clinic}</p>
                  </div>
                </div>
                <CardActions>
                  <Button variant="outline" size="lg" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                    Add Questions
                  </Button>
                  <Button variant="gradient" size="lg" className="px-8 py-4">
                    <MapPin className="w-5 h-5 mr-2" />
                    Navigate
                  </Button>
                </CardActions>
              </div>
            </div>
          </Card>

          {/* Hydration Ring Card */}
          <Card variant="glass" className="group overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2">
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div className="relative">
                    <div className="absolute -inset-6 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-2xl"></div>
                    <div className="w-28 h-28 relative">
                      <Progress 
                        value={(pregnancyData.hydrationCurrent / pregnancyData.hydrationGoal) * 100} 
                        className="h-28 rounded-full"
                      />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center bg-white/90 rounded-full w-20 h-20 flex flex-col items-center justify-center backdrop-blur-sm border border-blue-100 shadow-lg">
                        <Droplets className="w-8 h-8 text-blue-500 mb-1" />
                        <div className="text-lg font-bold text-blue-600">{pregnancyData.hydrationCurrent}/{pregnancyData.hydrationGoal}</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <CardTitle level={1} gradient className="text-3xl mb-2">
                      Daily Hydration 💧
                    </CardTitle>
                    <p className="text-base-content/70 text-lg">Stay hydrated for you and baby</p>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse"></div>
                      <span className="text-blue-600 font-semibold">Good progress today!</span>
                    </div>
                  </div>
                </div>
                <Button variant="gradient" size="lg" className="px-8 py-4 text-lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Log Glass
                </Button>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Stethoscope, label: 'Log Symptom', color: 'from-red-500 to-pink-500' },
              { icon: Camera, label: 'Add Photo', color: 'from-purple-500 to-indigo-500' },
              { icon: Clipboard, label: 'Checklist', color: 'from-emerald-500 to-blue-500' },
              { icon: HeartHandshake, label: 'Partner Tips', color: 'from-orange-500 to-yellow-500' }
            ].map((action, index) => (
              <Button
                key={index}
                variant="glass"
                className="h-24 flex flex-col gap-3"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-base-content/80 font-semibold">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}

// Newborn/Infant Stage Dashboard - EXACTLY like Demo UI
function NewbornInfantDashboard({ greeting, pendingTasks, familyStats, youngestChild, handlers, router }: any) {
  const [fabOpen, setFabOpen] = useState(false);
  
  // Mock data - exactly like demo
  const babyData = {
    name: youngestChild?.user?.name || "Emma",
    avatar: "https://via.placeholder.com/150x150/FF69B4/FFFFFF?text=👶",
    dayOfLife: youngestChild ? Math.floor((new Date().getTime() - new Date(youngestChild.dateOfBirth || youngestChild.user.createdAt).getTime()) / (1000 * 3600 * 24)) : 87,
    lastFeed: "2 hours ago",
    feedProgress: 75,
    sleepHours: 14.5,
    diaperCount: 6,
    nextVisit: {
      date: "Aug 5, 2024",
      time: "10:30 AM",
      doctor: "Dr. Sarah Chen"
    },
    milestone: {
      title: "First Smile",
      image: "https://via.placeholder.com/150x150/FFB6C1/FFFFFF?text=😊",
      description: `${youngestChild?.user?.name || "Emma"} smiled for the first time today!`
    }
  };

  const quickActions = [
    { label: "Log Feed", icon: Baby, color: "bg-gradient-to-r from-emerald-500 to-teal-500" },
    { label: "Log Sleep", icon: Moon, color: "bg-gradient-to-r from-indigo-500 to-purple-500" },
    { label: "Log Diaper", icon: Droplets, color: "bg-gradient-to-r from-amber-500 to-orange-500" },
    { label: "Add Photo", icon: Camera, color: "bg-gradient-to-r from-pink-500 to-rose-500" }
  ];

  const fabActions = [
    { label: "Feed", icon: Baby, color: "bg-teal-500", position: "top-16 right-0" },
    { label: "Sleep", icon: Moon, color: "bg-indigo-500", position: "top-12 -right-12" },
    { label: "Diaper", icon: Droplets, color: "bg-amber-500", position: "top-0 -right-16" },
    { label: "Pump", icon: Heart, color: "bg-rose-500", position: "-top-12 -right-12" },
    { label: "Note", icon: StickyNote, color: "bg-purple-500", position: "-top-16 right-0" }
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="header-glass px-6 py-6 sticky top-0 z-40">
        <div className="flex items-center justify-between container-modern">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16 ring-4 ring-purple-200 ring-offset-2">
              <img src={babyData.avatar} alt={babyData.name} className="rounded-full" />
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gradient-secondary">
                {greeting}
              </h1>
              <p className="text-slate-600 mt-1">
                {babyData.name} • Day {babyData.dayOfLife}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="hover-scale">
              <Bell className="w-6 h-6" />
            </Button>
            <Button variant="ghost" size="icon" className="hover-scale">
              <Settings className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-modern">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        
        {/* Feed Ring Card */}
        <Card className="bg-card-emerald hover-scale hover-glow">
          <CardHeader>
            <CardTitle className="text-gradient-primary">Today's Feeding</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="relative w-28 h-28 mx-auto">
                  <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="feedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#06D6A0" />
                      </linearGradient>
                    </defs>
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#E5E7EB"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="url(#feedGradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${babyData.feedProgress * 2.51} 251`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      {babyData.feedProgress}%
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">
                  Last feed: {babyData.lastFeed}
                </p>
              </div>
              <Button 
                variant="default"
                size="lg"
                className="ml-4"
                aria-label="Log feeding"
              >
                <Baby className="w-5 h-5 mr-2" />
                Log Feed
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sleep Tracker Card */}
        <Card className="bg-card-indigo hover-scale hover-glow">
          <CardHeader>
            <CardTitle className="text-gradient-secondary">Sleep Today</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {babyData.sleepHours}
                    </div>
                    <div className="text-sm font-medium text-indigo-600">hours</div>
                  </div>
                  <div className="flex-1">
                    <div className="grid grid-cols-12 gap-1 h-8">
                      {Array.from({ length: 24 }, (_, i) => (
                        <div
                          key={i}
                          className={`rounded-md ${
                            i < 6 || (i >= 13 && i < 15) || i >= 20
                              ? 'bg-gradient-to-r from-indigo-400 to-purple-400 shadow-sm'
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>12AM</span>
                      <span>12PM</span>
                      <span>12AM</span>
                    </div>
                  </div>
                </div>
              </div>
              <Button 
                variant="secondary"
                size="lg"
                className="ml-4"
                aria-label="Log sleep"
              >
                <Moon className="w-5 h-5 mr-2" />
                Log Sleep
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Diaper Count Card */}
        <Card className="bg-card-amber hover-scale hover-glow">
          <CardHeader>
            <CardTitle className="text-gradient-accent">Diaper Changes</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    {babyData.diaperCount}
                  </div>
                  <div className="text-sm font-medium text-amber-600">today</div>
                </div>
                <div className="flex space-x-3">
                  <div className="flex flex-col items-center p-3 bg-blue-100 rounded-2xl">
                    <Droplets className="w-8 h-8 text-blue-600 mb-2" />
                    <span className="text-lg font-bold text-blue-600">4</span>
                    <span className="text-xs text-blue-500">wet</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-amber-100 rounded-2xl">
                    <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mb-2 shadow-lg"></div>
                    <span className="text-lg font-bold text-amber-600">2</span>
                    <span className="text-xs text-amber-500">dirty</span>
                  </div>
                </div>
              </div>
              <Button 
                variant="accent"
                size="lg"
                className="ml-4"
                aria-label="Log diaper change"
              >
                <Zap className="w-5 h-5 mr-2" />
                Log Diaper
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Milestone Spotlight Card */}
        <Card className="bg-card-pink hover-scale hover-glow lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">Milestone Spotlight</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex space-x-6">
              <div className="relative">
                <img 
                  src={babyData.milestone.image} 
                  alt={babyData.milestone.title}
                  className="w-24 h-24 rounded-3xl object-cover shadow-lg ring-4 ring-pink-200"
                />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm">✨</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  {babyData.milestone.title}
                </h3>
                <p className="text-base text-pink-700 mt-2 leading-relaxed">
                  {babyData.milestone.description}
                </p>
                <Button 
                  variant="pink"
                  className="mt-4"
                  aria-label="Capture moment"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Capture Moment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Visit Card */}
        <Card className="bg-card-blue hover-scale hover-glow">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Next Visit</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-2xl">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    {babyData.nextVisit.date} at {babyData.nextVisit.time}
                  </div>
                  <div className="text-base text-blue-700 font-medium">
                    {babyData.nextVisit.doctor}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl px-4 py-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Pediatric Clinic</span>
                </div>
                <Button 
                  variant="blue"
                  size="sm"
                  aria-label="Add questions for visit"
                >
                  Add Questions
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant={index === 0 ? "default" : index === 1 ? "secondary" : index === 2 ? "accent" : "pink"}
              size="lg"
              className="h-16 flex items-center justify-center space-x-3 hover-scale"
              aria-label={action.label}
            >
              <action.icon className="w-6 h-6" />
              <span className="text-base font-semibold">{action.label}</span>
            </Button>
          ))}
        </div>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8">
        <div className="relative">
          {/* FAB Actions */}
          {fabOpen && (
            <div className="absolute bottom-16 right-0">
              {fabActions.map((action, index) => (
              <div
                key={index}
                className={`absolute transition-all duration-300 ${action.position}`}
                style={{
                  transitionDelay: `${index * 50}ms`
                }}
              >
                <Button
                  size="icon"
                  className={`w-14 h-14 rounded-full ${action.color} hover:scale-110 transition-all duration-300 shadow-xl hover:shadow-2xl`}
                  aria-label={action.label}
                >
                  <action.icon className="w-6 h-6 text-white" />
                </Button>
              </div>
              ))}
            </div>
          )}
          
          {/* Main FAB */}
          <Button
            size="icon"
            className={`w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-xl hover:shadow-2xl transition-all duration-300 ${
              fabOpen ? 'rotate-45' : ''
            }`}
            onClick={() => setFabOpen(!fabOpen)}
            aria-label="Quick actions menu"
          >
            <Plus className="w-7 h-7 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Toddler Stage Dashboard (Section 3.3A from blueprint)
function ToddlerDashboard({ greeting, pendingTasks, familyStats, children, handlers, router }: any) {
  // Mock toddler data - would come from database in production
  const toddlerData = {
    age: children[0] ? formatChildAge(children[0].dateOfBirth || new Date()) : '2 years',
    pottyProgress: { successful: 8, accidents: 2, goal: 10 },
    tantrumCount: 2,
    lastTantrum: '3 hours ago',
    napTime: { duration: '2h 15m', quality: 'Great' },
    nextRoutine: {
      activity: 'Snack Time',
      time: '3:30 PM',
      icon: '🍎'
    },
    behaviorChart: [
      { time: '9:00 AM', behavior: 'good', activity: 'Breakfast' },
      { time: '11:30 AM', behavior: 'tantrum', activity: 'Cleanup' },
      { time: '1:00 PM', behavior: 'excellent', activity: 'Nap' },
      { time: '2:30 PM', behavior: 'good', activity: 'Play' }
    ]
  }

  return (
    <>
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-orange-500 via-yellow-500 to-pink-500 text-white sticky top-0 z-40 border-none">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{greeting}</h1>
              <p className="text-orange-100 mt-1">
                {children[0]?.user.name} • {toddlerData.age} • Exploring the world! 🌟
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="glass"
                size="sm"
                onClick={handlers.handleNotifications}
              >
                <Bell className="w-5 h-5" />
              </Button>
              <Button 
                variant="glass"
                size="sm"
                onClick={handlers.handleSettings}
              >
                <Settings className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12 relative">
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-br from-orange-300/30 to-yellow-300/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 left-10 w-48 h-48 bg-gradient-to-br from-pink-300/30 to-rose-300/30 rounded-full blur-3xl"></div>
          <div className="absolute top-60 left-1/2 w-32 h-32 bg-gradient-to-br from-amber-300/20 to-orange-300/20 rounded-full blur-2xl"></div>
        </div>
        
        <div className="space-y-8 relative z-10">
          {/* Potty Training Progress Card */}
          <Card variant="gradient" className="group overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2">
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div className="relative">
                    <div className="absolute -inset-6 bg-gradient-to-r from-orange-400/20 to-yellow-400/20 rounded-full blur-2xl"></div>
                    <Progress 
                      value={(toddlerData.pottyProgress.successful / toddlerData.pottyProgress.goal) * 100} 
                      size={120} 
                      color="rgb(249, 115, 22)" 
                      className="drop-shadow-xl relative z-10"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center bg-white/90 rounded-full w-20 h-20 flex flex-col items-center justify-center backdrop-blur-sm border border-orange-100 shadow-lg">
                        <div className="text-2xl font-bold text-orange-600">{toddlerData.pottyProgress.successful}</div>
                        <div className="text-sm text-orange-500">/{toddlerData.pottyProgress.goal}</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <CardTitle level={1} gradient className="text-3xl mb-2">
                      Potty Training 🚽
                    </CardTitle>
                    <p className="text-base-content/70 text-lg">Great progress today! Only {toddlerData.pottyProgress.accidents} accidents</p>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full animate-pulse"></div>
                      <span className="text-orange-600 font-semibold">Almost there!</span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="gradient"
                  size="lg" 
                  className="px-8 py-4 text-lg"
                  onClick={handlers.handleLogPottySuccess}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Log Success
                </Button>
              </div>
            </div>
          </Card>

          {/* Behavior Tracker Card */}
          <Card variant="interactive" className="group overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2">
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-pink-400/20 to-rose-400/20 rounded-full blur-xl"></div>
                    <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center shadow-xl relative z-10">
                      <Heart className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <div>
                    <CardTitle level={1} gradient className="text-3xl mb-2">
                      Behavior Today 😊
                    </CardTitle>
                    <p className="text-base-content/70 text-lg mb-3">Last tantrum: {toddlerData.lastTantrum} • <span className="text-pink-600 font-semibold">Mostly good day!</span></p>
                    {/* Beautiful behavior timeline */}
                    <div className="flex gap-3 mt-3">
                      {toddlerData.behaviorChart.map((entry, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                          <div className={`w-4 h-4 rounded-full transition-all duration-300 ${
                            entry.behavior === 'excellent' ? 'bg-gradient-to-t from-green-500 to-emerald-400 shadow-md' :
                            entry.behavior === 'good' ? 'bg-gradient-to-t from-blue-500 to-cyan-400 shadow-md' :
                            'bg-gradient-to-t from-red-500 to-orange-400 shadow-md'
                          }`} />
                          <span className="text-xs text-base-content/60">{entry.time.split(' ')[0]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <Button 
                  variant="gradient"
                  size="lg" 
                  className="px-8 py-4 text-lg"
                  onClick={handlers.handleCalmDownTimer}
                >
                  <Timer className="w-5 h-5 mr-2" />
                  Calm Down Timer
                </Button>
              </div>
            </div>
          </Card>

          {/* Next Routine Card */}
          <Card variant="glass" className="group overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2">
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-full blur-xl"></div>
                    <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-xl relative z-10 text-4xl">
                      {toddlerData.nextRoutine.icon}
                    </div>
                  </div>
                  <div>
                    <CardTitle level={1} gradient className="text-3xl mb-2">
                      Up Next: {toddlerData.nextRoutine.activity}
                    </CardTitle>
                    <p className="text-base-content/70 text-lg">Scheduled for {toddlerData.nextRoutine.time}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="w-3 h-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-pulse"></div>
                      <span className="text-amber-600 font-semibold">15 minutes away</span>
                    </div>
                  </div>
                </div>
                <CardActions>
                  <Button variant="outline" size="lg" className="border-amber-200 text-amber-700 hover:bg-amber-50">
                    Skip
                  </Button>
                  <Button variant="gradient" size="lg" className="px-8 py-4">
                    <Bell className="w-5 h-5 mr-2" />
                    Set Reminder
                  </Button>
                </CardActions>
              </div>
            </div>
          </Card>

          {/* Quick Actions for Toddlers */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: CheckCircle, label: 'Potty Success', color: 'from-orange-500 to-yellow-500' },
              { icon: Timer, label: 'Tantrum Timer', color: 'from-pink-500 to-red-500' },
              { icon: Activity, label: 'Play Ideas', color: 'from-purple-500 to-indigo-500' },
              { icon: Camera, label: 'Milestone Photo', color: 'from-green-500 to-emerald-500' }
            ].map((action, index) => (
              <Button
                key={index}
                variant="glass"
                className="h-24 flex flex-col gap-3"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-base-content/80 font-semibold">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}

// Early Childhood Stage Dashboard (Section 3.4A from blueprint)
function EarlyChildhoodDashboard({ greeting, pendingTasks, familyStats, children, handlers, router }: any) {
  // Mock early childhood data - would come from database in production
  const earlyChildhoodData = {
    age: children[0] ? formatChildAge(children[0].dateOfBirth || new Date()) : '5 years',
    choresToday: { completed: 4, total: 6 },
    stars: { earned: 12, weekly: 8, total: 247 },
    schoolReadiness: { level: 85, nextMilestone: 'Writing name' },
    learningActivity: {
      current: 'Letter Recognition Game',
      progress: 75,
      timeLeft: '8 minutes'
    },
    upcomingEvents: [
      { event: 'Library Story Time', time: '10:00 AM', date: 'Tomorrow' },
      { event: 'Playground Playdate', time: '3:00 PM', date: 'Friday' }
    ]
  }

  return (
    <>
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 text-white sticky top-0 z-40 border-none">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{greeting}</h1>
              <p className="text-blue-100 mt-1">
                {children[0]?.user.name} • {earlyChildhoodData.age} • Ready to learn! 📚
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="glass"
                size="sm"
                onClick={handlers.handleNotifications}
              >
                <Bell className="w-5 h-5" />
              </Button>
              <Button 
                variant="glass"
                size="sm"
                onClick={handlers.handleSettings}
              >
                <Settings className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12 relative">
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-br from-blue-300/30 to-purple-300/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 left-10 w-48 h-48 bg-gradient-to-br from-indigo-300/30 to-violet-300/30 rounded-full blur-3xl"></div>
          <div className="absolute top-60 left-1/2 w-32 h-32 bg-gradient-to-br from-cyan-300/20 to-blue-300/20 rounded-full blur-2xl"></div>
        </div>
        
        <div className="space-y-8 relative z-10">
          {/* Chore Progress Card */}
          <Card variant="gradient" className="group overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2">
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div className="relative">
                    <div className="absolute -inset-6 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-2xl"></div>
                    <Progress 
                      value={(earlyChildhoodData.choresToday.completed / earlyChildhoodData.choresToday.total) * 100} 
                      size={120} 
                      color="rgb(59, 130, 246)" 
                      className="drop-shadow-xl relative z-10"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center bg-white/90 rounded-full w-20 h-20 flex flex-col items-center justify-center backdrop-blur-sm border border-blue-100 shadow-lg">
                        <div className="text-2xl font-bold text-blue-600">{earlyChildhoodData.choresToday.completed}</div>
                        <div className="text-sm text-blue-500">/{earlyChildhoodData.choresToday.total}</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <CardTitle level={1} gradient className="text-3xl mb-2">
                      Chores Today ✨
                    </CardTitle>
                    <p className="text-base-content/70 text-lg">Great job! Almost finished for today</p>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"></div>
                      <span className="text-blue-600 font-semibold">2 more to go!</span>
                    </div>
                  </div>
                </div>
                <Button variant="gradient" size="lg" className="px-8 py-4 text-lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Chore
                </Button>
              </div>
            </div>
          </Card>

          {/* Star Rewards Card */}
          <Card variant="interactive" className="group overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2">
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400/20 to-amber-400/20 rounded-full blur-xl"></div>
                    <div className="w-24 h-24 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-full flex items-center justify-center shadow-xl relative z-10">
                      <Star className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <div>
                    <CardTitle level={1} gradient className="text-3xl mb-2">
                      Star Collection ⭐
                    </CardTitle>
                    <p className="text-base-content/70 text-lg mb-3">Earned {earlyChildhoodData.stars.earned} stars today • <span className="text-yellow-600 font-semibold">{earlyChildhoodData.stars.total} total</span></p>
                    {/* Beautiful star visualization */}
                    <div className="flex gap-2 mt-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-6 h-6 transition-all duration-300 ${
                            i < earlyChildhoodData.stars.weekly / 2 
                              ? 'fill-yellow-500 text-yellow-500 drop-shadow-md' 
                              : 'text-gray-300'
                          }`} 
                        />
                      ))}
                      <span className="text-yellow-600 font-semibold ml-2">This week</span>
                    </div>
                  </div>
                </div>
                <Button variant="gradient" size="lg" className="px-8 py-4 text-lg">
                  <Trophy className="w-5 h-5 mr-2" />
                  Reward Store
                </Button>
              </div>
            </div>
          </Card>

          {/* Learning Activity Card */}
          <Card variant="glass" className="group overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2">
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-purple-400/20 to-violet-400/20 rounded-full blur-xl"></div>
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-violet-500 rounded-full flex items-center justify-center shadow-xl relative z-10">
                      <BookOpen className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <div>
                    <CardTitle level={1} gradient className="text-3xl mb-2">
                      Learning Time 🎯
                    </CardTitle>
                    <p className="text-base-content/70 text-lg">Currently playing: {earlyChildhoodData.learningActivity.current}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-3 max-w-40">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-violet-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${earlyChildhoodData.learningActivity.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-purple-600 font-semibold">{earlyChildhoodData.learningActivity.timeLeft} left</span>
                    </div>
                  </div>
                </div>
                <CardActions>
                  <Button variant="outline" size="lg" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                    Pause
                  </Button>
                  <Button variant="gradient" size="lg" className="px-8 py-4">
                    <Sparkles className="w-5 h-5 mr-2" />
                    New Game
                  </Button>
                </CardActions>
              </div>
            </div>
          </Card>

          {/* Quick Actions for Early Childhood */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: CheckCircle, label: 'Mark Chore Done', color: 'from-blue-500 to-indigo-500' },
              { icon: Star, label: 'Give Star', color: 'from-yellow-500 to-amber-500' },
              { icon: BookOpen, label: 'Learning Games', color: 'from-purple-500 to-violet-500' },
              { icon: Calendar, label: 'Family Calendar', color: 'from-green-500 to-emerald-500' }
            ].map((action, index) => (
              <Button
                key={index}
                variant="glass"
                className="h-24 flex flex-col gap-3"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-base-content/80 font-semibold">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}

// School Age Stage Dashboard (Section 3.5A from blueprint)
function SchoolAgeDashboard({ greeting, pendingTasks, familyStats, children, handlers, router }: any) {
  // Mock school age data - would come from database in production
  const schoolAgeData = {
    age: children[0] ? formatChildAge(children[0].dateOfBirth || new Date()) : '9 years',
    homework: { completed: 3, total: 5, nextDue: 'Math worksheet due tomorrow' },
    allowance: { earned: 15, spent: 8, balance: 32 },
    screenTime: { used: 85, limit: 120, remaining: 35 },
    achievements: {
      streakDays: 7,
      weeklyGoals: 4,
      totalGoals: 5
    },
    upcomingEvents: [
      { event: 'Soccer Practice', time: '4:00 PM', date: 'Today' },
      { event: 'Math Test', time: '9:00 AM', date: 'Wednesday' }
    ]
  }

  return (
    <>
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-green-500 via-teal-500 to-blue-500 text-white sticky top-0 z-40 border-none">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{greeting}</h1>
              <p className="text-green-100 mt-1">
                {children[0]?.user.name} • {schoolAgeData.age} • School champion! 🎓
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="glass"
                size="sm"
                onClick={handlers.handleNotifications}
              >
                <Bell className="w-5 h-5" />
              </Button>
              <Button 
                variant="glass"
                size="sm"
                onClick={handlers.handleSettings}
              >
                <Settings className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12 relative">
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-br from-green-300/30 to-teal-300/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 left-10 w-48 h-48 bg-gradient-to-br from-blue-300/30 to-cyan-300/30 rounded-full blur-3xl"></div>
          <div className="absolute top-60 left-1/2 w-32 h-32 bg-gradient-to-br from-emerald-300/20 to-green-300/20 rounded-full blur-2xl"></div>
        </div>
        
        <div className="space-y-8 relative z-10">
          {/* Homework Tracker Card */}
          <Card variant="gradient" className="group overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2">
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div className="relative">
                    <div className="absolute -inset-6 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-full blur-2xl"></div>
                    <Progress 
                      value={(schoolAgeData.homework.completed / schoolAgeData.homework.total) * 100} 
                      size={120} 
                      color="rgb(34, 197, 94)" 
                      className="drop-shadow-xl relative z-10"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center bg-white/90 rounded-full w-20 h-20 flex flex-col items-center justify-center backdrop-blur-sm border border-green-100 shadow-lg">
                        <div className="text-2xl font-bold text-green-600">{schoolAgeData.homework.completed}</div>
                        <div className="text-sm text-green-500">/{schoolAgeData.homework.total}</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <CardTitle level={1} gradient className="text-3xl mb-2">
                      Homework Progress 📚
                    </CardTitle>
                    <p className="text-base-content/70 text-lg">Almost done! {schoolAgeData.homework.total - schoolAgeData.homework.completed} assignments left</p>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-green-600 font-semibold">Next: {schoolAgeData.homework.nextDue}</span>
                    </div>
                  </div>
                </div>
                <Button variant="gradient" size="lg" className="px-8 py-4 text-lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Assignment
                </Button>
              </div>
            </div>
          </Card>

          {/* Mini Wallet Card */}
          <Card variant="interactive" className="group overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2">
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-teal-400/20 to-cyan-400/20 rounded-full blur-xl"></div>
                    <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center shadow-xl relative z-10">
                      <div className="text-white font-bold text-2xl">$</div>
                    </div>
                  </div>
                  <div>
                    <CardTitle level={1} gradient className="text-3xl mb-2">
                      Mini Wallet 💰
                    </CardTitle>
                    <p className="text-base-content/70 text-lg mb-3">Balance: <span className="font-bold text-teal-600">${schoolAgeData.allowance.balance}</span> • Earned ${schoolAgeData.allowance.earned} this week</p>
                    {/* Beautiful allowance visualization */}
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex gap-2">
                        <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                          +${schoolAgeData.allowance.earned} earned
                        </div>
                        <div className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                          -${schoolAgeData.allowance.spent} spent
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <Button variant="gradient" size="lg" className="px-8 py-4 text-lg">
                  <Award className="w-5 h-5 mr-2" />
                  Spend Coins
                </Button>
              </div>
            </div>
          </Card>

          {/* Screen Time Manager Card */}
          <Card variant="glass" className="group overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2">
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-xl"></div>
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-xl relative z-10">
                      <Timer className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <div>
                    <CardTitle level={1} gradient className="text-3xl mb-2">
                      Screen Time ⏰
                    </CardTitle>
                    <p className="text-base-content/70 text-lg">Used {schoolAgeData.screenTime.used} min of {schoolAgeData.screenTime.limit} min today</p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-3 max-w-48">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${(schoolAgeData.screenTime.used / schoolAgeData.screenTime.limit) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-blue-600 font-semibold">{schoolAgeData.screenTime.remaining} min left</span>
                    </div>
                  </div>
                </div>
                <CardActions>
                  <Button variant="outline" size="lg" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                    Pause
                  </Button>
                  <Button variant="gradient" size="lg" className="px-8 py-4">
                    <Zap className="w-5 h-5 mr-2" />
                    Bonus Time
                  </Button>
                </CardActions>
              </div>
            </div>
          </Card>

          {/* Quick Actions for School Age */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: CheckCircle, label: 'Mark Done', color: 'from-green-500 to-emerald-500' },
              { icon: Target, label: 'Set Goal', color: 'from-teal-500 to-cyan-500' },
              { icon: Timer, label: 'Study Timer', color: 'from-blue-500 to-indigo-500' },
              { icon: Trophy, label: 'Achievements', color: 'from-purple-500 to-violet-500' }
            ].map((action, index) => (
              <Button
                key={index}
                variant="glass"
                className="h-24 flex flex-col gap-3"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-base-content/80 font-semibold">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}

// Adolescence Stage Dashboard (Section 3.6A from blueprint)
function AdolescenceDashboard({ greeting, pendingTasks, familyStats, children, handlers, router }: any) {
  // Mock adolescence data - would come from database in production
  const adolescenceData = {
    age: children[0] ? formatChildAge(children[0].dateOfBirth || new Date()) : '16 years',
    wellbeing: { mood: 7, stress: 4, sleep: 8 },
    goals: { completed: 3, active: 2, total: 8 },
    independence: { level: 78, recentAchievements: ['Cooked dinner', 'Managed budget'] },
    privacy: { level: 'High', dataSharing: 'Minimal' },
    upcomingEvents: [
      { event: 'College Fair', time: '2:00 PM', date: 'Saturday' },
      { event: 'Driver\'s Ed Test', time: '10:00 AM', date: 'Next Week' }
    ]
  }

  return (
    <>
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-slate-600 via-purple-600 to-indigo-600 text-white sticky top-0 z-40 border-none">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{greeting}</h1>
              <p className="text-slate-100 mt-1">
                {children[0]?.user.name} • {adolescenceData.age} • Growing into independence 🌟
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="glass"
                size="sm"
                onClick={handlers.handleNotifications}
              >
                <Bell className="w-5 h-5" />
              </Button>
              <Button 
                variant="glass"
                size="sm"
                onClick={handlers.handleSettings}
              >
                <Settings className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12 relative">
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-br from-slate-300/20 to-purple-300/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 left-10 w-48 h-48 bg-gradient-to-br from-indigo-300/20 to-violet-300/20 rounded-full blur-3xl"></div>
          <div className="absolute top-60 left-1/2 w-32 h-32 bg-gradient-to-br from-gray-300/15 to-slate-300/15 rounded-full blur-2xl"></div>
        </div>
        
        <div className="space-y-8 relative z-10">
          {/* Wellbeing Center Card */}
          <Card variant="gradient" className="group overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2">
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div className="relative">
                    <div className="absolute -inset-6 bg-gradient-to-r from-slate-400/20 to-purple-400/20 rounded-full blur-2xl"></div>
                    <Progress 
                      value={adolescenceData.wellbeing.mood * 10} 
                      size={120} 
                      color="rgb(100, 116, 139)" 
                      className="drop-shadow-xl relative z-10"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center bg-white/90 rounded-full w-20 h-20 flex flex-col items-center justify-center backdrop-blur-sm border border-slate-100 shadow-lg">
                        <div className="text-2xl font-bold text-slate-600">{adolescenceData.wellbeing.mood}</div>
                        <div className="text-sm text-slate-500">/10</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <CardTitle level={1} gradient className="text-3xl mb-2">
                      Wellbeing Check 💆‍♂️
                    </CardTitle>
                    <p className="text-base-content/70 text-lg">Mood: {adolescenceData.wellbeing.mood}/10 • Sleep: {adolescenceData.wellbeing.sleep}h last night</p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex gap-2">
                        <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                          Good Sleep
                        </div>
                        <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                          Balanced Mood
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <Button variant="gradient" size="lg" className="px-8 py-4 text-lg">
                  <Heart className="w-5 h-5 mr-2" />
                  Check In
                </Button>
              </div>
            </div>
          </Card>

          {/* Life Goals & Independence Card */}
          <Card variant="interactive" className="group overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2">
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-purple-400/20 to-indigo-400/20 rounded-full blur-xl"></div>
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center shadow-xl relative z-10">
                      <Target className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <div>
                    <CardTitle level={1} gradient className="text-3xl mb-2">
                      Life Skills Progress 🎯
                    </CardTitle>
                    <p className="text-base-content/70 text-lg mb-3">Independence level: <span className="font-bold text-purple-600">{adolescenceData.independence.level}%</span> • {adolescenceData.goals.completed} goals completed</p>
                    {/* Recent achievements */}
                    <div className="flex gap-2 mt-3">
                      {adolescenceData.independence.recentAchievements.map((achievement, i) => (
                        <div key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                          ✨ {achievement}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <Button variant="gradient" size="lg" className="px-8 py-4 text-lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Set Goal
                </Button>
              </div>
            </div>
          </Card>

          {/* Privacy & Trust Dashboard Card */}
          <Card variant="glass" className="group overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2">
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-indigo-400/20 to-violet-400/20 rounded-full blur-xl"></div>
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center shadow-xl relative z-10">
                      <Users className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <div>
                    <CardTitle level={1} gradient className="text-3xl mb-2">
                      Privacy & Connection 🔒
                    </CardTitle>
                    <p className="text-base-content/70 text-lg">Privacy level: <span className="font-semibold text-indigo-600">{adolescenceData.privacy.level}</span> • Data sharing: {adolescenceData.privacy.dataSharing}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full animate-pulse"></div>
                      <span className="text-indigo-600 font-semibold">Healthy boundaries maintained</span>
                    </div>
                  </div>
                </div>
                <CardActions>
                  <Button variant="outline" size="lg" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                    Settings
                  </Button>
                  <Button variant="gradient" size="lg" className="px-8 py-4">
                    <Calendar className="w-5 h-5 mr-2" />
                    Plan Together
                  </Button>
                </CardActions>
              </div>
            </div>
          </Card>

          {/* Quick Actions for Adolescence */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Heart, label: 'Mood Check', color: 'from-slate-500 to-purple-500' },
              { icon: Target, label: 'Life Goals', color: 'from-purple-500 to-indigo-500' },
              { icon: Calendar, label: 'Future Plans', color: 'from-indigo-500 to-violet-500' },
              { icon: Users, label: 'Privacy Settings', color: 'from-violet-500 to-purple-500' }
            ].map((action, index) => (
              <Button
                key={index}
                variant="glass"
                className="h-24 flex flex-col gap-3"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-base-content/80 font-semibold">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}