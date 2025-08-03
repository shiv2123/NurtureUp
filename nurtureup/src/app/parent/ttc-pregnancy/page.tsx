'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Plus, Heart, Calendar, BookOpen, User, Settings, Droplets, Baby, Camera, FileText, Home } from 'lucide-react'
import { useHealthTracking } from '@/hooks/useHealthTracking'

/**
 * TTC & Pregnancy Parent Interface (Blueprint 3.1)
 * 
 * Navigation: Home, Tracker, Library, Profile
 * Features: Cycle tracking, Fetal growth, Vitals monitoring, Partner tips, Checklist
 */
export default function TTCPregnancyPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('home')
  const [childId, setChildId] = useState<string | null>(null)
  const [gestationWeek] = useState(18)
  const [gestationDay] = useState(3)
  const [hydrationProgress, setHydrationProgress] = useState(0)
  const [showChecklist, setShowChecklist] = useState(false)
  const [showVitalsModal, setShowVitalsModal] = useState(false)
  const [showSymptomModal, setShowSymptomModal] = useState(false)
  const [vitalType, setVitalType] = useState<'blood_pressure' | 'weight' | 'temperature'>('blood_pressure')
  const [vitalValue, setVitalValue] = useState('')
  const [symptomType, setSymptomType] = useState('')
  const [symptomNotes, setSymptomNotes] = useState('')

  // Real data hook
  const { data: healthData, isLoading: healthLoading, createHealthRecord } = useHealthTracking(childId, 'pregnancy')

  // Get child ID from family (expectant mother as 'child' for pregnancy tracking)
  useEffect(() => {
    const fetchChild = async () => {
      if (session?.user?.familyId) {
        try {
          const response = await fetch('/api/children')
          if (response.ok) {
            const children = await response.json()
            if (children.length > 0) {
              // For pregnancy tracking, use the first child or create a maternal profile
              setChildId(children[0].id)
            }
          }
        } catch (error) {
          console.error('Failed to fetch children:', error)
        }
      }
    }
    
    fetchChild()
  }, [session])

  // Calculate hydration from health records
  useEffect(() => {
    if (healthData?.healthRecords) {
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      
      const todayHydration = healthData.healthRecords.filter(record => 
        record.type === 'hydration' && 
        new Date(record.recordDate) >= todayStart
      )
      
      const totalGlasses = todayHydration.reduce((sum, record) => sum + (record.value || 0), 0)
      const progress = Math.min((totalGlasses / 8) * 100, 100) // 8 glasses daily goal
      setHydrationProgress(progress)
    }
  }, [healthData])

  const tabs = [
    { id: 'home', label: 'Home', icon: Heart },
    { id: 'tracker', label: 'Tracker', icon: Calendar },
    { id: 'library', label: 'Library', icon: BookOpen },
    { id: 'profile', label: 'Profile', icon: User }
  ]

  const quickActions = [
    { 
      id: 'symptom', 
      label: 'Log Symptom', 
      icon: FileText, 
      color: 'from-emerald-400 to-teal-400',
      onClick: () => setShowSymptomModal(true)
    },
    { id: 'photo', label: 'Add Photo', icon: Camera, color: 'from-blue-400 to-cyan-400' },
    { 
      id: 'checklist', 
      label: 'Checklist', 
      onClick: () => setShowChecklist(true), 
      color: 'from-purple-400 to-pink-400' 
    },
    { 
      id: 'vitals', 
      label: 'Log Vitals', 
      icon: Heart, 
      color: 'from-rose-400 to-red-400',
      onClick: () => setShowVitalsModal(true)
    }
  ]

  // Action handlers
  const handleLogGlass = async () => {
    if (!childId) return
    
    try {
      await createHealthRecord({
        childId,
        type: 'hydration',
        value: 1,
        unit: 'glasses',
        notes: 'Water glass logged'
      })
    } catch (error) {
      console.error('Failed to log hydration:', error)
    }
  }

  const handleVitalsSubmit = async () => {
    if (!vitalValue.trim() || !childId) return
    
    try {
      await createHealthRecord({
        childId,
        type: vitalType,
        value: parseFloat(vitalValue),
        unit: vitalType === 'weight' ? 'lbs' : vitalType === 'temperature' ? '°F' : 'mmHg',
        notes: `${vitalType} measurement`
      })
      
      setVitalValue('')
      setShowVitalsModal(false)
    } catch (error) {
      console.error('Failed to log vitals:', error)
    }
  }

  const handleSymptomSubmit = async () => {
    if (!symptomType.trim() || !childId) return
    
    try {
      await createHealthRecord({
        childId,
        type: 'symptom',
        notes: `${symptomType}: ${symptomNotes}`
      })
      
      setSymptomType('')
      setSymptomNotes('')
      setShowSymptomModal(false)
    } catch (error) {
      console.error('Failed to log symptom:', error)
    }
  }

  const checklistItems = [
    { section: 'First Trimester', items: ['Schedule initial appointment', 'Start prenatal vitamins', 'Avoid alcohol/smoking'], progress: 100 },
    { section: 'Second Trimester', items: ['Anatomy scan', 'Register for classes', 'Start nursery planning'], progress: 67 },
    { section: 'Third Trimester', items: ['Hospital bag', 'Car seat installation', 'Birth plan'], progress: 33 },
    { section: 'Registry', items: ['Crib and mattress', 'Stroller', 'Baby clothes', 'Feeding supplies'], progress: 80 }
  ]

  const renderHomeTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-r from-emerald-400 to-teal-400 flex items-center justify-center mx-auto mb-4 shadow-xl">
          <span className="text-3xl">👶</span>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
          Week {gestationWeek} + {gestationDay}
        </h2>
        <p className="text-lg text-slate-600 font-medium">Your baby is the size of a sweet potato! 🍠</p>
      </div>

      {/* Cards */}
      <div className="grid gap-6">
        {/* Fetal Growth Card */}
        <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="text-6xl">🍠</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-800 mb-2">Fetal Growth</h3>
                <p className="text-slate-600 mb-3">Your baby is about 5.6 inches long and developing rapidly!</p>
                <Button variant="outline" size="sm">View Details</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Appointment */}
        <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Next Appointment</h3>
                <p className="text-slate-600 mb-2">
                  {healthData?.upcomingAppointments?.length > 0 ? 
                    `${healthData.upcomingAppointments[0].title} - ${healthData.upcomingAppointments[0].provider}` :
                    'Dr. Smith - Anatomy Scan'
                  }
                </p>
                <p className="text-sm text-slate-500">
                  {healthData?.upcomingAppointments?.length > 0 ? 
                    new Date(healthData.upcomingAppointments[0].nextAppointment!).toLocaleDateString() :
                    'Tomorrow, 2:00 PM'
                  }
                </p>
              </div>
              <div className="text-right">
                <Button variant="outline" size="sm" className="mb-2">Add Questions</Button>
                <br />
                <Button variant="ghost" size="sm">Navigate</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hydration Ring */}
        <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="35" stroke="#E5E7EB" strokeWidth="8" fill="none" />
                  <circle
                    cx="50" cy="50" r="35"
                    stroke="#06B6D4" strokeWidth="8" fill="none"
                    strokeDasharray={`${hydrationProgress * 2.2} 220`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Droplets className="w-6 h-6 text-cyan-500" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-800 mb-2">Hydration</h3>
                <p className="text-slate-600 mb-3">{hydrationProgress}% of daily goal</p>
                <Button 
                  size="sm" 
                  className="bg-cyan-500 hover:bg-cyan-600"
                  onClick={handleLogGlass}
                  disabled={healthLoading}
                >
                  Log Glass
                </Button>
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
            {action.icon && <action.icon className="w-6 h-6" />}
            <span className="text-sm font-bold">{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <div className="backdrop-blur-lg bg-white/70 border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="w-10 h-10 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 flex items-center justify-center hover:scale-105 transition-transform">
                <Home className="w-5 h-5 text-white" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  TTC & Pregnancy
                </h1>
                <p className="text-sm text-slate-600">Week {gestationWeek} + {gestationDay} • Planning to Birth</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-medium text-slate-700">Baby on Board</span>
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
                      ? 'bg-emerald-500 text-white shadow-lg'
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
        {activeTab === 'tracker' && (
          <div className="space-y-6">
            <div className="text-center">
              <Calendar className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Pregnancy Tracker</h3>
              <p className="text-slate-600">Track your vitals, symptoms, and baby's development</p>
            </div>

            {/* Recent Health Records */}
            <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Health Records</span>
                  <Button size="sm" onClick={() => setShowVitalsModal(true)}>Add Record</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {healthData?.healthRecords?.slice(0, 5).map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <div className="font-medium capitalize">{record.type}</div>
                        <div className="text-sm text-slate-600">
                          {new Date(record.recordDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {record.value ? `${record.value} ${record.unit || ''}` : 'Logged'}
                        </div>
                        {record.notes && <div className="text-sm text-slate-600">{record.notes}</div>}
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-slate-500">
                      <Heart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No health records yet</p>
                      <p className="text-sm">Start tracking your pregnancy journey!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        {activeTab === 'library' && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Pregnancy Library</h3>
            <p className="text-slate-600">Curated articles, partner tips, and expert guidance</p>
          </div>
        )}
        {activeTab === 'profile' && (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Profile & Settings</h3>
            <p className="text-slate-600">Manage caregivers, medical info, and preferences</p>
          </div>
        )}

        {/* Floating Action Button */}
        <div className="fixed bottom-8 right-8 z-40">
          <Button
            className="w-16 h-16 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-xl hover:scale-110 transition-all duration-300"
          >
            <Plus className="w-8 h-8" />
          </Button>
        </div>

        {/* Checklist Overlay */}
        {showChecklist && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-white m-4 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-emerald-700">Pregnancy Checklist</CardTitle>
                  <Button variant="ghost" onClick={() => setShowChecklist(false)}>✕</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {checklistItems.map((section, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-slate-800">{section.section}</h4>
                        <span className="text-sm bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                          {section.progress}% done
                        </span>
                      </div>
                      <Progress value={section.progress} className="mb-3" />
                      <div className="space-y-2">
                        {section.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-center gap-2">
                            <input type="checkbox" defaultChecked={itemIndex < section.items.length * (section.progress / 100)} />
                            <span className="text-sm text-slate-600">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Vitals Modal */}
        {showVitalsModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-white m-4 max-w-md w-full shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-emerald-700">Log Vitals</CardTitle>
                  <Button variant="ghost" onClick={() => setShowVitalsModal(false)}>✕</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Vital Type</label>
                    <div className="grid grid-cols-1 gap-2">
                      <Button 
                        variant={vitalType === 'blood_pressure' ? 'default' : 'outline'}
                        onClick={() => setVitalType('blood_pressure')}
                        className={vitalType === 'blood_pressure' ? 'bg-emerald-500 text-white' : ''}
                      >
                        Blood Pressure
                      </Button>
                      <Button 
                        variant={vitalType === 'weight' ? 'default' : 'outline'}
                        onClick={() => setVitalType('weight')}
                        className={vitalType === 'weight' ? 'bg-emerald-500 text-white' : ''}
                      >
                        Weight
                      </Button>
                      <Button 
                        variant={vitalType === 'temperature' ? 'default' : 'outline'}
                        onClick={() => setVitalType('temperature')}
                        className={vitalType === 'temperature' ? 'bg-emerald-500 text-white' : ''}
                      >
                        Temperature
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Value ({vitalType === 'weight' ? 'lbs' : vitalType === 'temperature' ? '°F' : 'mmHg'})
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={vitalValue}
                      onChange={(e) => setVitalValue(e.target.value)}
                      placeholder={vitalType === 'weight' ? 'e.g., 150' : vitalType === 'temperature' ? 'e.g., 98.6' : 'e.g., 120'}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleVitalsSubmit}
                      disabled={!vitalValue.trim() || healthLoading}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                      Save Vital
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowVitalsModal(false)
                        setVitalValue('')
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

        {/* Symptom Modal */}
        {showSymptomModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-white m-4 max-w-md w-full shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-emerald-700">Log Symptom</CardTitle>
                  <Button variant="ghost" onClick={() => setShowSymptomModal(false)}>✕</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Symptom</label>
                    <input
                      type="text"
                      value={symptomType}
                      onChange={(e) => setSymptomType(e.target.value)}
                      placeholder="e.g., Morning sickness, Fatigue, Cramps"
                      className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                    <textarea
                      value={symptomNotes}
                      onChange={(e) => setSymptomNotes(e.target.value)}
                      placeholder="Additional details about the symptom..."
                      rows={3}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSymptomSubmit}
                      disabled={!symptomType.trim() || healthLoading}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                      Save Symptom
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowSymptomModal(false)
                        setSymptomType('')
                        setSymptomNotes('')
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
      </div>
    </div>
  )
}