import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BadgeService } from '@/lib/badgeService'
import { sendNotificationToRole } from '@/lib/pusher'

export async function POST(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'CHILD') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const child = await prisma.child.findUnique({
      where: { userId: session.user.id },
      include: { family: { include: { settings: true } } }
    })

    if (!child) {
      return NextResponse.json({ error: 'Child profile not found' }, { status: 404 })
    }

    const task = await prisma.task.findFirst({
      where: {
        id: params.taskId,
        assignedToId: child.id,
        isActive: true
      }
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check if already completed today
    const existingCompletion = await prisma.taskCompletion.findFirst({
      where: {
        taskId: task.id,
        childId: child.id,
        completedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    })

    if (existingCompletion) {
      return NextResponse.json(
        { error: 'Task already completed today' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { proofImage, notes } = body

    // Create completion record
    const completion = await prisma.taskCompletion.create({
      data: {
        taskId: task.id,
        childId: child.id,
        proofImage,
        notes,
        starsAwarded: task.starValue,
        isApproved: !task.requiresProof // Auto-approve if no proof required
      }
    })

    // Send notification to parents
    if (task.requiresProof) {
      // Task needs approval
      await sendNotificationToRole(child.familyId, 'PARENT', {
        type: 'task_completed',
        title: 'Task Completed!',
        message: `${child.nickname} completed "${task.title}" and needs your approval!`,
        data: {
          taskId: task.id,
          childId: child.id,
          completionId: completion.id,
          requiresApproval: true
        }
      })
    }

    // If auto-approved, update child's stats and check badges
    if (!task.requiresProof) {
      const settings = child.family.settings!
      const coinsEarned = Math.floor(task.starValue / settings.starToCoinsRatio)
      const xpEarned = task.difficulty * 10

      // Update child stats
      const updatedChild = await prisma.child.update({
        where: { id: child.id },
        data: {
          totalStars: { increment: task.starValue },
          currentCoins: { increment: coinsEarned },
          lifetimeCoins: { increment: coinsEarned },
          xp: { increment: xpEarned }
        }
      })

      // Update streak
      await BadgeService.updateChildStreak(child.id)

      // Check for badge eligibility
      const newBadges = await BadgeService.checkAndAwardBadges(child.id, {
        child: updatedChild,
        completedTask: task
      })

      // Send notification to parents about auto-approved task
      await sendNotificationToRole(child.familyId, 'PARENT', {
        type: 'task_approved',
        title: 'Task Completed!',
        message: `${child.nickname} completed "${task.title}" and earned ${coinsEarned} coins!`,
        data: {
          taskId: task.id,
          childId: child.id,
          completionId: completion.id,
          coinsEarned,
          starsAwarded: task.starValue
        }
      })

      // Send badges earned notifications
      for (const badge of newBadges) {
        await sendNotificationToRole(child.familyId, 'PARENT', {
          type: 'badge_earned',
          title: 'New Badge Earned!',
          message: `${child.nickname} earned the "${badge.name}" badge! ${badge.icon}`,
          data: {
            badgeId: badge.id,
            childId: child.id,
            badgeName: badge.name,
            badgeIcon: badge.icon
          }
        })
      }

      return NextResponse.json({
        ...completion,
        coinsEarned,
        xpEarned,
        newBadges
      })
    }

    return NextResponse.json(completion)
  } catch (error) {
    console.error('Failed to complete task:', error)
    return NextResponse.json(
      { error: 'Failed to complete task' },
      { status: 500 }
    )
  }
} 