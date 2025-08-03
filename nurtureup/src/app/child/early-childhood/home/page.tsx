'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Plus, Star, GamepadIcon, Gift, User, CheckSquare, BookOpen, Home, Sparkles } from 'lucide-react'
import { useOptimisticTasks } from '@/hooks/useOptimisticTasks'

/**
 * Early Childhood Home Screen - Daily Quest Hub (Blueprint 5.4.1)
 * 
 * Per blueprint:
 * - Header: avatar portrait with dynamic expression (smiles when stars earned)
 * - Daily Quest Card: three daily tasks from parent app (Brush Teeth, Tidy Toys, Feed Pet). Each shows icon + progress bar
 * - Star Bank: coin-jar style counter; tapping jar spills stars animation and speaks total
 * - Energy Meter: ring that fills as screen time accrues; turns yellow at 80%, red & locks Learn tab when full
 * - Quick-Action Buttons: ➕ Log Chore, 🎮 Play Game, 🎁 Spend Stars
 * - Button: "+" radial menu (Add Chore, Start Game, Customize Avatar)
 */
export default function EarlyChildhoodHomePage() {
  const { data: session } = useSession()
  const [screenTime, setScreenTime] = useState(45) // minutes today
  const [maxScreenTime] = useState(90) // 90 minutes daily limit
  const [showFabMenu, setShowFabMenu] = useState(false)
  const [showRewardStore, setShowRewardStore] = useState(false)
  const [avatarExpression, setAvatarExpression] = useState('😊')

  // Fetch real tasks data
  const { data: tasksData, completeTask, isLoading: tasksLoading } = useOptimisticTasks()

  // Transform tasks data into daily quests format
  const dailyQuests = tasksData?.activeTasks?.slice(0, 3).map(task => ({
    id: task.id,
    name: task.title,
    icon: getTaskIcon(task.title),
    progress: task.completions && task.completions.length > 0 ? 100 : 0,
    completed: task.completions && task.completions.length > 0,
    task: task
  })) || [
    { id: 1, name: 'Brush Teeth', icon: '🦷', progress: 100, completed: true },
    { id: 2, name: 'Tidy Toys', icon: '🧸', progress: 60, completed: false },
    { id: 3, name: 'Feed Pet', icon: '🐕', progress: 0, completed: false },
  ]

  // Calculate stars from completed tasks
  const stars = tasksData?.completedTasks?.length || 24

  // Helper function to get appropriate icon for task
  function getTaskIcon(taskTitle: string): string {
    const title = taskTitle.toLowerCase()
    if (title.includes('brush') || title.includes('teeth')) return '🦷'
    if (title.includes('tidy') || title.includes('clean') || title.includes('toy')) return '🧸'
    if (title.includes('feed') || title.includes('pet')) return '🐕'
    if (title.includes('homework') || title.includes('study')) return '📚'
    if (title.includes('bed') || title.includes('sleep')) return '🛏️'
    return '✨'
  }

  const screenTimeProgress = (screenTime / maxScreenTime) * 100
  const isScreenTimeWarning = screenTimeProgress >= 80
  const isScreenTimeLocked = screenTimeProgress >= 100

  const actions = [
    { id: 'chore', label: 'Add Chore', icon: CheckSquare, color: 'bg-green-500' },
    { id: 'game', label: 'Start Game', icon: GamepadIcon, color: 'bg-blue-500' },
    { id: 'avatar', label: 'Customize Avatar', icon: User, color: 'bg-purple-500' },
  ]

  const rewards = [
    { id: 1, name: 'New Hat', price: 10, icon: '🎩' },
    { id: 2, name: 'Cool Glasses', price: 15, icon: '🕶️' },
    { id: 3, name: 'Magic Wand', price: 20, icon: '🪄' },
    { id: 4, name: 'Rainbow Wings', price: 25, icon: '🌈' },
  ]

  useEffect(() => {
    // Update avatar expression based on recent star earnings
    const recentStars = stars > 20
    setAvatarExpression(recentStars ? '😄' : '😊')
  }, [stars])

  const handleStarBankClick = () => {
    // Spill stars animation and speak total
    setAvatarExpression('🤩')
    // TODO: Add star spill animation
    // TODO: Add text-to-speech for star count
    console.log(`Speaking: You have ${stars} stars!`)
    
    setTimeout(() => setAvatarExpression('😊'), 2000)
  }

  const handleQuestClick = async (quest: typeof dailyQuests[0]) => {
    if (!quest.completed && quest.task) {
      try {
        await completeTask(quest.task.id)
        setAvatarExpression('🎉')
        // Play completion sound and animation
        setTimeout(() => setAvatarExpression('😊'), 2000)
      } catch (error) {
        console.error('Failed to complete task:', error)
        // Navigate to chores screen as fallback
        window.location.href = `/child/early-childhood/chores?highlight=${quest.id}`
      }
    }
  }

  const handleFabAction = (action: string) => {
    setShowFabMenu(false)
    switch (action) {
      case 'chore':
        window.location.href = '/child/early-childhood/chores?add=true'
        break
      case 'game':
        window.location.href = '/child/early-childhood/learn?featured=true'
        break
      case 'avatar':
        window.location.href = '/child/early-childhood/avatar'
        break
    }
  }

  const purchaseReward = (reward: typeof rewards[0]) => {
    if (stars >= reward.price) {
      setAvatarExpression('🎉')
      alert(`🎉 You got ${reward.name}! ${reward.icon}`)
      setTimeout(() => setAvatarExpression('😊'), 3000)
    } else {
      alert(`You need ${reward.price - stars} more stars! ⭐`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      {/* Header */}
      <div className="backdrop-blur-lg bg-white/70 border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/child/phases" className="w-10 h-10 rounded-2xl bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center hover:scale-105 transition-transform">
                <Home className="w-5 h-5 text-white" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Quest Center
                </h1>
                <p className="text-sm text-slate-600">Early Childhood Interface • Age 4-6</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-slate-700">{stars} Stars</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Avatar Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center mx-auto mb-4 shadow-xl hover:scale-105 transition-transform border-4 border-white">
            <span className="text-5xl">{avatarExpression}</span>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            Good morning, {session?.user?.name?.split(' ')[0] || 'Explorer'}! 🌟
          </h2>
          <p className="text-lg text-slate-600 font-medium">
            Ready for today's adventures?
          </p>
        </div>

        {/* Daily Quest Card */}
        <Card className="mb-6 bg-gradient-to-br from-yellow-100 to-orange-100 border-l-4 border-blue-500 shadow-lg hover:shadow-xl">
          <CardHeader>
            <CardTitle className="text-orange-700 flex items-center gap-2">
              ⚔️ Today's Quests
            </CardTitle>
          </CardHeader>
          <div className="space-y-4 p-6">
            {dailyQuests.map((quest) => (
              <Button
                key={quest.id}
                onClick={() => handleQuestClick(quest)}
                className={`w-full p-4 transition-all duration-300 ${
                  quest.completed 
                    ? 'bg-green-100 border-green-300' 
                    : 'bg-white border-gray-300 hover:border-blue-300 hover:shadow-lg'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{quest.icon}</div>
                  <div className="flex-1 text-left">
                    <h3 className="font-bold text-lg">
                      {quest.name}
                    </h3>
                    <Progress 
                      value={quest.progress} 
                      className="mt-2 h-2"
                    />
                  </div>
                  {quest.completed && (
                    <span className="text-green-600 font-bold">
                      ✓ Done!
                    </span>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </Card>

        {/* Star Bank */}
        <Card className="mb-6 bg-gradient-to-br from-yellow-200 to-amber-200 border-yellow-300 shadow-lg hover:shadow-xl">
          <div className="p-6">
            <Button 
              onClick={handleStarBankClick}
              className="w-full flex items-center justify-center gap-4 bg-transparent hover:scale-105 transition-all duration-300 text-slate-800 hover:text-slate-900"
            >
              <div className="text-6xl">🏺</div>
              <div className="text-center">
                <h2 className="text-3xl font-bold text-yellow-800">
                  {stars}
                </h2>
                <p className="text-yellow-700 font-medium text-lg">
                  Stars
                </p>
                <p className="text-yellow-600 text-sm">
                  Tap to see them sparkle!
                </p>
              </div>
            </Button>
          </div>
        </Card>

        {/* Energy Meter (Screen Time) */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">
                Screen Time Today
              </h3>
              <span className={`font-bold ${
                isScreenTimeWarning ? 'text-red-600' : 'text-blue-600'
              }`}>
                {screenTime}m / {maxScreenTime}m
              </span>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="35"
                    stroke="#E5E7EB"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="35"
                    stroke={isScreenTimeWarning ? "#EF4444" : "#3B82F6"}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${screenTimeProgress * 2.2} 220`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-slate-600">
                    {Math.round(screenTimeProgress)}%
                  </span>
                </div>
              </div>
            </div>
            {isScreenTimeLocked && (
              <p className="mt-4 text-center font-bold text-red-600">
                🔒 Learn tab locked - Time to rest your eyes!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Button 
            onClick={() => window.location.href = '/child/early-childhood/chores'}
            className="h-20 bg-gradient-to-br from-green-400 to-emerald-400 text-white shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 flex flex-col gap-1"
          >
            <CheckSquare className="w-6 h-6" />
            <span className="text-white text-sm font-bold">
              ➕ Log Chore
            </span>
          </Button>

          <Button 
            onClick={() => window.location.href = '/child/early-childhood/learn'}
            disabled={isScreenTimeLocked}
            className={`h-20 shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 flex flex-col gap-1 ${
              isScreenTimeLocked 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-br from-blue-400 to-cyan-400 text-white'
            }`}
          >
            <GamepadIcon className="w-6 h-6" />
            <span className={`text-sm font-bold ${isScreenTimeLocked ? 'text-gray-500' : 'text-white'}`}>
              🎮 Play Game
            </span>
          </Button>

          <Button 
            onClick={() => setShowRewardStore(true)}
            className="h-20 bg-gradient-to-br from-purple-400 to-pink-400 text-white shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 flex flex-col gap-1"
          >
            <Gift className="w-6 h-6" />
            <span className="text-white text-sm font-bold">
              🎁 Spend Stars
            </span>
          </Button>
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-24 right-4 z-40">
          {showFabMenu && (
            <div className="absolute bottom-16 right-0 space-y-3">
              {actions.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => handleFabAction(item.id)}
                  className={`${item.color} text-white p-3 rounded-full shadow-lg hover:scale-110 transition-all flex items-center gap-2`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                </button>
              ))}
            </div>
          )}
          
          <Button
            onClick={() => setShowFabMenu(!showFabMenu)}
            className={`w-16 h-16 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-all duration-300 ${
              showFabMenu ? 'rotate-45' : ''
            }`}
          >
            <Plus className="w-8 h-8" />
          </Button>
        </div>

        {/* Reward Store Overlay */}
        {showRewardStore && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-white m-4 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-xl">
              <CardHeader>
                <CardTitle className="text-center text-purple-700 flex items-center justify-center gap-2">
                  🎁 Reward Store
                  <span className="text-sm bg-yellow-200 px-2 py-1 rounded-full">
                    {stars} ⭐
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {rewards.map((reward) => (
                    <Button
                      key={reward.id}
                      onClick={() => purchaseReward(reward)}
                      disabled={stars < reward.price}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 flex flex-col ${
                        stars >= reward.price
                          ? 'border-purple-300 bg-purple-50 hover:border-purple-400 hover:shadow-lg'
                          : 'border-gray-300 bg-gray-50 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="text-3xl mb-2">{reward.icon}</div>
                      <span className="font-bold text-gray-700 text-sm">
                        {reward.name}
                      </span>
                      <span className="text-purple-600 font-bold text-sm">
                        {reward.price} ⭐
                      </span>
                    </Button>
                  ))}
                </div>
                <Button 
                  onClick={() => setShowRewardStore(false)}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white"
                >
                  Close Store
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}