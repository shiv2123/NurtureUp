import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function initializeBadges() {
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

  console.log('Initializing badges...')

  for (const badgeData of defaultBadges) {
    try {
      await prisma.badge.upsert({
        where: { name: badgeData.name },
        update: {},
        create: badgeData
      })
      console.log(`✓ Badge "${badgeData.name}" initialized`)
    } catch (error) {
      console.error(`✗ Failed to create badge "${badgeData.name}":`, error)
    }
  }

  console.log('Badge initialization complete!')
}

initializeBadges()
  .catch(console.error)
  .finally(() => prisma.$disconnect())