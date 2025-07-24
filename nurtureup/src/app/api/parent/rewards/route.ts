import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendNotificationToRole } from '@/lib/pusher'
import { z } from 'zod'

const createRewardSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  image: z.string().optional(),
  category: z.enum(['screentime', 'experience', 'privilege', 'item']),
  coinCost: z.number().min(1),
  quantity: z.number().optional(),
  expiresAt: z.string().optional(),
  minAge: z.number().optional(),
  maxAge: z.number().optional(),
  requiresApproval: z.boolean().default(true)
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user.familyId || session.user.role !== 'PARENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rewards = await prisma.reward.findMany({
      where: {
        familyId: session.user.familyId
      },
      include: {
        purchases: {
          where: {
            purchasedAt: {
              gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(rewards)
  } catch (error) {
    console.error('Failed to fetch rewards:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rewards' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user.familyId || session.user.role !== 'PARENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createRewardSchema.parse(body)

    const reward = await prisma.reward.create({
      data: {
        ...validatedData,
        familyId: session.user.familyId,
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : undefined
      }
    })

    // Notify children about new reward available
    await sendNotificationToRole(session.user.familyId, 'CHILD', {
      type: 'reward_purchased', // Reusing existing type for now
      title: 'New Reward Available!',
      message: `New reward "${validatedData.title}" is now available for ${validatedData.coinCost} coins! 🎁`,
      data: {
        rewardId: reward.id,
        rewardTitle: validatedData.title,
        coinCost: validatedData.coinCost,
        isNewReward: true
      }
    })

    return NextResponse.json(reward, { status: 201 })
  } catch (error) {
    console.error('Failed to create reward:', error)
    return NextResponse.json(
      { error: 'Failed to create reward' },
      { status: 500 }
    )
  }
} 