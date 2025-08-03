'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Plus, BookOpen, Wallet, Monitor, User, Calendar, Award, Target, Home, Clock, Star, CheckSquare, DollarSign, Smartphone } from 'lucide-react'

/**
 * School Age Parent Interface (Blueprint 3.5)
 * 
 * Navigation: Home, School, Wallet, Monitor
 * Features: Homework tracking, Allowance system, Screen time, Achievement badges
 */
export default function SchoolAgeParentPage() {
  const [activeTab, setActiveTab] = useState('home')
  const [childAge] = useState('9 yrs 7 mos')
  const [weeklyAllowance] = useState(15)
  const [currentBalance] = useState(23.50)
  const [screenTimeToday] = useState(3.2) // hours
  const [screenTimeLimit] = useState(4) // hours
  const [showHomeworkDetail, setShowHomeworkDetail] = useState(false)

  const tabs = [
    { id: 'home', label: 'Home', icon: BookOpen },
    { id: 'school', label: 'School', icon: Target },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'monitor', label: 'Monitor', icon: Monitor }
  ]

  const todaysHomework = [
    { subject: 'Math', task: 'Chapter 5 problems 1-15', status: 'completed', dueDate: 'Today', estimatedTime: '30 min' },
    { subject: 'Science', task: 'Plant growth experiment log', status: 'in-progress', dueDate: 'Tomorrow', estimatedTime: '15 min' },
    { subject: 'English', task: 'Reading comprehension worksheet', status: 'todo', dueDate: 'Friday', estimatedTime: '25 min' },
    { subject: 'History', task: 'Research colonial America', status: 'todo', dueDate: 'Next Monday', estimatedTime: '45 min' }
  ]

  const weeklyGoals = [
    { goal: 'Complete all homework on time', progress: 85, target: 100 },
    { goal: 'Screen time under limit', progress: 60, target: 100 },
    { goal: 'Earn weekly allowance', progress: 90, target: 100 },
    { goal: 'Practice piano 5x this week', progress: 70, target: 100 }
  ]

  const recentTransactions = [
    { date: '2 days ago', description: 'Homework bonus', amount: +5.00, type: 'earning' },
    { date: '3 days ago', description: 'Bought school supplies', amount: -8.50, type: 'spending' },
    { date: '1 week ago', description: 'Weekly allowance', amount: +15.00, type: 'earning' },
    { date: '1 week ago', description: 'Extra chore: yard work', amount: +10.00, type: 'earning' }
  ]

  const achievements = [
    { name: 'Perfect Week', description: 'Completed all homework on time', earned: true, date: '2 weeks ago' },
    { name: 'Math Master', description: 'Scored 100% on math quiz', earned: true, date: '1 month ago' },
    { name: 'Reading Champion', description: 'Read 5 books this month', earned: false, progress: 60 },
    { name: 'Tech Balance', description: 'Screen time under limit for 7 days', earned: false, progress: 85 }
  ]

  const quickActions = [
    { id: 'homework', label: 'Log Homework', icon: CheckSquare, color: 'from-blue-400 to-cyan-400' },
    { id: 'allowance', label: 'Add Allowance', icon: DollarSign, color: 'from-green-400 to-emerald-400' },
    { id: 'screentime', label: 'Check Screen Time', icon: Smartphone, color: 'from-purple-400 to-indigo-400' },
    { id: 'achievement', label: 'Award Badge', icon: Award, color: 'from-amber-400 to-orange-400' }
  ]

  const renderHomeTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-xl">
          <span className="text-3xl">🎒</span>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
          {childAge}
        </h2>
        <p className="text-lg text-slate-600 font-medium">Building responsibility and independence!</p>
      </div>

      {/* Today's Homework Overview */}
      <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-indigo-700 flex items-center gap-2">
              📚 Today's Homework
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => setShowHomeworkDetail(true)}>
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {todaysHomework.slice(0, 3).map((hw, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                  hw.status === 'completed' ? 'bg-green-50 border-l-4 border-green-400' :
                  hw.status === 'in-progress' ? 'bg-yellow-50 border-l-4 border-yellow-400' :
                  'bg-slate-50 border-l-4 border-slate-300'
                }`}
              >
                <div className="text-2xl">
                  {hw.status === 'completed' ? '✅' : 
                   hw.status === 'in-progress' ? '📝' : '📋'}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-slate-800">{hw.subject}</div>
                  <div className="text-sm text-slate-600">{hw.task}</div>
                  <div className="text-xs text-slate-500">{hw.dueDate} • {hw.estimatedTime}</div>
                </div>
                {hw.status !== 'completed' && (
                  <Button size="sm" variant="outline">
                    {hw.status === 'in-progress' ? 'Complete' : 'Start'}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Goals Progress */}
      <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Weekly Goals</h3>
          <div className="space-y-4">
            {weeklyGoals.map((goal, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">{goal.goal}</span>
                  <span className="text-sm text-slate-600">{goal.progress}%</span>
                </div>
                <Progress value={goal.progress} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Balance & Screen Time Cards */}
      <div className="grid grid-cols-2 gap-6">
        {/* Wallet Balance */}
        <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-slate-800 mb-2">Current Balance</h3>
            <div className="text-2xl font-bold text-green-600 mb-2">${currentBalance.toFixed(2)}</div>
            <div className="text-sm text-slate-600">Next allowance: ${weeklyAllowance} on Sunday</div>
            <Button size="sm" className="mt-3" variant="outline">View Transactions</Button>
          </CardContent>
        </Card>

        {/* Screen Time */}
        <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-6 text-center">
            <div className="relative w-16 h-16 mx-auto mb-3">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="35" stroke="#E5E7EB" strokeWidth="8" fill="none" />
                <circle
                  cx="50" cy="50" r="35"
                  stroke={screenTimeToday >= screenTimeLimit ? "#EF4444" : "#8B5CF6"}
                  strokeWidth="8" fill="none"
                  strokeDasharray={`${(screenTimeToday / screenTimeLimit) * 220} 220`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Monitor className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <h3 className="font-bold text-slate-800 mb-2">Screen Time Today</h3>
            <div className="text-lg font-bold text-purple-600">{screenTimeToday}h / {screenTimeLimit}h</div>
            <Button size="sm" className="mt-3" variant="outline">Manage Limits</Button>
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50">
      {/* Header */}
      <div className="backdrop-blur-lg bg-white/70 border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="w-10 h-10 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center hover:scale-105 transition-transform">
                <Home className="w-5 h-5 text-white" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  School Age Parent Hub
                </h1>
                <p className="text-sm text-slate-600">{childAge} • 7-12 years</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-slate-700">${currentBalance.toFixed(2)} Balance</span>
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
                      ? 'bg-indigo-500 text-white shadow-lg'
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
        {activeTab === 'school' && (
          <div className="space-y-6">
            <div className="text-center">
              <Target className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-800 mb-2">School Center</h3>
              <p className="text-slate-600">Homework tracking, academic goals, and parent-teacher communication</p>
            </div>

            {/* Homework Stats Overview */}
            <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="text-indigo-700">Homework Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{homeworkData?.stats?.totalActive || 0}</div>
                    <div className="text-sm text-blue-700">Active</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{homeworkData?.stats?.totalCompleted || 0}</div>
                    <div className="text-sm text-green-700">Completed</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{homeworkData?.stats?.overdue || 0}</div>
                    <div className="text-sm text-red-700">Overdue</div>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-lg">
                    <div className="text-2xl font-bold text-amber-600">{homeworkData?.stats?.completionRate || 0}%</div>
                    <div className="text-sm text-amber-700">Success Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* All Homework List */}
            <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-indigo-700">All Homework</CardTitle>
                  <Button onClick={() => setShowAddHomework(true)} disabled={homeworkLoading}>
                    Add Assignment
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {todaysHomework.length > 0 ? todaysHomework.map((hw: any) => {
                    const isCompleted = hw.completions && hw.completions.length > 0
                    const dueDate = hw.dueDate ? new Date(hw.dueDate).toLocaleDateString() : 'No due date'
                    const isOverdue = hw.dueDate && new Date(hw.dueDate) < new Date() && !isCompleted
                    
                    return (
                      <div
                        key={hw.id}
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                          isCompleted ? 'bg-green-50 border-green-300' :
                          isOverdue ? 'bg-red-50 border-red-300' :
                          'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="text-2xl">
                          {isCompleted ? '✅' : isOverdue ? '🚨' : '📋'}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-slate-800">{hw.category || 'General'}</div>
                          <div className="text-sm text-slate-600">{hw.title}</div>
                          {hw.description && (
                            <div className="text-sm text-slate-500">{hw.description}</div>
                          )}
                          <div className="text-xs text-slate-500 mt-1">
                            Due: {dueDate} • {hw.starValue} stars
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!isCompleted && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleCompleteHomework(hw.id)}
                              disabled={homeworkLoading}
                            >
                              Complete
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                          >
                            ✕
                          </Button>
                        </div>
                      </div>
                    )
                  }) : (
                    <div className="text-center py-8 text-slate-500">
                      <CheckSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No homework assignments</p>
                      <p className="text-sm">Add assignments to track progress!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        {activeTab === 'wallet' && (
          <div className="space-y-6">
            <div className="text-center">
              <Wallet className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Wallet Manager</h3>
              <p className="text-slate-600">Allowance tracking, spending goals, and financial literacy lessons</p>
            </div>

            {/* Wallet Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">Current Balance</h3>
                  <div className="text-3xl font-bold text-green-600 mb-2">${currentBalance.toFixed(2)}</div>
                  <div className="text-sm text-slate-600">Available to spend</div>
                </CardContent>
              </Card>
              
              <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">This Month</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-2">${walletData?.stats?.monthlyEarnings?.toFixed(2) || '0.00'}</div>
                  <div className="text-sm text-slate-600">Total earned</div>
                </CardContent>
              </Card>
              
              <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">Savings Goal</h3>
                  <div className="text-3xl font-bold text-purple-600 mb-2">${walletData?.savingsGoal?.targetAmount?.toFixed(2) || '50.00'}</div>
                  <div className="text-sm text-slate-600">{walletData?.savingsGoal?.item || 'New toy'}</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="text-indigo-700">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTransactions.length > 0 ? recentTransactions.map((transaction: any, index: number) => (
                    <div
                      key={transaction.id || index}
                      className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border transition-all hover:bg-slate-100"
                    >
                      <div className="text-2xl">
                        {transaction.amount > 0 ? '💰' : '💸'}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-800">{transaction.description}</div>
                        <div className="text-sm text-slate-600">{transaction.category}</div>
                        <div className="text-xs text-slate-500">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className={`text-right font-bold ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-slate-500">
                      <Wallet className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No transactions yet</p>
                      <p className="text-sm">Complete tasks to start earning!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        {activeTab === 'monitor' && (
          <div className="space-y-6">
            <div className="text-center">
              <Monitor className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Screen Time Monitor</h3>
              <p className="text-slate-600">Digital wellness tracking and healthy usage guidelines</p>
            </div>

            {/* Screen Time Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="relative w-20 h-20 mx-auto mb-4">
                    <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="35" stroke="#E5E7EB" strokeWidth="8" fill="none" />
                      <circle
                        cx="50" cy="50" r="35"
                        stroke={screenTimeData?.stats?.isOverLimit ? "#EF4444" : "#8B5CF6"}
                        strokeWidth="8" fill="none"
                        strokeDasharray={`${(screenTimeData?.stats?.percentageUsed || 0) * 2.2} 220`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Monitor className="w-8 h-8 text-purple-500" />
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">Today's Usage</h3>
                  <div className="text-2xl font-bold text-purple-600">{screenTimeToday.toFixed(1)}h</div>
                  <div className="text-sm text-slate-600">of {screenTimeLimit}h limit</div>
                </CardContent>
              </Card>
              
              <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">Remaining</h3>
                  <div className="text-2xl font-bold text-green-600">
                    {Math.max(0, (screenTimeData?.stats?.remainingMinutes || 0) / 60).toFixed(1)}h
                  </div>
                  <div className="text-sm text-slate-600">Time left today</div>
                </CardContent>
              </Card>
              
              <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">Bonus Time</h3>
                  <div className="text-2xl font-bold text-amber-600">
                    {Math.floor((screenTimeData?.stats?.bonusMinutes || 0) / 60)}h {(screenTimeData?.stats?.bonusMinutes || 0) % 60}m
                  </div>
                  <div className="text-sm text-slate-600">Earned from tasks</div>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Pattern */}
            <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="text-indigo-700">Weekly Pattern</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {(screenTimeData?.weeklyPattern || []).map((day: any, index: number) => (
                    <div
                      key={index}
                      className={`text-center p-3 rounded-lg ${
                        day.isToday ? 'bg-indigo-100 border-2 border-indigo-300' : 'bg-slate-50'
                      }`}
                    >
                      <div className="text-xs font-medium text-slate-600 mb-1">{day.dayName}</div>
                      <div className="text-lg font-bold text-slate-800">{Math.round(day.minutes / 60)}h</div>
                      <div className="text-xs text-slate-500">{day.minutes}m</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Screen Time Logs */}
            <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="text-indigo-700">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(screenTimeData?.logs || []).slice(0, 5).map((log: any) => (
                    <div
                      key={log.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border transition-all hover:bg-slate-100"
                    >
                      <div className="text-2xl">
                        {log.type === 'session_start' ? '▶️' : 
                         log.type === 'session_end' ? '⏹️' :
                         log.type === 'limit_warning' ? '⚠️' : '🚫'}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-800">
                          {log.type === 'session_start' ? 'Session Started' :
                           log.type === 'session_end' ? 'Session Ended' :
                           log.type === 'limit_warning' ? 'Limit Warning' : 'Limit Exceeded'}
                        </div>
                        {log.app && (
                          <div className="text-sm text-slate-600">App: {log.app}</div>
                        )}
                        {log.durationMinutes && (
                          <div className="text-sm text-slate-600">Duration: {Math.round(log.durationMinutes)}m</div>
                        )}
                        <div className="text-xs text-slate-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!screenTimeData?.logs || screenTimeData.logs.length === 0) && (
                    <div className="text-center py-8 text-slate-500">
                      <Monitor className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No screen time activity yet</p>
                      <p className="text-sm">Screen time tracking will appear here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Floating Action Button */}
        <div className="fixed bottom-8 right-8 z-40">
          <Button
            className="w-16 h-16 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full shadow-xl hover:scale-110 transition-all duration-300"
          >
            <Plus className="w-8 h-8" />
          </Button>
        </div>

        {/* Add Homework Modal */}
        {showAddHomework && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-white m-4 max-w-md w-full shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-indigo-700">Add Homework Assignment</CardTitle>
                  <Button variant="ghost" onClick={() => setShowAddHomework(false)}>✕</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Subject
                    </label>
                    <select
                      value={newHomework.subject}
                      onChange={(e) => setNewHomework({...newHomework, subject: e.target.value})}
                      className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select subject</option>
                      <option value="Math">Math</option>
                      <option value="Science">Science</option>
                      <option value="English">English</option>
                      <option value="History">History</option>
                      <option value="Art">Art</option>
                      <option value="Music">Music</option>
                      <option value="PE">Physical Education</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Assignment Description
                    </label>
                    <textarea
                      value={newHomework.task}
                      onChange={(e) => setNewHomework({...newHomework, task: e.target.value})}
                      className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., Complete math problems 1-15 on page 42"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={newHomework.dueDate}
                      onChange={(e) => setNewHomework({...newHomework, dueDate: e.target.value})}
                      className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Estimated Time (minutes)
                    </label>
                    <select
                      value={newHomework.estimatedTime}
                      onChange={(e) => setNewHomework({...newHomework, estimatedTime: Number(e.target.value)})}
                      className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={90}>1.5 hours</option>
                      <option value={120}>2 hours</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleAddHomework}
                      disabled={!newHomework.subject || !newHomework.task || homeworkLoading}
                      className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white"
                    >
                      Add Assignment
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAddHomework(false)}
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

        {/* Homework Detail Overlay */}
        {showHomeworkDetail && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-white m-4 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-indigo-700">All Homework</CardTitle>
                  <Button variant="ghost" onClick={() => setShowHomeworkDetail(false)}>✕</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todaysHomework.map((hw: any, index: number) => {
                    const isCompleted = hw.completions && hw.completions.length > 0
                    const dueDate = hw.dueDate ? new Date(hw.dueDate).toLocaleDateString() : 'No due date'
                    
                    return (
                      <div key={hw.id || index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-slate-800">{hw.category || 'General'}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isCompleted ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {isCompleted ? 'completed' : 'pending'}
                          </span>
                        </div>
                        <p className="text-slate-600 mb-2">{hw.title}</p>
                        {hw.description && (
                          <p className="text-slate-500 text-sm mb-2">{hw.description}</p>
                        )}
                        <div className="flex items-center justify-between text-sm text-slate-500">
                          <span>Due: {dueDate}</span>
                          <span>{hw.starValue} stars</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}