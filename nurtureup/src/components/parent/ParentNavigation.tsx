'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  CheckSquare,
  BarChart3,
  Users,
  LogOut,
  Calendar,
  BookOpen,
  User,
  Edit,
  TrendingUp,
  Clock,
  Gamepad2,
  GraduationCap,
  Wallet,
  Smartphone,
  CalendarDays,
  Heart
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useStageContext } from '@/contexts/StageContext'
import { getParentNavigationConfig } from '@/lib/stage-engine'

// Stage-aware navigation based on available pages
const getStageNavigationItems = (parentStage: string) => {
  switch (parentStage) {
    case 'ttc_pregnancy':
      return [
        { href: '/parent/home', label: 'Home', icon: Home, description: 'Daily snapshot and quick actions' },
        { href: '/parent/timeline', label: 'Timeline', icon: Calendar, description: 'Log & track important events' },
        { href: '/parent/progress', label: 'Progress', icon: BookOpen, description: 'Growth and development tracking' },
        { href: '/parent/settings', label: 'Settings', icon: User, description: 'Family settings and preferences' }
      ]
    case 'newborn_infant':
      return [
        { href: '/parent/home', label: 'Home', icon: Home, description: 'Live care snapshot and quick actions' },
        { href: '/parent/monitor', label: 'Monitor', icon: Edit, description: 'Feeds, sleep, diapers, health' },
        { href: '/parent/progress', label: 'Progress', icon: TrendingUp, description: 'Growth tracking & milestones' },
        { href: '/parent/settings', label: 'Settings', icon: User, description: 'Child info, caregivers, preferences' }
      ]
    case 'toddler':
      return [
        { href: '/parent/home', label: 'Home', icon: Home, description: 'Real-time routine & rewards snapshot' },
        { href: '/parent/tasks', label: 'Tasks', icon: Clock, description: 'Behavior tracking & task management' },
        { href: '/parent/monitor', label: 'Monitor', icon: Gamepad2, description: 'Activity and development monitoring' },
        { href: '/parent/settings', label: 'Settings', icon: User, description: 'Child settings & family management' }
      ]
    case 'early_childhood':
      return [
        { href: '/parent/home', label: 'Home', icon: Home, description: 'Overview dashboard (agenda + stars)' },
        { href: '/parent/tasks', label: 'Tasks', icon: CheckSquare, description: 'Chores, rewards & task board' },
        { href: '/parent/progress', label: 'Progress', icon: BookOpen, description: 'Learning games & educational progress' },
        { href: '/parent/family', label: 'Family', icon: Calendar, description: 'Family schedule & activities' }
      ]
    case 'school_age':
      return [
        { href: '/parent/home', label: 'Home', icon: Home, description: 'Agenda snapshot & quick actions' },
        { href: '/parent/tasks', label: 'Tasks', icon: GraduationCap, description: 'Homework & school activities' },
        { href: '/parent/rewards', label: 'Rewards', icon: Wallet, description: 'Allowance & spending tracking' },
        { href: '/parent/monitor', label: 'Monitor', icon: Smartphone, description: 'Screen time & activity monitoring' }
      ]
    case 'adolescence':
      return [
        { href: '/parent/home', label: 'Home', icon: Home, description: 'Today Feed & quick actions' },
        { href: '/parent/family', label: 'Family', icon: CalendarDays, description: 'Family calendar & planning' },
        { href: '/parent/progress', label: 'Progress', icon: Heart, description: 'Wellbeing & development tracking' },
        { href: '/parent/settings', label: 'Settings', icon: User, description: 'Privacy settings & preferences' }
      ]
    default:
      // Fallback navigation using available pages
      return [
        { href: '/parent/home', label: 'Home', icon: Home, description: 'Daily snapshot and quick actions' },
        { href: '/parent/tasks', label: 'Tasks', icon: CheckSquare, description: 'Task management & assignments' },
        { href: '/parent/monitor', label: 'Monitor', icon: BarChart3, description: 'Activity monitoring & insights' },
        { href: '/parent/settings', label: 'Settings', icon: User, description: 'Family settings and preferences' }
      ]
  }
}

export function ParentNavigation() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const { state } = useStageContext()
  
  // Get stage-appropriate navigation items
  const navItems = getStageNavigationItems(state.parentStage || 'ttc_pregnancy')

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
                  'flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-300 min-w-[64px] group hover-scale',
                  isActive 
                    ? 'text-white bg-gradient-primary shadow-lg' 
                    : 'text-slate-600 hover:text-emerald-600 hover:bg-white/50'
                )}
              >
                <Icon className={cn(
                  'w-6 h-6 transition-transform duration-300',
                  isActive ? 'scale-110' : 'group-hover:scale-105'
                )} />
                <span className="text-xs font-semibold leading-none">
                  {item.label}
                </span>
                {/* Active indicator */}
                {isActive && (
                  <div className="w-2 h-2 bg-white rounded-full mt-1 animate-pulse shadow-lg" />
                )}
              </Link>
            )
          })}
          
          {/* Logout button - always present but subtle */}
          <button
            onClick={logout}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-300 min-w-[64px] text-rose-500 hover:text-rose-600 hover:bg-rose-50 hover-scale"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-xs font-semibold leading-none">Exit</span>
          </button>
        </div>
      </div>
    </nav>
  )
} 