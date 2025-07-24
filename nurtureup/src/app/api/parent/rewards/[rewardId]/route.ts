import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateRewardSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  category: z.string().optional(),
  coinCost: z.number().min(1).optional(),
  quantity: z.number().optional(),
  minAge: z.number().optional(),
  maxAge: z.number().optional(),
  requiresApproval: z.boolean().optional(),
  isActive: z.boolean().optional()
})

export async function PATCH(request: NextRequest, { params }: { params: { rewardId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user.familyId || session.user.role !== 'PARENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateRewardSchema.parse(body)

    const reward = await prisma.reward.update({
      where: {
        id: params.rewardId,
        familyId: session.user.familyId
      },
      data: validatedData
    })

    return NextResponse.json(reward)
  } catch (error) {
    console.error('Failed to update reward:', error)
    return NextResponse.json(
      { error: 'Failed to update reward' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { rewardId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user.familyId || session.user.role !== 'PARENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.reward.delete({
      where: {
        id: params.rewardId,
        familyId: session.user.familyId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete reward:', error)
    return NextResponse.json(
      { error: 'Failed to delete reward' },
      { status: 500 }
    )
  }
} 