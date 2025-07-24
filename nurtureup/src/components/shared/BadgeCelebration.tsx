'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ConfettiAnimation } from './ConfettiAnimation'
import { Trophy, Star, Sparkles, X } from 'lucide-react'

interface BadgeData {
  id: string
  name: string
  description: string
  icon: string
  category: string
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum'
}

interface BadgeCelebrationProps {
  badge: BadgeData | null
  isVisible: boolean
  onClose: () => void
  autoClose?: boolean
  autoCloseDelay?: number
}

export function BadgeCelebration({
  badge,
  isVisible,
  onClose,
  autoClose = true,
  autoCloseDelay = 4000
}: BadgeCelebrationProps) {
  const [showAnimation, setShowAnimation] = useState(false)
  const [animationPhase, setAnimationPhase] = useState<'entrance' | 'display' | 'exit'>('entrance')

  useEffect(() => {
    if (isVisible && badge) {
      setShowAnimation(true)
      setAnimationPhase('entrance')
      
      // Transition to display phase
      const displayTimer = setTimeout(() => {
        setAnimationPhase('display')
      }, 500)

      // Auto close if enabled
      if (autoClose) {
        const closeTimer = setTimeout(() => {
          setAnimationPhase('exit')
          setTimeout(() => {
            setShowAnimation(false)
            onClose()
          }, 500)
        }, autoCloseDelay)

        return () => {
          clearTimeout(displayTimer)
          clearTimeout(closeTimer)
        }
      }

      return () => clearTimeout(displayTimer)
    } else {
      setShowAnimation(false)
    }
  }, [isVisible, badge, autoClose, autoCloseDelay, onClose])

  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty) {
      case 'bronze':
        return {
          bgGradient: 'from-amber-100 to-amber-200',
          borderColor: 'border-amber-300',
          glowColor: 'shadow-amber-200',
          textColor: 'text-amber-800',
          badgeColor: 'bg-amber-100 text-amber-700'
        }
      case 'silver':
        return {
          bgGradient: 'from-slate-100 to-slate-200',
          borderColor: 'border-slate-300',
          glowColor: 'shadow-slate-200',
          textColor: 'text-black800',
          badgeColor: 'bg-slate-100 text-black700'
        }
      case 'gold':
        return {
          bgGradient: 'from-yellow-100 to-yellow-200',
          borderColor: 'border-yellow-300',
          glowColor: 'shadow-yellow-200',
          textColor: 'text-yellow-800',
          badgeColor: 'bg-yellow-100 text-yellow-700'
        }
      case 'platinum':
        return {
          bgGradient: 'from-purple-100 to-purple-200',
          borderColor: 'border-purple-300',
          glowColor: 'shadow-purple-200',
          textColor: 'text-purple-800',
          badgeColor: 'bg-purple-100 text-purple-700'
        }
      default:
        return {
          bgGradient: 'from-blue-100 to-blue-200',
          borderColor: 'border-blue-300',
          glowColor: 'shadow-blue-200',
          textColor: 'text-blue-800',
          badgeColor: 'bg-blue-100 text-blue-700'
        }
    }
  }

  const getAnimationClasses = () => {
    switch (animationPhase) {
      case 'entrance':
        return 'animate-bounce-in scale-0 opacity-0'
      case 'display':
        return 'animate-pulse-glow scale-100 opacity-100'
      case 'exit':
        return 'animate-fade-out scale-95 opacity-0'
      default:
        return ''
    }
  }

  if (!isVisible || !badge) return null

  const difficultyConfig = getDifficultyConfig(badge.difficulty)

  return (
    <>
      {/* Confetti Animation */}
      <ConfettiAnimation
        isActive={showAnimation && animationPhase === 'entrance'}
        intensity="high"
        duration={2500}
        emojis={['🎉', '🏆', '⭐', '✨', '🌟', '🎊', badge.icon]}
        colors={['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']}
      />

      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-500">
        {/* Celebration Modal */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Card 
            className={`
              relative max-w-md w-full mx-auto transform transition-all duration-500
              ${getAnimationClasses()}
              bg-gradient-to-br ${difficultyConfig.bgGradient}
              ${difficultyConfig.borderColor} border-2
              shadow-2xl ${difficultyConfig.glowColor}/50
            `}
          >
            {/* Close Button */}
            {!autoClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="absolute top-2 right-2 z-10 hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            )}

            <CardContent className="p-8 text-center relative overflow-hidden">
              {/* Background Sparkles */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-4 left-4 animate-ping">✨</div>
                <div className="absolute top-8 right-8 animate-pulse">⭐</div>
                <div className="absolute bottom-6 left-8 animate-bounce">🌟</div>
                <div className="absolute bottom-4 right-4 animate-ping">✨</div>
              </div>

              {/* Main Content */}
              <div className="relative z-10">
                {/* Badge Icon */}
                <div className="mb-4">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/80 shadow-lg animate-spin-slow">
                    <span className="text-6xl animate-bounce-subtle">
                      {badge.icon}
                    </span>
                  </div>
                </div>

                {/* Trophy Icon */}
                <div className="mb-4">
                  <Trophy className={`w-8 h-8 mx-auto ${difficultyConfig.textColor} animate-bounce`} />
                </div>

                {/* Badge Achievement Text */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-black800 mb-2 font-child">
                    🎉 New Badge Earned! 🎉
                  </h2>
                  <h3 className={`text-xl font-semibold ${difficultyConfig.textColor} mb-2`}>
                    {badge.name}
                  </h3>
                  <p className="text-black700 text-sm mb-4">
                    {badge.description}
                  </p>
                  
                  {/* Difficulty Badge */}
                  <Badge className={`${difficultyConfig.badgeColor} border-0 font-semibold capitalize`}>
                    {badge.difficulty} Badge
                  </Badge>
                </div>

                {/* Celebration Message */}
                <div className="bg-white/60 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    <span className="font-medium text-black800">Awesome Achievement!</span>
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                  </div>
                  <p className="text-sm text-black700">
                    You're doing amazing! Keep up the great work and unlock even more badges!
                  </p>
                </div>

                {/* Animated Stars */}
                <div className="flex justify-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 text-yellow-400 fill-yellow-400 animate-bounce`}
                      style={{
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: '1s'
                      }}
                    />
                  ))}
                </div>

                {/* Action Button */}
                <Button
                  onClick={onClose}
                  className={`
                    w-full bg-gradient-to-r from-yellow-400 to-orange-400 
                    hover:from-yellow-500 hover:to-orange-500 
                    text-white font-semibold shadow-lg transform transition-all
                    hover:scale-105 active:scale-95
                  `}
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Awesome!
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

// Custom CSS animations would be added to globals.css or Tailwind config
// These classes should be defined in your CSS:
/*
@keyframes bounce-in {
  0% { transform: scale(0) rotate(-360deg); opacity: 0; }
  50% { transform: scale(1.1) rotate(-180deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

@keyframes pulse-glow {
  0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(255, 215, 0, 0.3); }
  50% { transform: scale(1.05); box-shadow: 0 0 40px rgba(255, 215, 0, 0.6); }
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes bounce-subtle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.animate-bounce-in { animation: bounce-in 0.6s ease-out forwards; }
.animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
.animate-spin-slow { animation: spin-slow 8s linear infinite; }
.animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out infinite; }
.animate-fade-out { transition: all 0.5s ease-out; }
*/