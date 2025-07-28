import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendNotificationToRole } from '@/lib/pusher'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ purchaseId: string }> }
) {
  try {
    const { purchaseId } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user.familyId || session.user.role !== 'PARENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const parent = await prisma.parent.findUnique({
      where: { userId: session.user.id }
    })
    if (!parent) {
      return NextResponse.json({ error: 'Parent profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const { notes, action } = body // action: 'fulfill' or 'deny'

    // Fetch the purchase with related data
    const purchase = await prisma.rewardPurchase.findFirst({
      where: {
        id: purchaseId,
        reward: {
          familyId: session.user.familyId
        }
      },
      include: {
        reward: true,
        child: {
          include: { user: true }
        }
      }
    })

    if (!purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 })
    }

    if (purchase.isRedeemed) {
      return NextResponse.json({ error: 'Purchase already redeemed' }, { status: 400 })
    }

    if (action === 'fulfill') {
      // Mark as redeemed
      const updatedPurchase = await prisma.rewardPurchase.update({
        where: { id: purchase.id },
        data: {
          isRedeemed: true,
          redeemedAt: new Date(),
          notes: notes || `Fulfilled by ${session.user.name}`
        }
      })

      // Send notification to child
      await sendNotificationToRole(purchase.child.familyId, 'CHILD', {
        type: 'reward_redeemed',
        title: 'Reward Ready! 🎁',
        message: `Your "${purchase.reward.title}" reward is ready! ${notes ? `Note: ${notes}` : ''}`,
        data: {
          purchaseId: purchase.id,
          rewardId: purchase.reward.id,
          rewardTitle: purchase.reward.title,
          childId: purchase.child.id
        }
      })

      return NextResponse.json({
        ...updatedPurchase,
        message: 'Reward successfully fulfilled!'
      })
    } else if (action === 'deny') {
      // Refund coins and delete purchase
      await prisma.$transaction([
        // Refund coins to child
        prisma.child.update({
          where: { id: purchase.child.id },
          data: {
            currentCoins: { increment: purchase.coinCost }
          }
        }),
        // Delete the purchase
        prisma.rewardPurchase.delete({
          where: { id: purchase.id }
        })
      ])

      // Send notification to child
      await sendNotificationToRole(purchase.child.familyId, 'CHILD', {
        type: 'reward_denied',
        title: 'Reward Request Denied',
        message: `Your "${purchase.reward.title}" reward request was denied and coins have been refunded. ${notes ? `Reason: ${notes}` : ''}`,
        data: {
          rewardId: purchase.reward.id,
          rewardTitle: purchase.reward.title,
          childId: purchase.child.id,
          refundedCoins: purchase.coinCost
        }
      })

      return NextResponse.json({
        message: 'Reward request denied and coins refunded',
        refundedCoins: purchase.coinCost
      })
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Failed to redeem reward:', error)
    return NextResponse.json(
      { error: 'Failed to process reward redemption' },
      { status: 500 }
    )
  }
}