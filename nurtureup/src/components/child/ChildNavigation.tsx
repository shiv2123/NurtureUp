'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Sword,
  Compass,
  Heart,
  User
} from 'lucide-react'

// Modern 4-tab bottom navigation for children (age-adaptive)
const navItems = [
  {
    href: '/child/quest',
    label: 'Quest',
    icon: Sword,
    emoji: '⚔️',
    description: 'Gamified task dashboard with virtual pet'
  },
  {
    href: '/child/explore',
    label: 'Explore',
    icon: Compass,
    emoji: '🌟',
    description: 'Age-appropriate content discovery & learning games'
  },
  {
    href: '/child/family',
    label: 'Family',
    icon: Heart,
    emoji: '👨‍👩‍👧‍👦',
    description: 'Communication with parents & shared calendar'
  },
  {
    href: '/child/me',
    label: 'Me',
    icon: User,
    emoji: '👑',
    description: 'Profile customization, achievements & rewards shopping'
  }
]

export function ChildNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 header-glass border-t border-white/20 z-50">
      <div className="container-modern">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-300 min-w-[72px] group hover-scale',
                  isActive 
                    ? 'text-white bg-gradient-secondary shadow-lg' 
                    : 'text-slate-600 hover:text-purple-600 hover:bg-white/50'
                )}
              >
                <div className="text-2xl mb-1 group-hover:scale-110 transition-transform duration-300">
                  {item.emoji}
                </div>
                <span className="text-xs font-bold leading-none">
                  {item.label}
                </span>
                {/* Magical sparkle indicator */}
                {isActive && (
                  <div className="w-2 h-2 bg-white rounded-full mt-1 animate-pulse shadow-lg" />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
} 