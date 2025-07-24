import { useState, useCallback } from 'react'

interface BadgeData {
  id: string
  name: string
  description: string
  icon: string
  category: string
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum'
}

interface CelebrationState {
  showBadgeCelebration: boolean
  currentBadge: BadgeData | null
  showConfetti: boolean
  celebrationQueue: BadgeData[]
}

export function useCelebration() {
  const [state, setState] = useState<CelebrationState>({
    showBadgeCelebration: false,
    currentBadge: null,
    showConfetti: false,
    celebrationQueue: []
  })

  // Trigger badge celebration
  const celebrateBadge = useCallback((badge: BadgeData) => {
    setState(prevState => ({
      ...prevState,
      celebrationQueue: [...prevState.celebrationQueue, badge]
    }))

    // Process the queue if not already processing
    processQueue()
  }, [])

  // Process celebration queue
  const processQueue = useCallback(() => {
    setState(prevState => {
      if (prevState.showBadgeCelebration || prevState.celebrationQueue.length === 0) {
        return prevState
      }

      const [nextBadge, ...remainingQueue] = prevState.celebrationQueue
      
      return {
        ...prevState,
        showBadgeCelebration: true,
        currentBadge: nextBadge,
        celebrationQueue: remainingQueue,
        showConfetti: true
      }
    })
  }, [])

  // Close badge celebration
  const closeBadgeCelebration = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      showBadgeCelebration: false,
      currentBadge: null,
      showConfetti: false
    }))

    // Process next badge in queue after a delay
    setTimeout(() => {
      processQueue()
    }, 500)
  }, [processQueue])

  // Trigger generic confetti celebration
  const celebrateConfetti = useCallback((duration = 2000) => {
    setState(prevState => ({
      ...prevState,
      showConfetti: true
    }))

    setTimeout(() => {
      setState(prevState => ({
        ...prevState,
        showConfetti: false
      }))
    }, duration)
  }, [])

  // Trigger task completion celebration
  const celebrateTaskCompletion = useCallback((taskTitle: string, earnedStars: number) => {
    // Play confetti
    celebrateConfetti(1500)

    // Optional: Show toast notification
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('task-completed', {
        detail: { taskTitle, earnedStars }
      }))
    }
  }, [celebrateConfetti])

  // Trigger level up celebration
  const celebrateLevelUp = useCallback((newLevel: number) => {
    celebrateConfetti(3000)

    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('level-up', {
        detail: { level: newLevel }
      }))
    }
  }, [celebrateConfetti])

  // Mass celebrate multiple badges (e.g., when multiple badges are earned at once)
  const celebrateMultipleBadges = useCallback((badges: BadgeData[]) => {
    // Sort badges by difficulty (bronze -> platinum) for better flow
    const sortedBadges = [...badges].sort((a, b) => {
      const difficultyOrder = { bronze: 0, silver: 1, gold: 2, platinum: 3 }
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
    })

    setState(prevState => ({
      ...prevState,
      celebrationQueue: [...prevState.celebrationQueue, ...sortedBadges]
    }))

    processQueue()
  }, [processQueue])

  return {
    // State
    showBadgeCelebration: state.showBadgeCelebration,
    currentBadge: state.currentBadge,
    showConfetti: state.showConfetti,
    hasQueuedCelebrations: state.celebrationQueue.length > 0,
    
    // Actions
    celebrateBadge,
    celebrateMultipleBadges,
    celebrateTaskCompletion,
    celebrateLevelUp,
    celebrateConfetti,
    closeBadgeCelebration,
    
    // Queue management
    queueLength: state.celebrationQueue.length
  }
}