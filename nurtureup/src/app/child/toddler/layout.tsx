'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

/**
 * Toddler Stage Layout (Blueprint 4.2)
 * 
 * Per blueprint:
 * - Persistent bottom nav bar with four icon-only buttons (labels announced via audio on first use)
 * - Home 🏠 – Star Jar & routine rings
 * - Potty 🚽 – potty monster timer  
 * - Play 🎈 – curated play ideas & mini-games
 * - Calm 🌈 – emotion wheel & soothing tools
 * - Parent settings hide behind secret gesture; no visible settings icon for child
 */
export default function ToddlerLayout({
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
      path: '/child/toddler/home',
      description: 'Star Jar and routine rings'
    },
    {
      id: 'potty',
      label: 'Potty', 
      icon: '🚽',
      path: '/child/toddler/potty',
      description: 'Potty monster timer'
    },
    {
      id: 'play',
      label: 'Play',
      icon: '🎈', 
      path: '/child/toddler/play',
      description: 'Fun play ideas and mini-games'
    },
    {
      id: 'calm',
      label: 'Calm',
      icon: '🌈',
      path: '/child/toddler/calm', 
      description: 'Emotion wheel and soothing tools'
    }
  ]

  const handleNavClick = (item: typeof navItems[0]) => {
    // Play audio label on first use (per blueprint)
    if (!audioPlayed.includes(item.id)) {
      // TODO: Add text-to-speech for item.label
      console.log(`Speaking: ${item.label} - ${item.description}`)
      setAudioPlayed(prev => [...prev, item.id])
    }
    
    // Haptic feedback for toddlers
    if ('vibrate' in navigator) {
      navigator.vibrate(30) // 30ms gentle vibration
    }
  }

  const isActive = (path: string) => pathname === path

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-yellow-50 to-orange-100">
      {/* Main Content */}
      <main className="pb-20">
        {children}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t-4 border-orange-200 shadow-lg z-50">
        <div className="flex justify-around items-center py-3 px-4">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.path}
              onClick={() => handleNavClick(item)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 min-w-[64px] ${
                isActive(item.path)
                  ? 'bg-orange-200 shadow-md transform scale-110'
                  : 'hover:bg-orange-100 hover:scale-105'
              }`}
            >
              {/* Icon - large for toddler fingers */}
              <div className={`text-4xl mb-1 transition-all duration-300 ${
                isActive(item.path) ? 'animate-bounce' : ''
              }`}>
                {item.icon}
              </div>
              
              {/* Audio indicator for first-time users */}
              {!audioPlayed.includes(item.id) && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse border-2 border-white" />
              )}
            </Link>
          ))}
        </div>
        
        {/* Safe area padding for devices with home indicator */}
        <div className="h-2 bg-white/90" />
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