'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Heart, Play, Clock, Star, ArrowLeft, ArrowRight } from 'lucide-react'
import { useScreenTime } from '@/hooks/useScreenTime'

/**
 * Toddler Play Lobby Screen (Blueprint 4.4.3)
 * 
 * Per blueprint:
 * - Daily Featured Game: large tile top; auto-rotating (memory flip, color match, simple puzzles). Max 3-min session enforced
 * - Idea Carousel: horizontally scrollable cards with photo + 1-word label ("Stack", "Paint"); tapping shows 3-step pictorial guide
 * - Favorites Row: last 4 played items pinned bottom; long-press heart to un-favorite
 * - Session Timer: subtle bar top-right counts total Play time; defaults 15 min/day; turns yellow at 90%, red at limit then auto-returns to Home
 */
export default function ToddlerPlayPage() {
  const { data: session } = useSession()
  const [childId, setChildId] = useState<string | null>(null)
  const [showInstructions, setShowInstructions] = useState<string | null>(null)
  const [favorites, setFavorites] = useState(['🧩', '🎨', '🔵', '🎵'])
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0)

  // Get child ID from session or URL params
  useEffect(() => {
    // TODO: Get actual child ID from context or URL
    setChildId('child-1') // Placeholder
  }, [session])

  // Use real screen time tracking
  const { 
    data: screenTimeData, 
    startSession, 
    endSession, 
    isSessionActive, 
    currentSessionDuration,
    isLoading: screenTimeLoading 
  } = useScreenTime(childId)

  // Get screen time stats
  const totalMinutesUsed = screenTimeData?.stats.totalMinutesUsed || 0
  const totalAllowed = screenTimeData?.stats.totalAllowedMinutes || 15
  const sessionProgress = (totalMinutesUsed / totalAllowed) * 100
  const isNearLimit = screenTimeData?.stats.isNearLimit || false
  const isAtLimit = screenTimeData?.stats.isOverLimit || false

  const featuredGames = [
    { name: 'Memory Flip', icon: '🧩', color: 'from-blue-400 to-purple-400' },
    { name: 'Color Match', icon: '🌈', color: 'from-pink-400 to-red-400' },
    { name: 'Simple Puzzle', icon: '🎯', color: 'from-green-400 to-blue-400' },
  ]

  const playIdeas = [
    { 
      name: 'Stack', 
      icon: '🧱',
      instructions: ['Find blocks or toys', 'Stack them up high', 'Try not to knock over!']
    },
    { 
      name: 'Paint', 
      icon: '🎨',
      instructions: ['Get paper and paints', 'Dip brush in colors', 'Make pretty pictures!']
    },
    { 
      name: 'Dance', 
      icon: '💃',
      instructions: ['Put on music', 'Move your body', 'Have fun dancing!']
    },
    { 
      name: 'Build', 
      icon: '🏗️',
      instructions: ['Get building toys', 'Stack and connect', 'Make something cool!']
    },
    { 
      name: 'Sing', 
      icon: '🎵',
      instructions: ['Think of a song', 'Open your mouth', 'Sing loud and proud!']
    },
    { 
      name: 'Jump', 
      icon: '🦘',
      instructions: ['Find safe space', 'Bend your knees', 'Jump up and down!']
    },
  ]

  // Auto-rotate featured game every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeaturedIndex(prev => (prev + 1) % featuredGames.length)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  // Start screen time session when component mounts
  useEffect(() => {
    if (childId && !isSessionActive) {
      startSession('toddler-play').catch(console.error)
    }
    
    // End session when component unmounts
    return () => {
      if (isSessionActive) {
        endSession('Play session ended').catch(console.error)
      }
    }
  }, [childId])

  // Auto-redirect when limit reached
  useEffect(() => {
    if (isAtLimit) {
      alert('Time to rest our eyes! 👀')
      if (isSessionActive) {
        endSession('Session ended due to time limit').then(() => {
          window.location.href = '/child/toddler/home'
        }).catch(console.error)
      } else {
        window.location.href = '/child/toddler/home'
      }
    }
  }, [isAtLimit])

  const launchGame = (game: typeof featuredGames[0]) => {
    // Launch game with 3-minute session limit
    alert(`🎮 Starting ${game.name}! Max 3 minutes of fun!`)
    // TODO: Launch actual game with timer
  }

  const showPlayIdea = (idea: typeof playIdeas[0]) => {
    setShowInstructions(idea.name)
    // Play instruction audio
    // TODO: Add text-to-speech for instructions
  }

  const toggleFavorite = (icon: string) => {
    setFavorites(prev => 
      prev.includes(icon) 
        ? prev.filter(fav => fav !== icon)
        : [...prev.slice(0, 3), icon] // Keep only 4 favorites
    )
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const currentGame = featuredGames[currentFeaturedIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-50 to-pink-100 p-4">
      {/* Session Timer */}
      <div className="fixed top-4 right-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg border">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-600" />
            <span className={`text-sm font-medium ${isNearLimit ? 'text-red-600' : isAtLimit ? 'text-red-700' : 'text-gray-700'}`}>
              {formatTime(totalMinutesUsed)} / {formatTime(totalAllowed)}
            </span>
          </div>
          <Progress 
            value={sessionProgress} 
            className={`w-24 h-1 mt-1 ${isNearLimit ? 'bg-red-100' : 'bg-gray-100'}`}
          />
        </div>
      </div>

      {/* Daily Featured Game */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-center text-orange-700 mb-4">
          🌟 Today's Special Game!
        </h2>
        <Card 
          className={`bg-gradient-to-br ${currentGame.color} border-0 shadow-xl cursor-pointer transform hover:scale-105 transition-all`}
          onClick={() => launchGame(currentGame)}
        >
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">{currentGame.icon}</div>
            <h3 className="text-2xl font-bold text-white mb-2">{currentGame.name}</h3>
            <Button 
              size="lg" 
              className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30"
            >
              <Play className="w-6 h-6 mr-2" />
              Play Now!
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Idea Carousel */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-orange-700 mb-4 text-center">
          🎈 Fun Ideas to Try!
        </h3>
        <div className="flex gap-4 overflow-x-auto pb-4 px-2">
          {playIdeas.map((idea, index) => (
            <Card 
              key={idea.name}
              className="min-w-[140px] bg-white/80 backdrop-blur-sm cursor-pointer hover:shadow-lg transition-all"
              onClick={() => showPlayIdea(idea)}
            >
              <CardContent className="p-4 text-center">
                <div className="text-4xl mb-2">{idea.icon}</div>
                <h4 className="font-bold text-orange-700">{idea.name}</h4>
                <div className="flex justify-center mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(idea.icon)
                    }}
                    className={`p-1 rounded-full transition-colors ${
                      favorites.includes(idea.icon) 
                        ? 'text-red-500 bg-red-100' 
                        : 'text-gray-400 bg-gray-100'
                    }`}
                  >
                    <Heart className="w-4 h-4" fill={favorites.includes(idea.icon) ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Favorites Row */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-orange-700 mb-3 text-center">
          ❤️ My Favorites
        </h3>
        <div className="flex justify-center gap-4">
          {favorites.map((fav, index) => (
            <button
              key={index}
              onMouseDown={() => {
                // Long-press to remove favorite
                const timeout = setTimeout(() => {
                  toggleFavorite(fav)
                }, 800)
                
                const cleanup = () => {
                  clearTimeout(timeout)
                  document.removeEventListener('mouseup', cleanup)
                }
                document.addEventListener('mouseup', cleanup)
              }}
              className="w-16 h-16 bg-gradient-to-br from-pink-200 to-purple-200 rounded-2xl flex items-center justify-center text-2xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
            >
              {fav}
            </button>
          ))}
        </div>
        <p className="text-center text-xs text-orange-600 mt-2">
          Hold to remove favorites
        </p>
      </div>

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-white m-4 max-w-sm w-full">
            <CardHeader>
              <CardTitle className="text-center text-lg text-orange-700">
                How to {showInstructions}! 📋
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {playIdeas.find(idea => idea.name === showInstructions)?.instructions.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center font-bold text-orange-700 flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 flex-1">{step}</p>
                  </div>
                ))}
              </div>
              <Button 
                onClick={() => setShowInstructions(null)}
                className="w-full mt-6 bg-orange-500 hover:bg-orange-600"
              >
                Got it! Let's play! 🎉
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Auto-return warning */}
      {isNearLimit && (
        <div className="fixed bottom-20 left-4 right-4 z-10">
          <Card className="bg-yellow-100 border-yellow-300">
            <CardContent className="p-3 text-center">
              <p className="text-yellow-800 font-medium">
                ⏰ Almost time to rest! {Math.max(0, totalAllowed - totalMinutesUsed)} minutes left
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation Hint */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-2 h-2 bg-orange-200 rounded-full"></div>
          <div className="w-2 h-2 bg-orange-200 rounded-full"></div>
          <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
          <div className="w-2 h-2 bg-orange-200 rounded-full"></div>
        </div>
        <p className="text-sm text-orange-600">👆 Swipe to explore more!</p>
      </div>
    </div>
  )
}