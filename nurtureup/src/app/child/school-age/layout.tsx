'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

/**
 * School Age Stage Layout (Blueprint 6.2)
 * 
 * Per blueprint:
 * - Bottom nav bar with four icon+label buttons
 * - Home 🏠 – Smart Agenda & Streaks
 * - School 📓 – homework & activities board
 * - Wallet 💰 – allowance balance & spend log  
 * - Badges 🏅 – leaderboard & achievements
 * - Parent override still via triple-tap logo + 2-s hold (PIN)
 */
export default function SchoolAgeLayout({
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
      icon: '🏠',
      path: '/child/school-age/home',
      description: 'Smart Agenda and Streaks'
    },
    {
      id: 'school',
      label: 'School', 
      icon: '📓',
      path: '/child/school-age/school',
      description: 'Homework and activities board'
    },
    {
      id: 'wallet',
      label: 'Wallet',
      icon: '💰', 
      path: '/child/school-age/wallet',
      description: 'Allowance balance and spend log'
    },
    {
      id: 'badges',
      label: 'Badges',
      icon: '🏅',
      path: '/child/school-age/badges', 
      description: 'Leaderboard and achievements'
    }
  ]

  const handleNavClick = (item: typeof navItems[0]) => {
    // Play audio label for school-age children
    if (!audioPlayed.includes(item.id)) {
      // TODO: Add text-to-speech for item.label + description
      console.log(`Speaking: ${item.label} - ${item.description}`)
      setAudioPlayed(prev => [...prev, item.id])
    }
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(20) // 20ms subtle vibration for older kids
    }
  }

  const isActive = (path: string) => pathname === path

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Main Content */}
      <main className="pb-20">
        {children}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t-2 border-blue-200 shadow-lg z-50">
        <div className="flex justify-around items-center py-2 px-4">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.path}
              onClick={() => handleNavClick(item)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 min-w-[65px] ${
                isActive(item.path)
                  ? 'bg-blue-100 shadow-md transform scale-105 text-blue-700'
                  : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:scale-102'
              }`}
            >
              {/* Icon - appropriate size for school age */}
              <div className={`text-2xl mb-1 transition-all duration-300 ${
                isActive(item.path) ? 'animate-pulse' : ''
              }`}>
                {item.icon}
              </div>
              
              {/* Label - school age can read well */}
              <span className={`text-xs font-bold transition-colors ${
                isActive(item.path) ? 'text-blue-700' : 'text-gray-600'
              }`}>
                {item.label}
              </span>
              
              {/* Audio indicator for first-time users */}
              {!audioPlayed.includes(item.id) && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full animate-pulse border border-white" />
              )}
            </Link>
          ))}
        </div>
        
        {/* Safe area padding */}
        <div className="h-1 bg-white/95" />
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