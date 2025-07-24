'use client'

import { useEffect, useState } from 'react'

interface ConfettiPiece {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  rotationSpeed: number
  color: string
  emoji?: string
  size: number
  gravity: number
}

interface ConfettiAnimationProps {
  isActive: boolean
  duration?: number
  intensity?: 'low' | 'medium' | 'high'
  colors?: string[]
  emojis?: string[]
  onComplete?: () => void
}

export function ConfettiAnimation({
  isActive,
  duration = 3000,
  intensity = 'medium',
  colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#FFB6C1', '#F0E68C', '#87CEEB', '#98FB98'
  ],
  emojis = ['🎉', '⭐', '🎊', '✨', '🏆', '🎈', '🌟'],
  onComplete
}: ConfettiAnimationProps) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const intensityConfig = {
    low: { count: 30, spread: 60, velocity: 3 },
    medium: { count: 50, spread: 80, velocity: 5 },
    high: { count: 80, spread: 100, velocity: 7 }
  }

  const config = intensityConfig[intensity]

  useEffect(() => {
    if (isActive && !isRunning) {
      startConfetti()
    } else if (!isActive) {
      setConfetti([])
      setIsRunning(false)
    }
  }, [isActive])

  const createConfettiPiece = (id: number): ConfettiPiece => {
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    
    const angle = (Math.random() - 0.5) * (config.spread * Math.PI / 180)
    const velocity = config.velocity + Math.random() * 3
    const useEmoji = Math.random() < 0.3 // 30% chance for emoji
    
    return {
      id,
      x: centerX + (Math.random() - 0.5) * 100,
      y: centerY + (Math.random() - 0.5) * 50,
      vx: Math.sin(angle) * velocity,
      vy: -Math.abs(Math.cos(angle) * velocity) - Math.random() * 3,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      color: useEmoji ? 'transparent' : colors[Math.floor(Math.random() * colors.length)],
      emoji: useEmoji ? emojis[Math.floor(Math.random() * emojis.length)] : undefined,
      size: useEmoji ? 20 + Math.random() * 10 : 8 + Math.random() * 6,
      gravity: 0.3 + Math.random() * 0.2
    }
  }

  const startConfetti = () => {
    setIsRunning(true)
    const pieces: ConfettiPiece[] = []
    
    for (let i = 0; i < config.count; i++) {
      pieces.push(createConfettiPiece(i))
    }
    
    setConfetti(pieces)
    
    // Animation loop
    const animate = () => {
      setConfetti(currentConfetti => 
        currentConfetti
          .map(piece => ({
            ...piece,
            x: piece.x + piece.vx,
            y: piece.y + piece.vy,
            vy: piece.vy + piece.gravity,
            rotation: piece.rotation + piece.rotationSpeed
          }))
          .filter(piece => 
            piece.y < window.innerHeight + 50 && 
            piece.x > -50 && 
            piece.x < window.innerWidth + 50
          )
      )
    }

    const animationId = setInterval(animate, 16) // ~60fps

    // Stop animation after duration
    setTimeout(() => {
      clearInterval(animationId)
      setIsRunning(false)
      setTimeout(() => {
        setConfetti([])
        onComplete?.()
      }, 1000) // Allow pieces to fall off screen
    }, duration)
  }

  if (!isActive && confetti.length === 0) return null

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      {confetti.map(piece => (
        <div
          key={piece.id}
          className="absolute"
          style={{
            left: piece.x,
            top: piece.y,
            transform: `rotate(${piece.rotation}deg)`,
            fontSize: piece.emoji ? `${piece.size}px` : undefined,
            width: piece.emoji ? 'auto' : `${piece.size}px`,
            height: piece.emoji ? 'auto' : `${piece.size}px`,
            backgroundColor: piece.color,
            borderRadius: piece.emoji ? '0' : '2px'
          }}
        >
          {piece.emoji || ''}
        </div>
      ))}
    </div>
  )
}