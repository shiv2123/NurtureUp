import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BadgeService } from '@/lib/badgeService'
import { sendNotificationToUser } from '@/lib/pusher'
import { z } from 'zod'

const approvalSchema = z.object({
  approved: z.boolean(),
  feedback: z.string().optional(),
  bonusStars: z.number().min(0).max(20).default(0)
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ completionId: string }> }
) {
  try {
    const { completionId } = await params
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'PARENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const parent = await prisma.parent.findUnique({
      where: { userId: session.user.id },
      include: { family: { include: { settings: true } } }
    })

    if (!parent) {
      return NextResponse.json({ error: 'Parent profile not found' }, { status: 404 })
    }

    const completion = await prisma.taskCompletion.findFirst({
      where: {
        id: completionId,
        task: { familyId: parent.familyId },
        isApproved: false
      },
      include: {
        task: true,
        child: true
      }
    })

    if (!completion) {
      return NextResponse.json({ error: 'Task completion not found' }, { status: 404 })
    }

    const body = await request.json()
    const { approved, feedback, bonusStars } = approvalSchema.parse(body)

    if (approved) {
      // Approve the task and award rewards
      const settings = parent.family.settings!
      const totalStars = completion.starsAwarded + bonusStars
      const coinsEarned = Math.floor(totalStars / settings.starToCoinsRatio)
      const xpEarned = completion.task.difficulty * 10

      // Update completion record
      await prisma.taskCompletion.update({
        where: { id: completion.id },
        data: {
          isApproved: true,
          approvedById: parent.id,
          approvedAt: new Date(),
          bonusStars,
          coinsAwarded: coinsEarned,
          notes: feedback
        }
      })

      // Update child stats
      const updatedChild = await prisma.child.update({
        where: { id: completion.childId },
        data: {
          totalStars: { increment: totalStars },
          currentCoins: { increment: coinsEarned },
          lifetimeCoins: { increment: coinsEarned },
          xp: { increment: xpEarned }
        }
      })

      // Update streak and check for badges
      await BadgeService.updateChildStreak(completion.childId)
      const newBadges = await BadgeService.checkAndAwardBadges(completion.childId, {
        child: updatedChild,
        completedTask: completion.task
      })

      // Send approval notification to child
      await sendNotificationToUser(completion.child.userId, parent.familyId, {
        type: 'task_approved',
        title: 'Task Approved! 🎉',
        message: `Great job on "${completion.task.title}"! You earned ${totalStars} stars and ${coinsEarned} coins!`,
        data: {
          taskId: completion.task.id,
          completionId: completion.id,
          starsAwarded: totalStars,
          coinsEarned,
          bonusStars,
          feedback
        }
      })

      // Send badge notifications to child
      for (const badge of newBadges) {
        await sendNotificationToUser(completion.child.userId, parent.familyId, {
          type: 'badge_earned',
          title: 'New Badge Earned! 🏆',
          message: `You earned the "${badge.name}" badge! ${badge.icon}`,
          data: {
            badgeId: badge.id,
            badgeName: badge.name,
            badgeIcon: badge.icon
          }
        })
      }

      return NextResponse.json({
        success: true,
        approved: true,
        starsAwarded: totalStars,
        coinsEarned,
        xpEarned,
        newBadges
      })

    } else {
      // Reject the task
      await prisma.taskCompletion.update({
        where: { id: completion.id },
        data: {
          isApproved: false,
          approvedById: parent.id,
          approvedAt: new Date(),
          notes: feedback || 'Task was not completed correctly. Please try again!'
        }
      })

      // Send rejection notification to child
      await sendNotificationToUser(completion.child.userId, parent.familyId, {
        type: 'task_rejected',
        title: 'Try Again! 🔄',
        message: `"${completion.task.title}" needs another try. You've got this!`,
        data: {
          taskId: completion.task.id,
          completionId: completion.id,
          feedback: feedback || 'Task was not completed correctly. Please try again!'
        }
      })

      return NextResponse.json({
        success: true,
        approved: false,
        message: 'Task completion rejected'
      })
    }

  } catch (error) {
    console.error('Error processing task approval:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to process approval' },
      { status: 500 }
    )
  }
}