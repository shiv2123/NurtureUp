'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

/**
 * Early Childhood Stage Layout (Blueprint 5.2)
 * 
 * Per blueprint:
 * - Bottom nav bar with four icon+label buttons (text below icon for emerging readers)
 * - Home 🏡 – Daily Quest & Star Bank
 * - Chores ✅ – interactive board & reward store
 * - Learn 📚 – phonics arcade & counting games  
 * - Avatar 🎨 – dress-up & room decor
 * - Secret parent override: triple-tap logo + 2-s hold
 */
export default function EarlyChildhoodLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [audioPlayed, setAudioPlayed] = useState<string[]>([])

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: '🏡',
      path: '/child/early-childhood/home',
      description: 'Daily Quest and Star Bank'
    },
    {
      id: 'chores',
      label: 'Chores', 
      icon: '✅',
      path: '/child/early-childhood/chores',
      description: 'Interactive board and reward store'
    },
    {
      id: 'learn',
      label: 'Learn',
      icon: '📚', 
      path: '/child/early-childhood/learn',
      description: 'Phonics arcade and counting games'
    },
    {
      id: 'avatar',
      label: 'Avatar',
      icon: '🎨',
      path: '/child/early-childhood/avatar', 
      description: 'Dress-up and room decor'
    }
  ]

  const handleNavClick = (item: typeof navItems[0]) => {
    // Play audio label for emerging readers (per blueprint)
    if (!audioPlayed.includes(item.id)) {
      // TODO: Add text-to-speech for item.label + description
      console.log(`Speaking: ${item.label} - ${item.description}`)
      setAudioPlayed(prev => [...prev, item.id])
    }
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(25) // 25ms gentle vibration
    }
  }

  const isActive = (path: string) => pathname === path

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
      {/* Main Content */}
      <main className="pb-24">
        {children}
      </main>

      {/* Bottom Navigation Bar with Labels */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t-4 border-blue-200 shadow-lg z-50">
        <div className="flex justify-around items-center py-2 px-4">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.path}
              onClick={() => handleNavClick(item)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 min-w-[70px] ${
                isActive(item.path)
                  ? 'bg-blue-200 shadow-md transform scale-105'
                  : 'hover:bg-blue-100 hover:scale-102'
              }`}
            >
              {/* Icon - appropriate size for early childhood */}
              <div className={`text-3xl mb-1 transition-all duration-300 ${
                isActive(item.path) ? 'animate-pulse' : ''
              }`}>
                {item.icon}
              </div>
              
              {/* Label for emerging readers */}
              <span className={`text-sm font-bold transition-colors ${
                isActive(item.path) ? 'text-blue-700' : 'text-gray-600'
              }`}>
                {item.label}
              </span>
              
              {/* Audio indicator for first-time users */}
              {!audioPlayed.includes(item.id) && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse border-2 border-white" />
              )}
            </Link>
          ))}
        </div>
        
        {/* Safe area padding */}
        <div className="h-2 bg-white/95" />
      </nav>

      {/* Secret Parent Override Gesture Handler */}
      <div
        className="fixed top-4 left-4 w-16 h-16 z-40 opacity-0"
        onTouchStart={(e) => {
          let tapCount = 0
          const handleTripleTap = () => {
            tapCount++
            if (tapCount === 3) {
              // Hold for 2 seconds to open parent settings
              const holdTimeout = setTimeout(() => {
                // TODO: Open parent PIN entry modal
                alert('Parent settings access (TODO: Implement PIN)')
              }, 2000)
              
              const cleanup = () => {
                clearTimeout(holdTimeout)
                document.removeEventListener('touchend', cleanup)
              }
              document.addEventListener('touchend', cleanup)
            } else {
              // Reset if not triple-tap
              setTimeout(() => { tapCount = 0 }, 500)
            }
          }
          handleTripleTap()
        }}
      />
    </div>
  )
}