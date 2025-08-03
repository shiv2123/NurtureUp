'use client'

import React from 'react'
import { useStageContext, useStageTheme } from '@/contexts/StageContext'
import { useStageNavigation } from '@/hooks/useStage'
import { cn } from '@/lib/utils'
import { 
  Home, 
  Calendar, 
  BookOpen, 
  User, 
  Clock,
  GamepadIcon,
  CheckSquare,
  Edit,
  TrendingUp,
  GraduationCap,
  Wallet,
  Smartphone,
  CalendarDays,
  Heart
} from 'lucide-react'

// Icon mapping for navigation tabs
const ICON_MAP = {
  home: Home,
  calendar: Calendar,
  'calendar-days': CalendarDays,
  book: BookOpen,
  'book-open': BookOpen,
  user: User,
  clock: Clock,
  'gamepad-2': GamepadIcon,
  'check-square': CheckSquare,
  edit: Edit,
  'trending-up': TrendingUp,
  'graduation-cap': GraduationCap,
  wallet: Wallet,
  smartphone: Smartphone,
  heart: Heart,
}

interface StageNavigationProps {
  activeTab?: string
  onTabChange?: (tabId: string) => void
  className?: string
}

export function StageNavigation({ activeTab, onTabChange, className }: StageNavigationProps) {
  const { state } = useStageContext()
  const { theme, stage, isChildUI } = useStageTheme()
  
  // Get navigation config for current stage
  const currentStage = state.currentUser === 'parent' ? state.parentStage : state.childStage
  const navigationConfig = useStageNavigation(currentStage)
  
  if (!navigationConfig || !currentStage) {
    return null
  }
  
  const handleTabClick = (tabId: string) => {
    onTabChange?.(tabId)
  }
  
  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 px-4 py-2",
        "safe-area-inset-bottom",
        isChildUI && "pb-4", // Extra padding for child UI
        className
      )}
      style={{
        backgroundColor: isChildUI ? 'var(--surface-light)' : 'white',
      }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navigationConfig.tabs
          .sort((a, b) => a.order - b.order)
          .map((tab) => {
            const IconComponent = ICON_MAP[tab.icon as keyof typeof ICON_MAP] || Home
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-normal",
                  "min-w-[60px] min-h-[52px]", // Ensure 44px+ touch targets
                  isChildUI && "min-h-[60px] min-w-[68px]", // Larger for child UI
                  isActive
                    ? "text-white shadow-sm scale-105"
                    : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50"
                )}
                style={
                  isActive
                    ? {
                        backgroundColor: theme?.primary || '#4F8EF7',
                        transform: 'translateY(-2px)',
                      }
                    : {}
                }
                aria-label={tab.label}
              >
                <IconComponent 
                  size={isChildUI ? 28 : 24} 
                  className="mb-1" 
                />
                <span 
                  className={cn(
                    "text-xs font-medium",
                    isChildUI && "text-sm" // Larger text for child UI
                  )}
                >
                  {tab.label}
                </span>
                
                {/* Active indicator */}
                {isActive && (
                  <div 
                    className="absolute -top-1 w-1 h-1 rounded-full"
                    style={{ backgroundColor: theme?.primary || '#4F8EF7' }}
                  />
                )}
              </button>
            )
          })}
      </div>
      
      {/* Stage transition preview banner */}
      {state.transitionPending && (
        <div className="absolute -top-12 left-4 right-4">
          <div className="bg-secondary text-neutral-900 text-sm px-4 py-2 rounded-lg shadow-md flex items-center justify-between">
            <span>New features coming soon! 🎉</span>
            <button 
              className="text-xs underline font-medium"
              onClick={() => {
                // Handle preview mode
              }}
            >
              Preview
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

// Desktop sidebar navigation for larger screens
export function StageNavigationSidebar({ activeTab, onTabChange, className }: StageNavigationProps) {
  const { state } = useStageContext()
  const { theme, stage, isChildUI } = useStageTheme()
  
  const currentStage = state.currentUser === 'parent' ? state.parentStage : state.childStage
  const navigationConfig = useStageNavigation(currentStage)
  
  if (!navigationConfig || !currentStage) {
    return null
  }
  
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full w-64 bg-surface border-r border-neutral-200 p-6 z-40",
        "hidden lg:block", // Only show on large screens
        className
      )}
    >
      {/* Stage indicator */}
      <div className="mb-8">
        <h2 className="font-display text-lg font-semibold text-neutral-900 mb-2">
          NurtureUp
        </h2>
        <div 
          className="text-sm px-3 py-1 rounded-full text-white font-medium"
          style={{ backgroundColor: theme?.primary || '#4F8EF7' }}
        >
          {state.stageConfig?.displayName}
        </div>
      </div>
      
      {/* Navigation items */}
      <nav className="space-y-2">
        {navigationConfig.tabs
          .sort((a, b) => a.order - b.order)
          .map((tab) => {
            const IconComponent = ICON_MAP[tab.icon as keyof typeof ICON_MAP] || Home
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-normal text-left",
                  isActive
                    ? "text-white shadow-sm"
                    : "text-neutral-700 hover:bg-neutral-100"
                )}
                style={
                  isActive
                    ? { backgroundColor: theme?.primary || '#4F8EF7' }
                    : {}
                }
              >
                <IconComponent size={20} />
                <span className="font-medium">{tab.label}</span>
              </button>
            )
          })}
      </nav>
    </aside>
  )
}

export default StageNavigation