import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: string
  rarity: string
  progress: number
  requirement: number
  unlocked: boolean
  earnedAt?: string
  level: string
  color: string
}

interface LeaderboardMember {
  id: string
  name: string
  avatar: string
  stars: number
  totalStars: number
  rank: number
  isMe: boolean
}

interface ChildStats {
  totalStars: number
  totalBadges: number
  weeklyStars: number
}

interface BadgesData {
  badges: Badge[]
  earnedBadges: Badge[]
  leaderboard: LeaderboardMember[]
  childStats: ChildStats
  newlyEarned: Badge[]
}

export function useBadges(childId: string | null) {
  const { data: session } = useSession()
  const [data, setData] = useState<BadgesData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBadges = useCallback(async () => {
    if (!childId || !session) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/child/badges?childId=${childId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch badges data')
      }
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [childId, session])

  const shareBadge = async (badgeId: string) => {
    if (!childId || !session) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/child/badges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childId,
          action: 'share_badge',
          badgeId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to share badge')
      }

      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const sendChallenge = async (challengeText: string, targetChildId: string) => {
    if (!childId || !session) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/child/badges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childId,
          action: 'send_challenge',
          challengeText,
          targetChildId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send challenge')
      }

      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBadges()
  }, [fetchBadges])

  // Helper functions
  const getBadgesByCategory = (category: string) => {
    return data?.badges?.filter(badge => badge.category === category) || []
  }

  const getUnlockedBadges = () => {
    return data?.badges?.filter(badge => badge.unlocked) || []
  }

  const getBadgesInProgress = () => {
    return data?.badges?.filter(badge => !badge.unlocked && badge.progress > 0) || []
  }

  const getBadgeProgress = (badgeId: string) => {
    const badge = data?.badges?.find(b => b.id === badgeId)
    if (!badge) return 0
    return Math.round((badge.progress / badge.requirement) * 100)
  }

  const getBadgeStatusColor = (badge: Badge) => {
    if (badge.unlocked) {
      return badge.level === 'gold' ? 'border-yellow-400 bg-yellow-50' :
             badge.level === 'silver' ? 'border-gray-400 bg-gray-50' :
             badge.level === 'bronze' ? 'border-amber-400 bg-amber-50' :
             'border-purple-400 bg-purple-50'
    }
    return 'border-gray-300 bg-gray-100 opacity-60'
  }

  const getRankSuffix = (rank: number) => {
    if (rank === 1) return 'st'
    if (rank === 2) return 'nd'
    if (rank === 3) return 'rd'
    return 'th'
  }

  const getMyRank = () => {
    return data?.leaderboard?.find(member => member.isMe)?.rank || 0
  }

  const canSendChallenge = () => {
    // Check if there are other children in the family to challenge
    return data?.leaderboard?.filter(member => !member.isMe).length > 0
  }

  const getSiblings = () => {
    return data?.leaderboard?.filter(member => !member.isMe) || []
  }

  const getCompletionRate = () => {
    if (!data?.badges?.length) return 0
    const unlockedCount = data.badges.filter(b => b.unlocked).length
    return Math.round((unlockedCount / data.badges.length) * 100)
  }

  const getNextBadgeToEarn = () => {
    return data?.badges
      ?.filter(badge => !badge.unlocked)
      ?.sort((a, b) => (b.progress / b.requirement) - (a.progress / a.requirement))[0]
  }

  const getCategoryStats = () => {
    if (!data?.badges) return {}
    
    return data.badges.reduce((stats, badge) => {
      if (!stats[badge.category]) {
        stats[badge.category] = { total: 0, earned: 0 }
      }
      stats[badge.category].total++
      if (badge.unlocked) {
        stats[badge.category].earned++
      }
      return stats
    }, {} as Record<string, { total: number; earned: number }>)
  }

  return {
    data,
    isLoading,
    error,
    shareBadge,
    sendChallenge,
    refetch: fetchBadges,
    // Helper functions
    getBadgesByCategory,
    getUnlockedBadges,
    getBadgesInProgress,
    getBadgeProgress,
    getBadgeStatusColor,
    getRankSuffix,
    getMyRank,
    canSendChallenge,
    getSiblings,
    getCompletionRate,
    getNextBadgeToEarn,
    getCategoryStats,
  }
}