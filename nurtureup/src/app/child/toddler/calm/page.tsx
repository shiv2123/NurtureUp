'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Heart, ArrowLeft } from 'lucide-react'

/**
 * Toddler Calm Screen - Emotion Wheel (Blueprint 4.4.4)
 * 
 * Per blueprint:
 * - Wheel Picker: full-screen radial dial with 6 emoji faces (Happy, Sad, Mad, Tired, Scared, Calm). Child spins wheel; selected face grows and says emotion word aloud
 * - Follow-Up Modal: depending on emotion, presents coping activity:
 *   · Mad ⇒ bubble pop game (tap bubbles to release anger)
 *   · Sad ⇒ breathing flower animation; inhaling expands petals
 *   · Tired ⇒ lullaby audio + dimmed night gradient
 * - Exit Button: top-right "I feel better"; requires 2-sec hold to ensure intent
 */
export default function ToddlerCalmPage() {
  const { data: session } = useSession()
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null)
  const [showActivity, setShowActivity] = useState(false)
  const [bubbles, setBubbles] = useState<Array<{id: number, x: number, y: number, popped: boolean}>>([])
  const [breathing, setBreathing] = useState<'inhale' | 'exhale' | 'pause'>('pause')
  const [exitProgress, setExitProgress] = useState(0)
  const [isExiting, setIsExiting] = useState(false)

  const emotions = [
    { name: 'Happy', emoji: '😊', color: 'bg-yellow-300', angle: 0 },
    { name: 'Sad', emoji: '😢', color: 'bg-blue-300', angle: 60 },
    { name: 'Mad', emoji: '😠', color: 'bg-red-300', angle: 120 },
    { name: 'Tired', emoji: '😴', color: 'bg-purple-300', angle: 180 },
    { name: 'Scared', emoji: '😨', color: 'bg-gray-300', angle: 240 },
    { name: 'Calm', emoji: '😌', color: 'bg-green-300', angle: 300 },
  ]

  // Generate bubbles for Mad emotion activity
  useEffect(() => {
    if (selectedEmotion === 'Mad' && showActivity) {
      const newBubbles = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: Math.random() * 80 + 10, // 10-90% of screen width
        y: Math.random() * 80 + 10, // 10-90% of screen height
        popped: false
      }))
      setBubbles(newBubbles)
    }
  }, [selectedEmotion, showActivity])

  // Breathing animation for Sad emotion
  useEffect(() => {
    if (selectedEmotion === 'Sad' && showActivity) {
      const breathingCycle = () => {
        setBreathing('inhale')
        setTimeout(() => setBreathing('pause'), 3000)
        setTimeout(() => setBreathing('exhale'), 4000)
        setTimeout(() => setBreathing('pause'), 7000)
      }
      
      breathingCycle()
      const interval = setInterval(breathingCycle, 8000)
      return () => clearInterval(interval)
    }
  }, [selectedEmotion, showActivity])

  const selectEmotion = (emotion: typeof emotions[0]) => {
    setSelectedEmotion(emotion.name)
    setShowActivity(true)
    // Play emotion word aloud
    // TODO: Add text-to-speech
    console.log(`Speaking: ${emotion.name}`)
  }

  const popBubble = (id: number) => {
    setBubbles(prev => prev.map(bubble => 
      bubble.id === id ? { ...bubble, popped: true } : bubble
    ))
    // Play pop sound
    // TODO: Add bubble pop sound effect
  }

  const handleExitStart = () => {
    setIsExiting(true)
    setExitProgress(0)
    
    const interval = setInterval(() => {
      setExitProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          // Exit to home
          window.location.href = '/child/toddler/home'
          return 100
        }
        return prev + 5 // 2 seconds total (100/5 * 50ms = 1000ms, but we want 2000ms so 100/5 * 100ms = 2000ms)
      })
    }, 100)
    
    // Clear if mouse/touch released
    const cleanup = () => {
      clearInterval(interval)
      setIsExiting(false)
      setExitProgress(0)
      document.removeEventListener('mouseup', cleanup)
      document.removeEventListener('touchend', cleanup)
    }
    
    document.addEventListener('mouseup', cleanup)
    document.addEventListener('touchend', cleanup)
  }

  const getActivityContent = () => {
    switch (selectedEmotion) {
      case 'Mad':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-red-100 to-orange-100">
            <div className="text-center p-6">
              <h2 className="text-2xl font-bold text-red-700 mb-4">
                Pop the bubbles to feel better! 🫧
              </h2>
              {bubbles.filter(b => !b.popped).length === 0 && (
                <div className="text-xl font-bold text-green-600 animate-bounce">
                  Great job! Feeling better? 🎉
                </div>
              )}
            </div>
            
            {bubbles.map(bubble => !bubble.popped && (
              <button
                key={bubble.id}
                onClick={() => popBubble(bubble.id)}
                className="absolute w-16 h-16 bg-gradient-to-br from-blue-300 to-cyan-300 rounded-full shadow-lg animate-pulse hover:scale-110 transition-transform border-4 border-blue-400"
                style={{ left: `${bubble.x}%`, top: `${bubble.y}%` }}
              >
                <div className="w-full h-full rounded-full bg-gradient-to-br from-white/50 to-transparent" />
              </button>
            ))}
          </div>
        )
        
      case 'Sad':
        return (
          <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-100 to-purple-100 p-6">
            <h2 className="text-2xl font-bold text-blue-700 mb-8">
              Breathe with the flower 🌸
            </h2>
            
            <div className="relative">
              <div 
                className={`w-40 h-40 rounded-full transition-all duration-3000 ease-in-out ${
                  breathing === 'inhale' ? 'scale-150 bg-gradient-to-br from-pink-300 to-purple-300' :
                  breathing === 'exhale' ? 'scale-75 bg-gradient-to-br from-blue-300 to-green-300' :
                  'scale-100 bg-gradient-to-br from-yellow-300 to-pink-300'
                }`}
              >
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white/50 to-transparent" />
                <div className="absolute inset-8 rounded-full bg-gradient-to-br from-yellow-200 to-orange-200" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl">
                  🌸
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-lg font-medium text-blue-600">
                {breathing === 'inhale' ? 'Breathe in...' : 
                 breathing === 'exhale' ? 'Breathe out...' : 
                 'Ready?'}
              </p>
            </div>
          </div>
        )
        
      case 'Tired':
        return (
          <div className="h-full bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900 text-white flex flex-col items-center justify-center p-6">
            <h2 className="text-2xl font-bold mb-8 text-purple-200">
              Rest time with gentle music 🌙
            </h2>
            
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full opacity-80 animate-pulse">
                <div className="absolute inset-4 bg-gradient-to-br from-white/50 to-transparent rounded-full" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl">
                  🌙
                </div>
              </div>
              
              {/* Stars */}
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-200 rounded-full animate-pulse"
                  style={{
                    left: `${Math.random() * 200 - 50}px`,
                    top: `${Math.random() * 200 - 50}px`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
            
            <p className="text-lg text-purple-200 mt-8 text-center">
              Close your eyes and listen... 🎵
            </p>
          </div>
        )
        
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-green-100 to-blue-100 p-6">
            <h2 className="text-2xl font-bold text-green-700 mb-8">
              You're feeling {selectedEmotion}! 😊
            </h2>
            <div className="text-6xl mb-8 animate-bounce">
              {emotions.find(e => e.name === selectedEmotion)?.emoji}
            </div>
            <p className="text-lg text-green-600 text-center">
              That's a wonderful feeling! Keep being awesome! ⭐
            </p>
          </div>
        )
    }
  }

  if (showActivity && selectedEmotion) {
    return (
      <div className="min-h-screen relative">
        {getActivityContent()}
        
        {/* Exit Button */}
        <button
          onMouseDown={handleExitStart}
          onTouchStart={handleExitStart}
          className="fixed top-4 right-4 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full shadow-lg font-bold text-lg z-10"
        >
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            I feel better
          </div>
          {isExiting && (
            <div className="absolute bottom-0 left-0 h-1 bg-green-300 rounded-full transition-all duration-100"
                 style={{ width: `${exitProgress}%` }} />
          )}
        </button>
        
        {/* Back to wheel button */}
        <button
          onClick={() => {
            setShowActivity(false)
            setSelectedEmotion(null)
          }}
          className="fixed top-4 left-4 bg-white/80 backdrop-blur-sm hover:bg-white/90 text-gray-700 p-3 rounded-full shadow-lg z-10"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-purple-100 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple-700 mb-2">
          How are you feeling? 💝
        </h1>
        <p className="text-lg text-purple-600">
          Tap the face that shows how you feel
        </p>
      </div>

      {/* Emotion Wheel */}
      <div className="relative w-80 h-80 mb-8">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/50 to-white/20 backdrop-blur-sm shadow-2xl border-4 border-white/30" />
        
        {emotions.map((emotion, index) => {
          const angle = (index * 60) - 90 // Start from top
          const radian = (angle * Math.PI) / 180
          const radius = 120
          const x = Math.cos(radian) * radius
          const y = Math.sin(radian) * radius
          
          return (
            <button
              key={emotion.name}
              onClick={() => selectEmotion(emotion)}
              className={`absolute w-20 h-20 ${emotion.color} rounded-full shadow-lg hover:scale-110 transform transition-all duration-300 border-4 border-white flex flex-col items-center justify-center hover:shadow-xl`}
              style={{
                left: `calc(50% + ${x}px - 2.5rem)`,
                top: `calc(50% + ${y}px - 2.5rem)`,
              }}
            >
              <div className="text-3xl mb-1">{emotion.emoji}</div>
              <div className="text-xs font-bold text-gray-700">{emotion.name}</div>
            </button>
          )
        })}
        
        {/* Center circle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full shadow-lg border-4 border-white flex items-center justify-center">
          <span className="text-2xl">💝</span>
        </div>
      </div>

      {/* Navigation Hint */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-2 h-2 bg-purple-200 rounded-full"></div>
          <div className="w-2 h-2 bg-purple-200 rounded-full"></div>
          <div className="w-2 h-2 bg-purple-200 rounded-full"></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
        </div>
        <p className="text-sm text-purple-600">👆 Swipe to explore more!</p>
      </div>
    </div>
  )
}