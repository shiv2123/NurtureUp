import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create sample badges
  const badges = [
    {
      name: 'First Quest',
      description: 'Complete your first quest',
      icon: '🎯',
      category: 'milestone',
      rarity: 'bronze',
      criteria: JSON.stringify({ type: 'first_task', value: 1 })
    },
    {
      name: 'Week Warrior',
      description: 'Complete tasks for 7 days straight',
      icon: '🔥',
      category: 'streak',
      rarity: 'silver',
      criteria: JSON.stringify({ type: 'streak_days', value: 7 })
    },
    {
      name: 'Century Club',
      description: 'Earn 100 total stars',
      icon: '⭐',
      category: 'milestone',
      rarity: 'gold',
      criteria: JSON.stringify({ type: 'total_stars', value: 100 })
    }
  ]

  for (const badge of badges) {
    await prisma.badge.create({ data: badge })
  }

  // Create a demo family
  const demoFamily = await prisma.family.create({
    data: {
      name: 'Demo Family',
      settings: {
        create: {
          starToCoinsRatio: 10,
          enableCommunity: true,
          enableLearning: true,
          enablePets: true
        }
      }
    }
  })

  // Create demo parent user
  const hashedPassword = await bcrypt.hash('demo123', 10)
  const parentUser = await prisma.user.create({
    data: {
      email: 'parent@demo.com',
      password: hashedPassword,
      name: 'Demo Parent',
      role: 'PARENT',
      familyId: demoFamily.id,
      parentProfile: {
        create: {
          familyId: demoFamily.id,
          isPrimary: true
        }
      }
    }
  })

  // Create demo child user
  const childUser = await prisma.user.create({
    data: {
      email: 'child@demo.com',
      password: hashedPassword,
      name: 'Emma',
      role: 'CHILD',
      familyId: demoFamily.id,
      childProfile: {
        create: {
          familyId: demoFamily.id,
          nickname: 'Little Star',
          birthDate: new Date('2015-06-15'),
          avatar: '🌟',
          theme: 'candy',
          level: 3,
          xp: 245,
          totalStars: 47,
          currentCoins: 12,
          lifetimeCoins: 89,
          currentStreak: 4,
          longestStreak: 7,
          dailyScreenMinutes: 60,
          bonusScreenMinutes: 15,
          usedScreenMinutes: 23
        }
      }
    }
  })

  // Get the parent profile
  const parent = await prisma.parent.findUnique({
    where: { userId: parentUser.id }
  })

  // Get the child profile
  const child = await prisma.child.findUnique({
    where: { userId: childUser.id }
  })

  // Create sample tasks
  const sampleTasks = [
    {
      title: 'Make Bed',
      description: 'Tidy up your bedroom and make your bed neat',
      category: 'home',
      difficulty: 1,
      starValue: 5,
      isRecurring: true,
      recurringRule: JSON.stringify({ type: 'daily', days: [1,2,3,4,5,6,7] })
    },
    {
      title: 'Brush Teeth',
      description: 'Brush your teeth for 2 minutes',
      category: 'health',
      difficulty: 1,
      starValue: 3,
      isRecurring: true,
      recurringRule: JSON.stringify({ type: 'daily', days: [1,2,3,4,5,6,7] })
    },
    {
      title: 'Read for 20 minutes',
      description: 'Choose a book and read quietly for 20 minutes',
      category: 'learning',
      difficulty: 2,
      starValue: 10,
      isRecurring: true,
      recurringRule: JSON.stringify({ type: 'daily', days: [1,2,3,4,5,6,7] })
    },
    {
      title: 'Practice Piano',
      description: 'Practice piano for 15 minutes',
      category: 'music',
      difficulty: 3,
      starValue: 15,
      isRecurring: true,
      recurringRule: JSON.stringify({ type: 'daily', days: [1,2,3,4,5] })
    },
    {
      title: 'Help with Dishes',
      description: 'Help clear the table and load the dishwasher',
      category: 'home',
      difficulty: 2,
      starValue: 8,
      requiresProof: true
    }
  ]

  const createdTasks = []
  for (const taskData of sampleTasks) {
    const task = await prisma.task.create({
      data: {
        ...taskData,
        familyId: demoFamily.id,
        createdById: parent!.id,
        assignedToId: child!.id
      }
    })
    createdTasks.push(task)
  }

  // Create some task completions (some approved, some pending)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  // Yesterday's completed tasks (approved)
  await prisma.taskCompletion.create({
    data: {
      taskId: createdTasks[0].id, // Make Bed
      childId: child!.id,
      completedAt: yesterday,
      isApproved: true,
      approvedById: parent!.id,
      approvedAt: yesterday,
      starsAwarded: 5,
      coinsAwarded: 1
    }
  })

  await prisma.taskCompletion.create({
    data: {
      taskId: createdTasks[1].id, // Brush Teeth
      childId: child!.id,
      completedAt: yesterday,
      isApproved: true,
      approvedById: parent!.id,
      approvedAt: yesterday,
      starsAwarded: 3,
      coinsAwarded: 0
    }
  })

  // Today's completed tasks (pending approval)
  await prisma.taskCompletion.create({
    data: {
      taskId: createdTasks[0].id, // Make Bed
      childId: child!.id,
      completedAt: today,
      isApproved: false,
      starsAwarded: 5,
      coinsAwarded: 0
    }
  })

  await prisma.taskCompletion.create({
    data: {
      taskId: createdTasks[2].id, // Read for 20 minutes
      childId: child!.id,
      completedAt: today,
      isApproved: false,
      starsAwarded: 10,
      coinsAwarded: 0
    }
  })

  // Create sample rewards
  const sampleRewards = [
    {
      title: 'Extra 30 Minutes Screen Time',
      description: 'Get an extra 30 minutes of tablet or video game time',
      category: 'screentime',
      coinCost: 15,
      requiresApproval: false
    },
    {
      title: 'Ice Cream Date',
      description: 'Special one-on-one ice cream trip with Mom or Dad',
      category: 'experience',
      coinCost: 25,
      requiresApproval: true
    },
    {
      title: 'Choose Family Movie Night',
      description: 'Pick the movie for family movie night',
      category: 'privilege',
      coinCost: 20,
      requiresApproval: true
    },
    {
      title: 'Small Toy ($10 limit)',
      description: 'Choose a small toy or item from the store',
      category: 'item',
      coinCost: 50,
      requiresApproval: true
    }
  ]

  for (const rewardData of sampleRewards) {
    await prisma.reward.create({
      data: {
        ...rewardData,
        familyId: demoFamily.id
      }
    })
  }

  // Create a virtual pet
  await prisma.virtualPet.create({
    data: {
      childId: child!.id,
      name: 'Sparkles',
      type: 'dragon',
      mood: 'happy',
      level: 2,
      xp: 85,
      happiness: 90,
      energy: 75,
      color: 'purple',
      accessories: 'hat,sparkles'
    }
  })

  // Create some milestones
  const yesterday2 = new Date(today)
  yesterday2.setDate(yesterday2.getDate() - 2)

  await prisma.milestone.create({
    data: {
      familyId: demoFamily.id,
      title: 'First Week Complete!',
      description: 'Emma completed her first full week of daily quests',
      date: yesterday2,
      category: 'achievement',
      childrenIds: child!.id,
      tags: 'achievement,streak,milestone'
    }
  })

  await prisma.milestone.create({
    data: {
      familyId: demoFamily.id,
      title: 'Piano Recital Practice',
      description: 'Emma practiced her piano piece perfectly for 15 minutes straight',
      date: yesterday,
      category: 'memory',
      childrenIds: child!.id,
      tags: 'music,practice,achievement'
    }
  })

  console.log('Database seeded successfully with demo data!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
