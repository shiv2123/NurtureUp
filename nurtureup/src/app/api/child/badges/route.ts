import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.familyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const childId = searchParams.get('childId')
    
    if (!childId) {
      return NextResponse.json({ error: 'Child ID required' }, { status: 400 })
    }

    // Verify child belongs to family
    const child = await prisma.child.findFirst({
      where: {
        id: childId,
        familyId: session.user.familyId
      }
    })

    if (!child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 })
    }

    // Get all available badges
    const allBadges = await prisma.badge.findMany({
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    })

    // Get earned badges for this child
    const earnedBadges = await prisma.badgeEarned.findMany({
      where: { childId },
      include: { badge: true }
    })

    const earnedBadgeIds = new Set(earnedBadges.map(eb => eb.badgeId))

    // Calculate progress for each badge
    const badgesWithProgress = await Promise.all(
      allBadges.map(async (badge) => {
        const isEarned = earnedBadgeIds.has(badge.id)
        const earnedBadge = earnedBadges.find(eb => eb.badgeId === badge.id)
        
        let progress = 0
        let requirement = 1
        
        try {
          const criteria = JSON.parse(badge.criteria)
          requirement = criteria.value || 1
          
          // Calculate current progress based on badge type
          progress = await calculateBadgeProgress(childId, criteria)
        } catch (e) {
          console.error('Error parsing badge criteria:', e)
        }

        return {
          id: badge.id,
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          category: badge.category,
          rarity: badge.rarity,
          progress: Math.min(progress, requirement),
          requirement,
          unlocked: isEarned,
          earnedAt: earnedBadge?.earnedAt || null,
          level: badge.rarity, // Map rarity to level for UI compatibility
          color: getBadgeColor(badge.rarity)
        }
      })
    )

    // Get family leaderboard (weekly stars)
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Start of current week
    
    const familyMembers = await prisma.child.findMany({
      where: { familyId: session.user.familyId },
      include: {
        user: { select: { name: true } },
        completedTasks: {
          where: {
            completedAt: { gte: weekStart },
            isApproved: true
          },
          select: { starsAwarded: true }
        }
      }
    })

    const leaderboard = familyMembers.map(member => {
      const weeklyStars = member.completedTasks.reduce((sum, task) => sum + task.starsAwarded, 0)
      return {
        id: member.id,
        name: member.user.name || 'Child',
        avatar: getAvatarEmoji(member.id), // Simple emoji based on ID
        stars: weeklyStars,
        totalStars: member.totalStars,
        isMe: member.id === childId
      }
    }).sort((a, b) => b.stars - a.stars)
    .map((member, index) => ({ ...member, rank: index + 1 }))

    // Check for newly earned badges and award them
    const newlyEarned = await checkAndAwardNewBadges(childId, badgesWithProgress)

    return NextResponse.json({
      badges: badgesWithProgress,
      earnedBadges: earnedBadges.map(eb => ({
        ...eb.badge,
        earnedAt: eb.earnedAt
      })),
      leaderboard,
      childStats: {
        totalStars: child.totalStars,
        totalBadges: earnedBadges.length,
        weeklyStars: leaderboard.find(m => m.isMe)?.stars || 0
      },
      newlyEarned
    })
  } catch (error) {
    console.error('Error fetching badges:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.familyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { childId, action, badgeId, challengeText, targetChildId } = body

    if (!childId) {
      return NextResponse.json({ error: 'Child ID required' }, { status: 400 })
    }

    // Verify child belongs to family
    const child = await prisma.child.findFirst({
      where: {
        id: childId,
        familyId: session.user.familyId
      }
    })

    if (!child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 })
    }

    if (action === 'share_badge') {
      if (!badgeId) {
        return NextResponse.json({ error: 'Badge ID required' }, { status: 400 })
      }

      // Verify badge is earned by child
      const earnedBadge = await prisma.badgeEarned.findFirst({
        where: { childId, badgeId },
        include: { badge: true }
      })

      if (!earnedBadge) {
        return NextResponse.json({ error: 'Badge not earned by child' }, { status: 404 })
      }

      // TODO: Generate confetti GIF and save locally
      // For now, just log the share action
      console.log(`🎉 Child ${childId} shared badge: ${earnedBadge.badge.name}`)

      return NextResponse.json({
        message: 'Badge shared successfully!',
        badge: earnedBadge.badge,
        confettiGenerated: true
      })
    }

    if (action === 'send_challenge') {
      if (!challengeText || !targetChildId) {
        return NextResponse.json({ 
          error: 'Challenge text and target child ID required' 
        }, { status: 400 })
      }

      // Verify target child is in same family
      const targetChild = await prisma.child.findFirst({
        where: {
          id: targetChildId,
          familyId: session.user.familyId
        }
      })

      if (!targetChild) {
        return NextResponse.json({ error: 'Target child not found' }, { status: 404 })
      }

      // Create challenge record (for parent approval)
      const challenge = await prisma.challenge.create({
        data: {
          fromChildId: childId,
          toChildId: targetChildId,
          challengeText,
          status: 'pending_approval', // Parent must approve
          familyId: session.user.familyId
        }
      })

      // TODO: Send notification to parents for approval

      return NextResponse.json({
        ...challenge,
        message: 'Challenge sent to parent for approval!'
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error processing badge request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper functions
async function calculateBadgeProgress(childId: string, criteria: any): Promise<number> {
  const { type, value, timeframe } = criteria

  let timeFilter = {}
  if (timeframe === 'week') {
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - 7)
    timeFilter = { gte: weekStart }
  } else if (timeframe === 'month') {
    const monthStart = new Date()
    monthStart.setDate(monthStart.getDate() - 30)
    timeFilter = { gte: monthStart }
  }

  switch (type) {
    case 'homework_streak':
      // Calculate consecutive days with completed homework
      const homeworkCompletions = await prisma.taskCompletion.findMany({
        where: {
          childId,
          task: { category: 'homework' },
          isApproved: true,
          completedAt: Object.keys(timeFilter).length > 0 ? timeFilter : undefined
        },
        orderBy: { completedAt: 'desc' }
      })
      
      let streak = 0
      const completionDates = new Set(
        homeworkCompletions.map(c => c.completedAt.toISOString().split('T')[0])
      )
      
      let checkDate = new Date()
      while (completionDates.has(checkDate.toISOString().split('T')[0])) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      }
      
      return streak

    case 'chore_count':
      const choreCount = await prisma.taskCompletion.count({
        where: {
          childId,
          task: { category: 'chores' },
          isApproved: true,
          completedAt: Object.keys(timeFilter).length > 0 ? timeFilter : undefined
        }
      })
      return choreCount

    case 'star_count':
      const starSum = await prisma.taskCompletion.aggregate({
        where: {
          childId,
          isApproved: true,
          completedAt: Object.keys(timeFilter).length > 0 ? timeFilter : undefined
        },
        _sum: { starsAwarded: true }
      })
      return starSum._sum.starsAwarded || 0

    case 'savings_amount':
      const balanceResult = await prisma.financialTransaction.aggregate({
        where: { childId },
        _sum: { amount: true }
      })
      return balanceResult._sum.amount || 0

    case 'learning_games':
      const learningCount = await prisma.learningScore.count({
        where: {
          childId,
          createdAt: Object.keys(timeFilter).length > 0 ? timeFilter : undefined
        }
      })
      return learningCount

    case 'screen_time_compliance':
      // Days where screen time was within limits
      const complianceDays = await prisma.screenTimeLog.findMany({
        where: {
          childId,
          type: 'session_end',
          timestamp: Object.keys(timeFilter).length > 0 ? timeFilter : undefined
        }
      })
      
      // Group by date and check if total daily usage was within limits
      const dailyUsage = complianceDays.reduce((acc, log) => {
        const date = log.timestamp.toISOString().split('T')[0]
        acc[date] = (acc[date] || 0) + (log.durationMinutes || 0)
        return acc
      }, {} as Record<string, number>)
      
      const child = await prisma.child.findUnique({ where: { id: childId } })
      const dailyLimit = child?.dailyScreenMinutes || 60
      
      return Object.values(dailyUsage).filter(usage => usage <= dailyLimit).length

    case 'grade_average':
      // This would need a grades system - placeholder for now
      return 0

    case 'help_siblings':
      // Count tasks completed for other children - placeholder for now
      return 0

    default:
      return 0
  }
}

async function checkAndAwardNewBadges(childId: string, badges: any[]): Promise<any[]> {
  const newlyEarned = []
  
  for (const badge of badges) {
    if (!badge.unlocked && badge.progress >= badge.requirement) {
      // Award the badge
      try {
        const earnedBadge = await prisma.badgeEarned.create({
          data: {
            childId,
            badgeId: badge.id
          },
          include: { badge: true }
        })
        
        newlyEarned.push(earnedBadge.badge)
        console.log(`🏆 Badge earned: ${earnedBadge.badge.name} by child ${childId}`)
      } catch (error) {
        // Badge might already be earned (race condition)
        console.error('Error awarding badge:', error)
      }
    }
  }
  
  return newlyEarned
}

function getBadgeColor(rarity: string): string {
  switch (rarity) {
    case 'legendary': return 'from-purple-400 to-pink-500'
    case 'gold': return 'from-yellow-400 to-orange-500'
    case 'silver': return 'from-gray-400 to-gray-600'
    case 'bronze': return 'from-amber-400 to-yellow-500'
    default: return 'from-blue-400 to-cyan-500'
  }
}

function getAvatarEmoji(childId: string): string {
  const emojis = ['👦', '👧', '🧒', '👶', '🤱', '👨‍🦱', '👩‍🦱', '👨‍🦰', '👩‍🦰']
  const index = childId.charCodeAt(childId.length - 1) % emojis.length
  return emojis[index]
}