'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Camera, Edit3, Trash2, AlertTriangle, GraduationCap, Music, Zap, BookOpen } from 'lucide-react'
import { useHomework } from '@/hooks/useHomework'

/**
 * School Age School Center (Blueprint 6.4.2)
 * 
 * Per blueprint:
 * - Top Tabs: Homework, Activities, Grades
 * - Homework Tab: Card list grouped by due date; subject stripe colour-coded. Swipe right ⇒ mark complete; left ⇒ edit/delete. "Scan Diary" button top-right opens camera with OCR hint overlay
 * - Activities Tab: Calendar list; coloured pill per activity type (sport, music). Conflict alert banner if overlap detected; tap opens edit
 * - Grades Tab (optional enable): Bar chart of recent test scores; tap bar ⇒ detail modal (subject, notes)
 * - Persistent Button adapts per tab (Add HW / Activity / Grade)
 */
export default function SchoolAgeSchoolPage() {
  const searchParams = useSearchParams()
  const initialTab = (searchParams?.get('tab') as 'homework' | 'activities' | 'grades') || 'homework'
  const highlightId = searchParams?.get('highlight')
  const shouldAdd = searchParams?.get('add') === 'true'

  const [activeTab, setActiveTab] = useState<'homework' | 'activities' | 'grades'>(initialTab)
  const [showAddModal, setShowAddModal] = useState(shouldAdd)
  const [showGradeDetail, setShowGradeDetail] = useState<any>(null)
  const [conflicts, setConflicts] = useState([])
  const [childId, setChildId] = useState<string | null>(null)

  // Get child ID from session or URL params
  useEffect(() => {
    // TODO: Get actual child ID from context or URL
    setChildId('child-1') // Placeholder
  }, [])

  // Fetch real homework data
  const { 
    data: homeworkData, 
    createHomework, 
    completeHomework, 
    deleteHomework, 
    isLoading: homeworkLoading 
  } = useHomework(childId)

  // Transform homework data for UI
  const homework = homeworkData?.homework?.map(hw => {
    const metadata = hw.metadata ? JSON.parse(hw.metadata) : {}
    const dueDate = hw.dueDate ? new Date(hw.dueDate) : null
    const isUrgent = dueDate ? dueDate.getTime() - Date.now() < 24 * 60 * 60 * 1000 : false
    
    return {
      id: hw.id,
      title: hw.title,
      subject: metadata.subject || 'Homework',
      due: dueDate || new Date(),
      completed: hw.completions.length > 0,
      color: getSubjectColor(metadata.subject || 'homework'),
      urgent: isUrgent,
      rawData: hw
    }
  }) || []

  function getSubjectColor(subject: string): string {
    const subjectLower = subject.toLowerCase()
    if (subjectLower.includes('math')) return 'border-l-blue-500'
    if (subjectLower.includes('science')) return 'border-l-green-500'
    if (subjectLower.includes('english')) return 'border-l-purple-500'
    if (subjectLower.includes('history')) return 'border-l-orange-500'
    if (subjectLower.includes('art')) return 'border-l-pink-500'
    return 'border-l-gray-500'
  }

  const [activities, setActivities] = useState([
    { 
      id: 1, 
      name: 'Soccer Practice', 
      type: 'sport', 
      date: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      duration: 90,
      location: 'School Field',
      color: 'bg-green-500' 
    },
    { 
      id: 2, 
      name: 'Piano Lesson', 
      type: 'music', 
      date: new Date(Date.now() + 26 * 60 * 60 * 1000), // Tomorrow
      duration: 60,
      location: 'Music Room',
      color: 'bg-purple-500' 
    },
    { 
      id: 3, 
      name: 'Science Club', 
      type: 'academic', 
      date: new Date(Date.now() + 50 * 60 * 60 * 1000), // Day after tomorrow
      duration: 45,
      location: 'Lab 2',
      color: 'bg-blue-500' 
    },
  ])

  const [grades, setGrades] = useState([
    { id: 1, subject: 'Mathematics', score: 92, maxScore: 100, date: '2024-01-20', notes: 'Great improvement on geometry!' },
    { id: 2, subject: 'Science', score: 88, maxScore: 100, date: '2024-01-18', notes: 'Excellent lab report on photosynthesis' },
    { id: 3, subject: 'English', score: 95, maxScore: 100, date: '2024-01-15', notes: 'Creative writing shows real talent' },
    { id: 4, subject: 'History', score: 85, maxScore: 100, date: '2024-01-12', notes: 'Good understanding of ancient civilizations' },
    { id: 5, subject: 'Mathematics', score: 78, maxScore: 100, date: '2024-01-10', notes: 'Need more practice with fractions' },
  ])

  const [newItem, setNewItem] = useState({
    title: '',
    subject: '',
    due: '',
    type: 'homework' as 'homework' | 'activity' | 'grade'
  })

  useEffect(() => {
    if (highlightId) {
      const element = document.getElementById(`item-${highlightId}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
        element.classList.add('animate-pulse', 'border-yellow-400', 'bg-yellow-50')
        setTimeout(() => {
          element.classList.remove('animate-pulse', 'border-yellow-400', 'bg-yellow-50')
        }, 3000)
      }
    }
  }, [highlightId])

  const markHomeworkComplete = async (id: string) => {
    try {
      await completeHomework(id)
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100])
      }
    } catch (error) {
      console.error('Failed to complete homework:', error)
    }
  }

  const deleteHomeworkItem = async (id: string) => {
    try {
      await deleteHomework(id)
    } catch (error) {
      console.error('Failed to delete homework:', error)
    }
  }

  const groupHomeworkByDate = () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
    const thisWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

    const groups = {
      overdue: homework.filter(hw => !hw.completed && hw.due < today),
      today: homework.filter(hw => hw.due >= today && hw.due < tomorrow),
      tomorrow: homework.filter(hw => hw.due >= tomorrow && hw.due < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)),
      thisWeek: homework.filter(hw => hw.due >= new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000) && hw.due < thisWeek),
      later: homework.filter(hw => hw.due >= thisWeek),
      completed: homework.filter(hw => hw.completed)
    }

    return groups
  }

  const scanDiary = () => {
    // TODO: Implement camera OCR functionality
    alert('📷 Camera OCR coming soon! For now, you can add homework manually.')
  }

  const addNewItem = async () => {
    if (newItem.title.trim()) {
      try {
        if (activeTab === 'homework') {
          await createHomework({
            title: newItem.title,
            subject: newItem.subject || 'General',
            description: `${newItem.subject || 'General'} homework: ${newItem.title}`,
            dueDate: newItem.due || undefined,
            priority: 'medium',
            starValue: 2
          })
        } else if (activeTab === 'activities') {
          // TODO: Implement activities API
          const newActivity = {
            id: Math.max(...activities.map(a => a.id)) + 1,
            name: newItem.title,
            type: 'other',
            date: new Date(newItem.due),
            duration: 60,
            location: 'TBD',
            color: 'bg-gray-500'
          }
          setActivities(prev => [...prev, newActivity])
        }
        setNewItem({ title: '', subject: '', due: '', type: 'homework' })
        setShowAddModal(false)
      } catch (error) {
        console.error('Failed to add item:', error)
      }
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
    
    if (date >= today && date < tomorrow) return 'Today'
    if (date >= tomorrow && date < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)) return 'Tomorrow'
    return date.toLocaleDateString()
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const HomeworkCard = ({ hw }: { hw: typeof homework[0] }) => (
    <div
      id={`item-${hw.id}`}
      className={`bg-white rounded-lg border-l-4 ${hw.color} p-4 shadow-sm transition-all duration-200 ${
        hw.completed ? 'opacity-60' : 'hover:shadow-md'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className={`font-bold ${hw.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
            {hw.title}
          </h4>
          <p className="text-sm text-gray-600">{hw.subject}</p>
          <p className={`text-xs ${hw.urgent ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
            Due: {formatDate(hw.due)} {hw.urgent && '⚠️'}
          </p>
        </div>
        
        {!hw.completed && (
          <div className="flex gap-2">
            <button
              onClick={() => markHomeworkComplete(hw.id)}
              className="p-2 text-green-600 hover:bg-green-100 rounded"
            >
              ✓
            </button>
            <button
              onClick={() => deleteHomeworkItem(hw.id)}
              className="p-2 text-red-600 hover:bg-red-100 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )

  const ActivityCard = ({ activity }: { activity: typeof activities[0] }) => (
    <div
      id={`item-${activity.id}`}
      className="bg-white rounded-lg p-4 shadow-sm border transition-all duration-200 hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <div className={`w-3 h-12 ${activity.color} rounded-full`} />
        <div className="flex-1">
          <h4 className="font-bold text-gray-800">{activity.name}</h4>
          <p className="text-sm text-gray-600">{activity.location}</p>
          <p className="text-xs text-gray-500">
            {formatDate(activity.date)} at {formatTime(activity.date)} • {activity.duration}min
          </p>
        </div>
        <div className={`px-2 py-1 ${activity.color} text-white text-xs font-bold rounded-full`}>
          {activity.type}
        </div>
      </div>
    </div>
  )

  const groupedHomework = groupHomeworkByDate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-blue-700">School Center 📓</h1>
          <p className="text-blue-600">Manage homework, activities & grades</p>
        </div>
        
        {activeTab === 'homework' && (
          <button
            onClick={scanDiary}
            className="bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-xl shadow-lg hover:scale-105 transition-all flex items-center gap-2"
          >
            <Camera className="w-5 h-5" />
            <span className="text-sm font-medium">Scan Diary</span>
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex mb-6 bg-white/50 backdrop-blur-sm rounded-xl p-1">
        {[
          { id: 'homework', label: 'Homework', icon: '📝' },
          { id: 'activities', label: 'Activities', icon: '⚽' },
          { id: 'grades', label: 'Grades', icon: '📊' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-white shadow-md text-blue-700' 
                : 'text-blue-600 hover:bg-white/50'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6 mb-20">
        {activeTab === 'homework' && (
          <>
            {Object.entries(groupedHomework).map(([groupName, items]) => 
              items.length > 0 && (
                <div key={groupName}>
                  <h3 className={`text-lg font-bold mb-3 ${
                    groupName === 'overdue' ? 'text-red-600' : 'text-gray-700'
                  }`}>
                    {groupName === 'overdue' ? '⚠️ Overdue' :
                     groupName === 'today' ? '📅 Today' :
                     groupName === 'tomorrow' ? '⏰ Tomorrow' :
                     groupName === 'thisWeek' ? '📆 This Week' :
                     groupName === 'later' ? '🔮 Later' : '✅ Completed'}
                  </h3>
                  <div className="space-y-3">
                    {items.map((hw) => (
                      <HomeworkCard key={hw.id} hw={hw} />
                    ))}
                  </div>
                </div>
              )
            )}
          </>
        )}

        {activeTab === 'activities' && (
          <div className="space-y-4">
            {activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}

        {activeTab === 'grades' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-blue-700">Recent Test Scores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {grades.map((grade) => (
                    <button
                      key={grade.id}
                      onClick={() => setShowGradeDetail(grade)}
                      className="w-full text-left p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-gray-800">{grade.subject}</span>
                        <span className={`font-bold ${
                          grade.score >= 90 ? 'text-green-600' :
                          grade.score >= 80 ? 'text-blue-600' :
                          grade.score >= 70 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {grade.score}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            grade.score >= 90 ? 'bg-green-500' :
                            grade.score >= 80 ? 'bg-blue-500' :
                            grade.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${grade.score}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{grade.date}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-full shadow-xl hover:scale-110 transition-all flex items-center justify-center z-40"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-white m-4 max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-center text-lg text-blue-700">
                Add New {activeTab === 'homework' ? 'Homework' : activeTab === 'activities' ? 'Activity' : 'Grade'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder={activeTab === 'homework' ? 'Assignment title' : 'Activity name'}
                value={newItem.title}
                onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
              />
              
              {activeTab === 'homework' && (
                <Input
                  placeholder="Subject"
                  value={newItem.subject}
                  onChange={(e) => setNewItem(prev => ({ ...prev, subject: e.target.value }))}
                />
              )}
              
              <Input
                type="datetime-local"
                value={newItem.due}
                onChange={(e) => setNewItem(prev => ({ ...prev, due: e.target.value }))}
              />
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowAddModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={addNewItem}
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                  disabled={!newItem.title.trim()}
                >
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Grade Detail Modal */}
      {showGradeDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-white m-4 max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-center text-lg text-blue-700">
                {showGradeDetail.subject} Test Result
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {showGradeDetail.score}%
                </div>
                <div className="text-gray-600">
                  {showGradeDetail.score}/{showGradeDetail.maxScore} points
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  {showGradeDetail.date}
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-bold text-blue-700 mb-2">Teacher Notes:</h4>
                <p className="text-blue-600">{showGradeDetail.notes}</p>
              </div>
              
              <Button 
                onClick={() => setShowGradeDetail(null)}
                className="w-full"
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}