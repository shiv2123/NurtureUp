'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Timer, Droplet, Star } from 'lucide-react'
import { usePottyLogs } from '@/hooks/usePottyLogs'

/**
 * Toddler Potty Monster Screen (Blueprint 4.4.2)
 * 
 * Per blueprint:
 * - Hero Monster: animated friend sitting on potty seat with idle breathing loop
 * - Timer Button: huge circular "Start Timer"; reads "Let's try for two minutes!" and counts down
 * - Sticker Board Preview: after successful timer, child chooses sticker (scrollable list of 8) to place on board
 * - Accident Button: small corner button (red droplet) for parent use; long-press 2s to avoid accidental taps
 * - Progress Banner: top banner shows "3 stickers to next Surprise"; confetti on reward
 */
export default function ToddlerPottyPage() {
  const { data: session } = useSession()
  const [childId, setChildId] = useState<string | null>(null)
  const [timerActive, setTimerActive] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(120) // 2 minutes in seconds
  const [showStickerSelection, setShowStickerSelection] = useState(false)
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null)
  const [monsterAnimation, setMonsterAnimation] = useState('idle') // idle, breathing, celebrating

  // Get child ID from session or URL params
  useEffect(() => {
    // TODO: Get actual child ID from context or URL
    // For now, assume first child
    setChildId('child-1') // Placeholder
  }, [session])

  // Fetch real potty data using hooks
  const { data: pottyData, logPottySuccess, logPottyAccident, startPottyAttempt, isLoading } = usePottyLogs(childId)

  const stickers = ['🌟', '🎈', '🦄', '🌈', '🎉', '🏆', '🦋', '🌸']
  const stickersEarned = pottyData?.stats.stickersEarned || 0
  const stickersToReward = Math.max(0, 3 - stickersEarned)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => {
          if (time <= 1) {
            setTimerActive(false)
            setShowStickerSelection(true)
            setMonsterAnimation('celebrating')
            // Play success sound and animation
            return 0
          }
          return time - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerActive, timeRemaining])

  const startTimer = async () => {
    setTimerActive(true)
    setTimeRemaining(120)
    setMonsterAnimation('breathing')
    
    // Log potty attempt to backend
    try {
      await startPottyAttempt()
    } catch (error) {
      console.error('Failed to log potty attempt:', error)
    }
    
    // Play monster voice: "Let's try for two minutes!"
    // TODO: Add audio playback
  }

  const selectSticker = async (sticker: string) => {
    setSelectedSticker(sticker)
    setShowStickerSelection(false)
    setMonsterAnimation('idle')
    
    // Log successful potty use to backend
    try {
      await logPottySuccess('Timer completed successfully!')
    } catch (error) {
      console.error('Failed to log potty success:', error)
    }
    
    // Play sticker placement sound
    // Check if reward threshold reached
    const newStickerCount = stickersEarned + 1
    if (newStickerCount >= 3) {
      // Trigger confetti and reward
      alert('🎉 Surprise unlocked! Great job!')
    }
  }

  const handleAccident = async () => {
    // Parent-use button with long-press protection
    // Reset timer if active, log accident
    setTimerActive(false)
    setTimeRemaining(120)
    setMonsterAnimation('idle')
    
    // Log accident to parent app
    try {
      await fetch('/api/child/potty-training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId: session?.user?.id, // TODO: Get actual child ID
          type: 'accident',
          timestamp: new Date().toISOString(),
          notes: 'Logged from potty training screen'
        })
      })
    } catch (error) {
      console.error('Failed to log accident:', error)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100 p-4">
      {/* Progress Banner */}
      <div className="mb-4">
        <Card className="bg-gradient-to-r from-yellow-200 to-orange-200 border-orange-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-orange-600" />
                <span className="text-orange-800 font-bold">
                  {stickersToReward > 0 ? `${stickersToReward} stickers to next Surprise!` : 'Surprise ready! 🎉'}
                </span>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className={`w-4 h-4 rounded-full ${i < stickersEarned ? 'bg-orange-500' : 'bg-orange-200'}`} />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hero Monster */}
      <div className="flex-1 flex flex-col items-center justify-center mb-8">
        <div className="relative">
          {/* Monster Character */}
          <div className={`w-40 h-40 bg-gradient-to-br from-green-300 to-green-500 rounded-full border-4 border-green-600 flex items-center justify-center shadow-lg ${monsterAnimation === 'breathing' ? 'animate-pulse' : monsterAnimation === 'celebrating' ? 'animate-bounce' : ''}`}>
            <div className="text-6xl">🐸</div>
          </div>
          
          {/* Potty Seat */}
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-16 bg-gradient-to-b from-blue-200 to-blue-300 rounded-t-full border-4 border-blue-400" />
          
          {/* Speech Bubble (when timer active) */}
          {timerActive && (
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl px-4 py-2 shadow-lg border-2 border-green-300">
              <div className="text-sm font-bold text-green-700">Let's try for two minutes!</div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-green-300" />
            </div>
          )}
        </div>

        {/* Timer Display */}
        {timerActive && (
          <div className="mt-8 text-center">
            <div className="text-4xl font-bold text-purple-700 mb-4">
              {formatTime(timeRemaining)}
            </div>
            <Progress 
              value={((120 - timeRemaining) / 120) * 100} 
              className="w-48 h-4"
            />
          </div>
        )}
      </div>

      {/* Timer Button */}
      {!timerActive && !showStickerSelection && (
        <div className="text-center mb-8">
          <Button
            size="lg"
            onClick={startTimer}
            className="w-48 h-48 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 text-white font-bold text-xl shadow-xl hover:scale-105 transition-transform"
          >
            <div className="flex flex-col items-center gap-2">
              <Timer className="w-12 h-12" />
              <span>Start Timer</span>
            </div>
          </Button>
        </div>
      )}

      {/* Sticker Selection */}
      {showStickerSelection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-white m-4 max-w-sm w-full">
            <CardHeader>
              <CardTitle className="text-center text-lg text-purple-700">
                Great job! Pick a sticker! 🎉
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 mb-4">
                {stickers.map((sticker, index) => (
                  <button
                    key={index}
                    onClick={() => selectSticker(sticker)}
                    className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center text-2xl hover:bg-purple-200 hover:scale-110 transition-all border-2 border-purple-200"
                  >
                    {sticker}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sticker Board Preview */}
      <div className="mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-purple-200">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-purple-700">My Sticker Board</h3>
            </div>
            <div className="grid grid-cols-4 gap-2 min-h-[100px] bg-white rounded-lg p-4 border-2 border-dashed border-purple-300">
              {Array.from({ length: stickersEarned }).map((_, i) => (
                <div key={i} className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-xl animate-bounce-subtle">
                  {stickers[i % stickers.length]}
                </div>
              ))}
              {stickersEarned === 0 && (
                <div className="col-span-4 text-center text-purple-600 py-4">
                  Complete potty time to earn stickers! 🌟
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accident Button (corner, parent use) */}
      <button
        onMouseDown={(e) => {
          // Long-press protection: 2 seconds
          const button = e.currentTarget
          button.style.background = 'rgba(239, 68, 68, 0.3)'
          
          const timeout = setTimeout(() => {
            handleAccident()
          }, 2000)
          
          const cleanup = () => {
            clearTimeout(timeout)
            button.style.background = ''
            document.removeEventListener('mouseup', cleanup)
          }
          
          document.addEventListener('mouseup', cleanup)
        }}
        className="fixed top-4 right-4 w-12 h-12 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center shadow-lg border-2 border-red-300 opacity-30 hover:opacity-100 transition-all"
      >
        <Droplet className="w-6 h-6 text-red-600" />
      </button>

      {/* Navigation Hint */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-2 h-2 bg-purple-200 rounded-full"></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
          <div className="w-2 h-2 bg-purple-200 rounded-full"></div>
          <div className="w-2 h-2 bg-purple-200 rounded-full"></div>
        </div>
        <p className="text-sm text-purple-600">👆 Swipe to explore more!</p>
      </div>
    </div>
  )
}