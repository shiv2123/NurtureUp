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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50" style={{boxShadow: 'var(--shadow-medium)'}}>
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-200 min-w-[64px]',
                  isActive 
                    ? 'text-child-primary' 
                    : 'text-gray-500 hover:text-child-primary'
                )}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium font-child">
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
} 