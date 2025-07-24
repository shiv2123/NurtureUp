import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { rewardId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'CHILD') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const child = await prisma.child.findUnique({
      where: { userId: session.user.id }
    })
    if (!child) {
      return NextResponse.json({ error: 'Child profile not found' }, { status: 404 })
    }

    const reward = await prisma.reward.findFirst({
      where: {
        id: params.rewardId,
        familyId: child.familyId,
        isActive: true
      }
    })
    if (!reward) {
      return NextResponse.json({ error: 'Reward not found' }, { status: 404 })
    }

    // Check if child has enough coins
    if (child.currentCoins < reward.coinCost) {
      return NextResponse.json(
        { error: 'Not enough coins' },
        { status: 400 }
      )
    }

    // Check quantity if limited
    if (reward.quantity !== null) {
      const purchaseCount = await prisma.rewardPurchase.count({
        where: {
          rewardId: reward.id,
          isRedeemed: false
        }
      })
      if (purchaseCount >= reward.quantity) {
        return NextResponse.json(
          { error: 'Reward out of stock' },
          { status: 400 }
        )
      }
    }

    // Create purchase in transaction
    const [purchase, updatedChild] = await prisma.$transaction([
      prisma.rewardPurchase.create({
        data: {
          rewardId: reward.id,
          childId: child.id,
          coinCost: reward.coinCost,
          isRedeemed: !reward.requiresApproval
        }
      }),
      prisma.child.update({
        where: { id: child.id },
        data: {
          currentCoins: { decrement: reward.coinCost }
        }
      })
    ])

    return NextResponse.json(purchase)
  } catch (error) {
    console.error('Failed to purchase reward:', error)
    return NextResponse.json(
      { error: 'Failed to purchase reward' },
      { status: 500 }
    )
  }
} 