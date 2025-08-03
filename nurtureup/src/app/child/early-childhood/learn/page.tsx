'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Clock, Star, Lock, Play } from 'lucide-react'
import { useLearning } from '@/hooks/useLearning'

/**
 * Early Childhood Learn Arcade (Blueprint 5.4.3)
 * 
 * Per blueprint:
 * - Skill Tabs: Phonics, Numbers, Shapes
 * - Featured Game Banner: rotates daily; shows XP progress ring  
 * - Game Grid: cards show skill icon, XP earned, and lock overlay until prerequisite skill reached
 * - Session Timer: bar top-right (parent-defined). Turns orange when 1 min left; upon expiry, friendly mascot escorts child back Home
 * - XP to Stars Exchange: every 100 XP auto-converts to 1 star (message toast)
 */
export default function EarlyChildhoodLearnPage() {
  const searchParams = useSearchParams()
  const shouldShowFeatured = searchParams?.get('featured') === 'true'

  const [activeTab, setActiveTab] = useState<'phonics' | 'numbers' | 'shapes'>('phonics')
  const [sessionTime, setSessionTime] = useState(0) // seconds in current session
  const [maxSessionTime] = useState(20 * 60) // 20 minutes max session
  const [showXPConversion, setShowXPConversion] = useState(false)
  const [featuredGameIndex, setFeaturedGameIndex] = useState(0)
  const [childId, setChildId] = useState<string | null>(null)

  // Get child ID from session or URL params
  useEffect(() => {
    // TODO: Get actual child ID from context or URL
    setChildId('child-1') // Placeholder
  }, [])

  // Fetch real learning data
  const { 
    data: learningData, 
    recordGameSession, 
    isLoading: learningLoading 
  } = useLearning(childId)

  // Use real data or fallback to defaults
  const userXP = learningData?.stats.xpBySubject || { phonics: 0, numbers: 0, shapes: 0 }
  const stars = learningData?.stats.starsFromXP || 0

  // Get game data from API or use fallback
  const getGamesForSubject = (subject: 'phonics' | 'numbers' | 'shapes') => {
    const subjectProgress = learningData?.gameProgress?.find(sp => sp.subject === subject)
    if (subjectProgress) {
      return subjectProgress.games.map(game => ({
        id: game.id,
        name: game.name,
        icon: getGameIcon(game.id),
        xp: Math.round(game.progress), // Convert progress to display XP
        unlocked: game.unlocked,
        minXP: game.minXP,
        completed: game.completed
      }))
    }
    
    // Fallback games if API data not available
    const fallbackGames = {
      phonics: [
        { id: 'letter-sounds', name: 'Letter Sounds', icon: '🅰️', xp: 0, unlocked: true, minXP: 0, completed: false },
        { id: 'rhyme-time', name: 'Rhyme Time', icon: '🎵', xp: 0, unlocked: true, minXP: 25, completed: false },
        { id: 'word-builder', name: 'Word Builder', icon: '🔨', xp: 0, unlocked: userXP.phonics >= 50, minXP: 50, completed: false },
        { id: 'reading-fun', name: 'Reading Fun', icon: '📖', xp: 0, unlocked: userXP.phonics >= 100, minXP: 100, completed: false },
        { id: 'story-time', name: 'Story Time', icon: '📚', xp: 0, unlocked: userXP.phonics >= 150, minXP: 150, completed: false },
      ],
      numbers: [
        { id: 'count-to-10', name: 'Count to 10', icon: '🔟', xp: 0, unlocked: true, minXP: 0, completed: false },
        { id: 'number-match', name: 'Number Match', icon: '🎯', xp: 0, unlocked: true, minXP: 20, completed: false },
        { id: 'simple-math', name: 'Simple Math', icon: '➕', xp: 0, unlocked: userXP.numbers >= 50, minXP: 50, completed: false },
        { id: 'number-line', name: 'Number Line', icon: '📏', xp: 0, unlocked: userXP.numbers >= 80, minXP: 80, completed: false },
        { id: 'math-wizard', name: 'Math Wizard', icon: '🧙‍♂️', xp: 0, unlocked: userXP.numbers >= 120, minXP: 120, completed: false },
      ],
      shapes: [
        { id: 'shape-hunt', name: 'Shape Hunt', icon: '🔍', xp: 0, unlocked: true, minXP: 0, completed: false },
        { id: 'pattern-play', name: 'Pattern Play', icon: '🎨', xp: 0, unlocked: userXP.shapes >= 25, minXP: 25, completed: false },
        { id: 'shape-build', name: 'Shape Build', icon: '🏗️', xp: 0, unlocked: userXP.shapes >= 45, minXP: 45, completed: false },
        { id: 'geometry-fun', name: 'Geometry Fun', icon: '📐', xp: 0, unlocked: userXP.shapes >= 75, minXP: 75, completed: false },
        { id: 'shape-master', name: 'Shape Master', icon: '👑', xp: 0, unlocked: userXP.shapes >= 100, minXP: 100, completed: false },
      ]
    }
    return fallbackGames[subject]
  }

  function getGameIcon(gameId: string): string {
    const icons: Record<string, string> = {
      'letter-sounds': '🅰️', 'rhyme-time': '🎵', 'word-builder': '🔨', 'reading-fun': '📖', 'story-time': '📚',
      'count-to-10': '🔟', 'number-match': '🎯', 'simple-math': '➕', 'number-line': '📏', 'math-wizard': '🧙‍♂️',
      'shape-hunt': '🔍', 'pattern-play': '🎨', 'shape-build': '🏗️', 'geometry-fun': '📐', 'shape-master': '👑'
    }
    return icons[gameId] || '🎮'
  }

  const skills = {
    phonics: {
      name: 'Phonics',
      icon: '🔤',
      color: 'from-pink-400 to-purple-400',
      games: getGamesForSubject('phonics')
    },
    numbers: {
      name: 'Numbers', 
      icon: '🔢',
      color: 'from-blue-400 to-cyan-400',
      games: getGamesForSubject('numbers')
    },
    shapes: {
      name: 'Shapes',
      icon: '🔷', 
      color: 'from-green-400 to-emerald-400',
      games: getGamesForSubject('shapes')
    }
  }

  const featuredGames = [
    { name: 'Letter Sounds', category: 'phonics', icon: '🅰️', xp: 25, description: 'Learn how letters sound!' },
    { name: 'Count to 10', category: 'numbers', icon: '🔟', xp: 20, description: 'Practice counting!' },
    { name: 'Shape Hunt', category: 'shapes', icon: '🔍', xp: 15, description: 'Find all the shapes!' },
  ]

  // Session timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionTime(prev => {
        const newTime = prev + 1
        if (newTime >= maxSessionTime) {
          // Auto-return to Home with mascot
          alert('🐻 Time to rest! The learning bear says great job today!')
          window.location.href = '/child/early-childhood/home'
          return maxSessionTime
        }
        return newTime
      })
    }, 1000)
    
    return () => clearInterval(interval)
  }, [maxSessionTime])

  // Featured game rotation (every 30 seconds for demo)
  useEffect(() => {
    const interval = setInterval(() => {
      setFeaturedGameIndex(prev => (prev + 1) % featuredGames.length)
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  // XP to Stars conversion check - now handled by API
  useEffect(() => {
    if (learningData?.stats) {
      const newStars = learningData.stats.starsFromXP
      const currentTotalXP = learningData.stats.totalXP
      const prevStars = Math.floor((currentTotalXP - 100) / 100) // Rough estimate of previous stars
      
      if (newStars > prevStars && newStars > 0) {
        setShowXPConversion(true)
        setTimeout(() => setShowXPConversion(false), 3000)
      }
    }
  }, [learningData?.stats])

  const sessionProgress = (sessionTime / maxSessionTime) * 100
  const timeRemaining = maxSessionTime - sessionTime
  const isNearEnd = timeRemaining <= 60 // 1 minute warning

  const playGame = async (game: any, category: 'phonics' | 'numbers' | 'shapes') => {
    if (!game.unlocked) return

    try {
      // Simulate game play and record session
      const score = Math.floor(Math.random() * 100) + 1
      const xpEarned = Math.floor(Math.random() * 20) + 10
      const duration = Math.floor(Math.random() * 120) + 30 // 30-150 seconds

      await recordGameSession({
        subject: category,
        gameId: game.id,
        score,
        xpEarned,
        durationSeconds: duration,
        metadata: {
          sessionStartTime: new Date().toISOString(),
          gameVersion: '1.0'
        }
      })

      alert(`🎮 Playing ${game.name}! Earned ${xpEarned} XP! Score: ${score}`)
    } catch (error) {
      console.error('Failed to record game session:', error)
      alert(`🎮 Playing ${game.name}! (Note: Progress not saved)`)
    }
  }

  const currentSkill = skills[activeTab]
  const currentFeatured = featuredGames[featuredGameIndex]

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4">
      {/* Session Timer */}
      <div className="fixed top-4 right-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-gray-600" />
            <span className={`text-sm font-medium ${isNearEnd ? 'text-orange-600' : 'text-gray-700'}`}>
              {formatTime(timeRemaining)} left
            </span>
          </div>
          <Progress 
            value={sessionProgress} 
            className={`w-24 h-2 ${isNearEnd ? 'bg-orange-100' : 'bg-gray-100'}`}
          />
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-700 mb-2">Learn Arcade 📚</h1>
        <p className="text-indigo-600">Play games and learn new things!</p>
        <div className="flex items-center justify-center gap-4 mt-3">
          <div className="bg-yellow-200 px-3 py-1 rounded-full text-sm font-bold text-yellow-800">
            {stars} ⭐
          </div>
          <div className="bg-purple-200 px-3 py-1 rounded-full text-sm font-bold text-purple-800">
            {userXP.phonics + userXP.numbers + userXP.shapes} XP Total
          </div>
        </div>
      </div>

      {/* Featured Game Banner */}
      <Card className={`mb-6 bg-gradient-to-br ${currentSkill.color} border-0 shadow-xl`}>
        <CardContent className="p-6 text-white text-center">
          <div className="text-sm font-medium opacity-90 mb-2">🌟 Featured Game</div>
          <div className="text-4xl mb-3">{currentFeatured.icon}</div>
          <h3 className="text-xl font-bold mb-2">{currentFeatured.name}</h3>
          <p className="opacity-90 mb-4">{currentFeatured.description}</p>
          
          {/* XP Progress Ring */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
            <div className="w-8 h-8 relative">
              <Progress value={75} className="w-8 h-8 rounded-full" />
              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                75%
              </div>
            </div>
            <span className="text-sm font-medium">Progress</span>
          </div>
          
          <Button 
            onClick={() => playGame(
              skills[currentFeatured.category as keyof typeof skills].games.find(g => g.name === currentFeatured.name)!,
              currentFeatured.category as 'phonics' | 'numbers' | 'shapes'
            )}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border-white/30"
          >
            <Play className="w-4 h-4 mr-2" />
            Play Now!
          </Button>
        </CardContent>
      </Card>

      {/* Skill Tabs */}
      <div className="flex mb-6 bg-white/50 backdrop-blur-sm rounded-xl p-1">
        {Object.entries(skills).map(([key, skill]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as keyof typeof skills)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold transition-all ${
              activeTab === key 
                ? 'bg-white shadow-md text-indigo-700' 
                : 'text-indigo-600 hover:bg-white/50'
            }`}
          >
            <span className="text-xl">{skill.icon}</span>
            <span>{skill.name}</span>
            <div className="bg-indigo-200 px-2 py-1 rounded-full text-xs">
              {userXP[key as keyof typeof userXP] || 0} XP
            </div>
          </button>
        ))}
      </div>

      {/* Game Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {currentSkill.games.map((game) => (
          <Card 
            key={game.id}
            className={`relative cursor-pointer transition-all duration-200 ${
              game.unlocked 
                ? 'hover:shadow-lg hover:scale-105 bg-white' 
                : 'bg-gray-100 opacity-60'
            }`}
            onClick={() => playGame(game, activeTab)}
          >
            <CardContent className="p-4 text-center">
              {!game.unlocked && (
                <div className="absolute inset-0 bg-gray-500/50 rounded-lg flex items-center justify-center">
                  <div className="bg-white rounded-full p-2">
                    <Lock className="w-6 h-6 text-gray-600" />
                  </div>
                </div>
              )}
              
              <div className="text-3xl mb-2">{game.icon}</div>
              <h4 className="font-bold text-sm text-gray-700 mb-2">{game.name}</h4>
              
              {game.unlocked ? (
                <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
                  {game.xp} XP Earned
                </div>
              ) : (
                <div className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs">
                  Need {game.minXP} XP
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Near-end warning */}
      {isNearEnd && (
        <div className="fixed bottom-28 left-4 right-4 z-10">
          <Card className="bg-orange-100 border-orange-300">
            <CardContent className="p-3 text-center">
              <p className="text-orange-800 font-medium">
                🐻 Almost time to finish! 1 minute left to play
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* XP to Stars Conversion Toast */}
      {showXPConversion && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <Card className="bg-yellow-200 border-yellow-400 shadow-xl animate-bounce">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-2">⭐</div>
              <div className="font-bold text-yellow-800">
                Earned a Star!
              </div>
              <div className="text-sm text-yellow-700">
                100 XP = 1 Star
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}