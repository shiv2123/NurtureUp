'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useCelebration } from '@/hooks/useCelebration'
import { BadgeCelebration } from '@/components/shared/BadgeCelebration'
import { ConfettiAnimation } from '@/components/shared/ConfettiAnimation'

interface BadgeData {
  id: string
  name: string
  description: string
  icon: string
  category: string
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum'
}

interface CelebrationContextType {
  celebrateBadge: (badge: BadgeData) => void
  celebrateMultipleBadges: (badges: BadgeData[]) => void
  celebrateTaskCompletion: (taskTitle: string, earnedStars: number) => void
  celebrateLevelUp: (newLevel: number) => void
  celebrateConfetti: (duration?: number) => void
  hasQueuedCelebrations: boolean
  queueLength: number
}

const CelebrationContext = createContext<CelebrationContextType | undefined>(undefined)

export function useCelebrationContext() {
  const context = useContext(CelebrationContext)
  if (context === undefined) {
    throw new Error('useCelebrationContext must be used within a CelebrationProvider')
  }
  return context
}

interface CelebrationProviderProps {
  children: ReactNode
}

export function CelebrationProvider({ children }: CelebrationProviderProps) {
  const {
    showBadgeCelebration,
    currentBadge,
    showConfetti,
    hasQueuedCelebrations,
    queueLength,
    celebrateBadge,
    celebrateMultipleBadges,
    celebrateTaskCompletion,
    celebrateLevelUp,
    celebrateConfetti,
    closeBadgeCelebration
  } = useCelebration()

  const contextValue: CelebrationContextType = {
    celebrateBadge,
    celebrateMultipleBadges,
    celebrateTaskCompletion,
    celebrateLevelUp,
    celebrateConfetti,
    hasQueuedCelebrations,
    queueLength
  }

  return (
    <CelebrationContext.Provider value={contextValue}>
      {children}
      
      {/* Global Celebration Components */}
      <BadgeCelebration
        badge={currentBadge}
        isVisible={showBadgeCelebration}
        onClose={closeBadgeCelebration}
      />
      
      <ConfettiAnimation
        isActive={showConfetti && !showBadgeCelebration} // Don't show if badge celebration is active
        intensity="medium"
        duration={2000}
      />
    </CelebrationContext.Provider>
  )
}