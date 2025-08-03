'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Plus, Heart, Calendar, Target, User, Settings, MessageCircle, TrendingUp, Home, Clock, Star, CheckSquare, BookOpen, Brain } from 'lucide-react'

/**
 * Adolescence Parent Interface (Blueprint 3.6)
 * 
 * Navigation: Feed, Planner, Wellbeing, Life Skills
 * Features: Independence coaching, Mood tracking, College planning, Life skills development
 */
export default function AdolescenceParentPage() {
  const [activeTab, setActiveTab] = useState('feed')
  const [childAge] = useState('16 yrs 3 mos')
  const [independenceScore] = useState(78)
  const [moodTrend] = useState('stable')
  const [lifeSkillsProgress] = useState(65)
  const [showMoodDetail, setShowMoodDetail] = useState(false)
  const [showCollegePlan, setShowCollegePlan] = useState(false)

  const tabs = [
    { id: 'feed', label: 'Feed', icon: Heart },
    { id: 'planner', label: 'Planner', icon: Calendar },
    { id: 'wellbeing', label: 'Wellbeing', icon: Brain },
    { id: 'lifeskills', label: 'Life Skills', icon: Target }
  ]

  const recentUpdates = [
    { 
      time: '2 hours ago', 
      type: 'achievement', 
      message: 'Completed driving lesson #8', 
      category: 'Independence',
      icon: '🚗'
    },
    { 
      time: '1 day ago', 
      type: 'mood', 
      message: 'Mood check-in: Feeling confident about SAT prep', 
      category: 'Wellbeing',
      icon: '😊'
    },
    { 
      time: '2 days ago', 
      type: 'academic', 
      message: 'Submitted college application to State University', 
      category: 'College Prep',
      icon: '🎓'
    },
    { 
      time: '3 days ago', 
      type: 'lifeskill', 
      message: 'Learned to do laundry independently', 
      category: 'Life Skills',
      icon: '👕'
    }
  ]

  const upcomingMilestones = [
    { milestone: 'SAT Test Date', date: 'March 15', daysAway: 12, category: 'Academic' },
    { milestone: 'College Application Deadline', date: 'April 1', daysAway: 28, category: 'College' },
    { milestone: 'Driving Test', date: 'February 28', daysAway: 5, category: 'Independence' },
    { milestone: 'Part-time Job Interview', date: 'March 5', daysAway: 8, category: 'Life Skills' }
  ]

  const lifeSkillsAreas = [
    { skill: 'Financial Literacy', progress: 85, level: 'Advanced' },
    { skill: 'Cooking & Nutrition', progress: 60, level: 'Intermediate' },
    { skill: 'Time Management', progress: 70, level: 'Intermediate' },
    { skill: 'Communication', progress: 90, level: 'Advanced' },
    { skill: 'Self-Care', progress: 55, level: 'Developing' },
    { skill: 'Problem Solving', progress: 75, level: 'Intermediate' }
  ]

  const collegePrep = [
    { task: 'Complete FAFSA application', status: 'in-progress', deadline: 'March 1' },
    { task: 'Submit letters of recommendation', status: 'completed', deadline: 'February 15' },
    { task: 'Write personal essay', status: 'completed', deadline: 'January 30' },
    { task: 'Schedule campus visits', status: 'todo', deadline: 'April 15' },
    { task: 'Apply for scholarships', status: 'in-progress', deadline: 'Various dates' }
  ]

  const quickActions = [
    { id: 'checkin', label: 'Mood Check-in', icon: Heart, color: 'from-pink-400 to-rose-400' },
    { id: 'milestone', label: 'Add Milestone', icon: Target, color: 'from-blue-400 to-cyan-400' },
    { id: 'lifeskill', label: 'Practice Skill', icon: Star, color: 'from-green-400 to-emerald-400' },
    { id: 'college', label: 'College Task', icon: BookOpen, color: 'from-purple-400 to-indigo-400' }
  ]

  const renderFeedTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-r from-rose-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-xl">
          <span className="text-3xl">🎯</span>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-2">
          {childAge}
        </h2>
        <p className="text-lg text-slate-600 font-medium">Growing into independence with confidence!</p>
      </div>

      {/* Independence Score */}
      <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-800">Independence Score</h3>
            <div className="text-2xl font-bold text-rose-600">{independenceScore}/100</div>
          </div>
          <Progress value={independenceScore} className="mb-4 h-3" />
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Building adult life skills</span>
            <span>Ready for college independence!</span>
          </div>
        </CardContent>
      </Card>

      {/* Recent Updates Feed */}
      <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <CardHeader>
          <CardTitle className="text-rose-700 flex items-center gap-2">
            📱 Recent Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentUpdates.length > 0 ? recentUpdates.map((update, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                  update.type === 'achievement' ? 'bg-green-50 border-l-4 border-green-400' :
                  update.type === 'mood' ? 'bg-blue-50 border-l-4 border-blue-400' :
                  update.type === 'academic' ? 'bg-purple-50 border-l-4 border-purple-400' :
                  'bg-amber-50 border-l-4 border-amber-400'
                }`}
              >
                <div className="text-2xl">
                  {update.icon}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-slate-800">{update.message}</div>
                  <div className="text-sm text-slate-600">{update.time} • {update.category}</div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-slate-500">
                <Heart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No recent updates</p>
                <p className="text-sm">Start tracking mood and activities!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Milestones */}
      <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-rose-700">Upcoming Milestones</CardTitle>
            <Button variant="outline" size="sm">View Calendar</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingMilestones.slice(0, 3).map((milestone, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <div className="font-medium text-slate-800">{milestone.milestone}</div>
                  <div className="text-sm text-slate-600">{milestone.date} • {milestone.category}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-rose-600">{milestone.daysAway}</div>
                  <div className="text-xs text-slate-500">days away</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Action Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Button
            key={action.id}
            onClick={action.id === 'checkin' ? () => setShowMoodDetail(true) : 
                     action.id === 'college' ? () => setShowCollegePlan(true) : undefined}
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
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50">
      {/* Header */}
      <div className="backdrop-blur-lg bg-white/70 border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="w-10 h-10 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 flex items-center justify-center hover:scale-105 transition-transform">
                <Home className="w-5 h-5 text-white" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                  Adolescence Parent Hub
                </h1>
                <p className="text-sm text-slate-600">{childAge} • 13-18 years</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-rose-500" />
              <span className="text-sm font-medium text-slate-700">{independenceScore}% Independence</span>
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
                      ? 'bg-rose-500 text-white shadow-lg'
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
        {activeTab === 'feed' && renderFeedTab()}
        {activeTab === 'planner' && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-rose-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Personal Planner</h3>
            <p className="text-slate-600">Academic planning, college prep, and future goal setting</p>
          </div>
        )}
        {activeTab === 'wellbeing' && (
          <div className="space-y-6">
            <div className="text-center">
              <Brain className="w-16 h-16 text-rose-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Wellbeing Center</h3>
              <p className="text-slate-600">Mental health support, stress management, and emotional wellness</p>
            </div>

            {/* Mood Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">Average Mood</h3>
                  <div className="text-3xl font-bold text-pink-600 mb-2">
                    {moodData?.stats?.averageMood?.toFixed(1) || '0.0'}/10
                  </div>
                  <div className="text-sm text-slate-600">
                    {moodData?.stats?.latestMood?.emoji || '😐'} {moodTrend}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">Check-in Streak</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-2">{moodData?.stats?.streakDays || 0}</div>
                  <div className="text-sm text-slate-600">Days in a row</div>
                </CardContent>
              </Card>
              
              <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">Total Entries</h3>
                  <div className="text-3xl font-bold text-green-600 mb-2">{moodData?.stats?.totalEntries || 0}</div>
                  <div className="text-sm text-slate-600">Mood logs recorded</div>
                </CardContent>
              </Card>
            </div>

            {/* Mood Distribution */}
            <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="text-rose-700">Mood Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {moodData?.stats?.moodDistribution?.positive || 0}%
                    </div>
                    <div className="text-sm text-green-700">Positive</div>
                    <div className="text-2xl">😊</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {moodData?.stats?.moodDistribution?.neutral || 0}%
                    </div>
                    <div className="text-sm text-blue-700">Neutral</div>
                    <div className="text-2xl">😐</div>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-lg">
                    <div className="text-2xl font-bold text-amber-600">
                      {moodData?.stats?.moodDistribution?.concerning || 0}%
                    </div>
                    <div className="text-sm text-amber-700">Needs Support</div>
                    <div className="text-2xl">😟</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Mood Entries */}
            <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-rose-700">Recent Check-ins</CardTitle>
                  <Button onClick={() => setShowMoodDetail(true)} disabled={moodLoading}>
                    Add Check-in
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(moodData?.moodEntries || []).slice(0, 5).map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border transition-all hover:bg-slate-100"
                    >
                      <div className="text-2xl">
                        {entry.moodScore >= 8 ? '😄' : 
                         entry.moodScore >= 6 ? '😊' :
                         entry.moodScore >= 4 ? '😐' :
                         entry.moodScore >= 2 ? '😟' : '😢'}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-800">
                          Mood Score: {entry.moodScore}/10
                        </div>
                        {entry.notes && (
                          <div className="text-sm text-slate-600">{entry.notes}</div>
                        )}
                        <div className="text-xs text-slate-500">
                          {new Date(entry.loggedAt).toLocaleDateString()} at {new Date(entry.loggedAt).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="text-right">
                        {entry.energy && (
                          <div className="text-xs text-slate-500">Energy: {entry.energy}/10</div>
                        )}
                        {entry.stress && (
                          <div className="text-xs text-slate-500">Stress: {entry.stress}/10</div>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!moodData?.moodEntries || moodData.moodEntries.length === 0) && (
                    <div className="text-center py-8 text-slate-500">
                      <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No mood entries yet</p>
                      <p className="text-sm">Start tracking daily wellbeing!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        {activeTab === 'lifeskills' && (
          <div className="space-y-6">
            <div className="text-center">
              <Target className="w-16 h-16 text-rose-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Life Skills Development</h3>
              <p className="text-slate-600">Essential skills for adult independence and success</p>
            </div>
            
            <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
              <CardContent className="p-6">
                <div className="grid gap-4">
                  {lifeSkillsAreas.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-slate-800">{skill.skill}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            skill.level === 'Advanced' ? 'bg-green-100 text-green-700' :
                            skill.level === 'Intermediate' ? 'bg-blue-100 text-blue-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {skill.level}
                          </span>
                        </div>
                        <Progress value={skill.progress} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Floating Action Button */}
        <div className="fixed bottom-8 right-8 z-40">
          <Button
            className="w-16 h-16 bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow-xl hover:scale-110 transition-all duration-300"
          >
            <Plus className="w-8 h-8" />
          </Button>
        </div>

        {/* Mood Check-in Overlay */}
        {showMoodDetail && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-white m-4 max-w-md w-full shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-rose-700">Daily Mood Check-in</CardTitle>
                  <Button variant="ghost" onClick={() => setShowMoodDetail(false)}>✕</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-slate-600 mb-4">How are you feeling today?</p>
                    <div className="grid grid-cols-5 gap-3">
                      {[
                        { emoji: '😢', score: 2, label: 'Very Low' },
                        { emoji: '😟', score: 4, label: 'Low' },
                        { emoji: '😐', score: 6, label: 'Neutral' },
                        { emoji: '😊', score: 8, label: 'Good' },
                        { emoji: '😄', score: 10, label: 'Great' }
                      ].map((mood, index) => (
                        <Button 
                          key={index} 
                          variant={selectedMood === mood.score ? "default" : "outline"}
                          className={`h-16 text-2xl flex flex-col gap-1 ${
                            selectedMood === mood.score ? 'bg-rose-500 text-white' : ''
                          }`}
                          onClick={() => setSelectedMood(mood.score)}
                        >
                          <span>{mood.emoji}</span>
                          <span className="text-xs">{mood.score}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Any notes about your day? (Optional)
                    </label>
                    <textarea
                      value={moodNotes}
                      onChange={(e) => setMoodNotes(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                      placeholder="What influenced your mood today?"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleMoodSubmit}
                      disabled={selectedMood === null || moodLoading}
                      className="flex-1 bg-rose-500 hover:bg-rose-600 text-white"
                    >
                      Submit Check-in
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowMoodDetail(false)
                        setSelectedMood(null)
                        setMoodNotes('')
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

        {/* College Planning Overlay */}
        {showCollegePlan && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-white m-4 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-rose-700">College Preparation Checklist</CardTitle>
                  <Button variant="ghost" onClick={() => setShowCollegePlan(false)}>✕</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {collegePrep.map((task, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-slate-800">{task.task}</div>
                        <div className="text-sm text-slate-600">Deadline: {task.deadline}</div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        task.status === 'completed' ? 'bg-green-100 text-green-700' :
                        task.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {task.status.replace('-', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}