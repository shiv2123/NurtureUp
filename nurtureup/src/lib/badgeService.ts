import { prisma } from '@/lib/prisma'
import type { Child, Badge, TaskCompletion } from '@prisma/client'

interface BadgeCheckContext {
  child: Child
  completedTask?: any
  totalCompletions?: number
  streak?: number
}

export class BadgeService {
  
  static async checkAndAwardBadges(childId: string, context: BadgeCheckContext = {} as BadgeCheckContext) {
    const child = await prisma.child.findUnique({
      where: { id: childId },
      include: {
        earnedBadges: {
          include: { badge: true }
        },
        completedTasks: {
          where: { isApproved: true },
          orderBy: { completedAt: 'desc' }
        }
      }
    })

    if (!child) return []

    // Get all available badges
    const allBadges = await prisma.badge.findMany()
    
    // Get badges the child hasn't earned yet
    const earnedBadgeIds = child.earnedBadges.map(eb => eb.badgeId)
    const unearnedBadges = allBadges.filter(badge => !earnedBadgeIds.includes(badge.id))
    
    const newlyEarnedBadges: Badge[] = []

    for (const badge of unearnedBadges) {
      const criteria = JSON.parse(badge.criteria)
      
      if (await this.checkBadgeCriteria(badge, criteria, child)) {
        // Award the badge
        await prisma.badgeEarned.create({
          data: {
            badgeId: badge.id,
            childId: child.id
          }
        })
        
        newlyEarnedBadges.push(badge)
      }
    }

    return newlyEarnedBadges
  }

  private static async checkBadgeCriteria(badge: Badge, criteria: any, child: Child & { completedTasks: TaskCompletion[] }): Promise<boolean> {
    switch (criteria.type) {
      case 'first_task':
        return child.completedTasks.length >= criteria.value

      case 'total_stars':
        return child.totalStars >= criteria.value

      case 'streak_days':
        const streak = await this.calculateCurrentStreak(child.id)
        return streak >= criteria.value

      case 'total_tasks':
        return child.completedTasks.length >= criteria.value

      case 'perfect_week':
        // Check if completed all assigned tasks for 7 consecutive days
        return await this.checkPerfectWeek(child.id)

      case 'early_bird':
        // Check if completed tasks before 9 AM for several days
        return await this.checkEarlyBirdPattern(child.id)

      case 'weekend_warrior':
        // Check if completed tasks on weekends
        return await this.checkWeekendPattern(child.id)

      case 'coin_saver':
        return child.currentCoins >= criteria.value

      case 'level_up':
        return child.level >= criteria.value

      default:
        return false
    }
  }

  private static async calculateCurrentStreak(childId: string): Promise<number> {
    const completions = await prisma.taskCompletion.findMany({
      where: {
        childId: childId,
        isApproved: true
      },
      orderBy: { completedAt: 'desc' },
      take: 30 // Look at last 30 days
    })

    if (completions.length === 0) return 0

    // Group by date
    const completionsByDate = new Map<string, TaskCompletion[]>()
    completions.forEach(completion => {
      const date = completion.completedAt.toISOString().split('T')[0]
      if (!completionsByDate.has(date)) {
        completionsByDate.set(date, [])
      }
      completionsByDate.get(date)!.push(completion)
    })

    // Calculate streak
    let streak = 0
    const today = new Date()
    let currentDate = new Date(today)

    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0]
      if (completionsByDate.has(dateStr)) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  }

  private static async checkPerfectWeek(childId: string): Promise<boolean> {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // Get all tasks assigned to child in the last 7 days
    const assignedTasks = await prisma.task.findMany({
      where: {
        assignedToId: childId,
        isActive: true,
        createdAt: { gte: sevenDaysAgo }
      }
    })

    // Get completions in the last 7 days
    const completions = await prisma.taskCompletion.findMany({
      where: {
        childId: childId,
        isApproved: true,
        completedAt: { gte: sevenDaysAgo }
      }
    })

    // Check if all tasks were completed
    const completedTaskIds = new Set(completions.map(c => c.taskId))
    return assignedTasks.every(task => completedTaskIds.has(task.id))
  }

  private static async checkEarlyBirdPattern(childId: string): Promise<boolean> {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const earlyCompletions = await prisma.taskCompletion.findMany({
      where: {
        childId: childId,
        isApproved: true,
        completedAt: { gte: sevenDaysAgo }
      }
    })

    const earlyBirdDays = earlyCompletions.filter(completion => {
      const hour = completion.completedAt.getHours()
      return hour < 9 // Before 9 AM
    }).length

    return earlyBirdDays >= 5 // At least 5 days in the past week
  }

  private static async checkWeekendPattern(childId: string): Promise<boolean> {
    const fourWeeksAgo = new Date()
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)

    const completions = await prisma.taskCompletion.findMany({
      where: {
        childId: childId,
        isApproved: true,
        completedAt: { gte: fourWeeksAgo }
      }
    })

    const weekendCompletions = completions.filter(completion => {
      const dayOfWeek = completion.completedAt.getDay()
      return dayOfWeek === 0 || dayOfWeek === 6 // Sunday or Saturday
    })

    return weekendCompletions.length >= 8 // At least 2 weekends worth
  }

  static async updateChildStreak(childId: string) {
    const streak = await this.calculateCurrentStreak(childId)
    
    await prisma.child.update({
      where: { id: childId },
      data: { 
        currentStreak: streak,
        longestStreak: { max: streak }
      }
    })

    return streak
  }

  static async initializeDefaultBadges() {
    // Create default badges if they don't exist
    const defaultBadges = [
      {
        name: 'First Steps',
        description: 'Complete your very first task',
        icon: '🎯',
        category: 'milestone',
        rarity: 'bronze',
        criteria: JSON.stringify({ type: 'first_task', value: 1 })
      },
      {
        name: 'Task Master',
        description: 'Complete 10 tasks',
        icon: '🏆',
        category: 'milestone',
        rarity: 'silver',
        criteria: JSON.stringify({ type: 'total_tasks', value: 10 })
      },
      {
        name: 'Star Collector',
        description: 'Earn 50 stars',
        icon: '⭐',
        category: 'milestone',
        rarity: 'silver',
        criteria: JSON.stringify({ type: 'total_stars', value: 50 })
      },
      {
        name: 'Century Club',
        description: 'Earn 100 total stars',
        icon: '💯',
        category: 'milestone',
        rarity: 'gold',
        criteria: JSON.stringify({ type: 'total_stars', value: 100 })
      },
      {
        name: 'Hot Streak',
        description: 'Complete tasks for 3 days in a row',
        icon: '🔥',
        category: 'streak',
        rarity: 'bronze',
        criteria: JSON.stringify({ type: 'streak_days', value: 3 })
      },
      {
        name: 'Week Warrior',
        description: 'Complete tasks for 7 days straight',
        icon: '🗡️',
        category: 'streak',
        rarity: 'silver',
        criteria: JSON.stringify({ type: 'streak_days', value: 7 })
      },
      {
        name: 'Perfect Week',
        description: 'Complete all assigned tasks for a full week',
        icon: '💪',
        category: 'special',
        rarity: 'gold',
        criteria: JSON.stringify({ type: 'perfect_week', value: true })
      },
      {
        name: 'Early Bird',
        description: 'Complete tasks before 9 AM for 5 days',
        icon: '🐦',
        category: 'special',
        rarity: 'silver',
        criteria: JSON.stringify({ type: 'early_bird', value: true })
      },
      {
        name: 'Weekend Warrior',
        description: 'Stay consistent on weekends',
        icon: '🌈',
        category: 'special',
        rarity: 'silver',
        criteria: JSON.stringify({ type: 'weekend_warrior', value: true })
      },
      {
        name: 'Coin Collector',
        description: 'Save up 100 coins',
        icon: '🪙',
        category: 'milestone',
        rarity: 'bronze',
        criteria: JSON.stringify({ type: 'coin_saver', value: 100 })
      }
    ]

    for (const badgeData of defaultBadges) {
      await prisma.badge.upsert({
        where: { name: badgeData.name },
        update: {},
        create: badgeData
      })
    }
  }
}