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
    const limit = parseInt(searchParams.get('limit') || '50')
    const type = searchParams.get('type') // 'earning', 'spending', or null for all
    
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

    // Build where clause for transactions
    let whereClause: any = { childId }
    if (type === 'earning') {
      whereClause.amount = { gt: 0 }
    } else if (type === 'spending') {
      whereClause.amount = { lt: 0 }
    }

    const transactions = await prisma.financialTransaction.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    // Calculate current balance
    const balanceResult = await prisma.financialTransaction.aggregate({
      where: { childId },
      _sum: { amount: true }
    })
    const currentBalance = balanceResult._sum.amount || 0

    // Get savings goal
    const savingsGoal = await prisma.savingsGoal.findFirst({
      where: { childId, isActive: true },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate transaction statistics
    const earningsResult = await prisma.financialTransaction.aggregate({
      where: { childId, amount: { gt: 0 } },
      _sum: { amount: true }
    })
    const totalEarnings = earningsResult._sum.amount || 0

    const spendingResult = await prisma.financialTransaction.aggregate({
      where: { childId, amount: { lt: 0 } },
      _sum: { amount: true }
    })
    const totalSpending = Math.abs(spendingResult._sum.amount || 0)

    // Calculate monthly statistics
    const thisMonth = new Date()
    const monthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1)
    
    const [monthlyEarnings, monthlySpending] = await Promise.all([
      prisma.financialTransaction.aggregate({
        where: { 
          childId, 
          amount: { gt: 0 }, 
          createdAt: { gte: monthStart }
        },
        _sum: { amount: true }
      }),
      prisma.financialTransaction.aggregate({
        where: { 
          childId, 
          amount: { lt: 0 }, 
          createdAt: { gte: monthStart }
        },
        _sum: { amount: true }
      })
    ])

    // Check for pending payout requests
    const pendingPayout = await prisma.payoutRequest.findFirst({
      where: { 
        childId, 
        status: 'pending'
      },
      orderBy: { createdAt: 'desc' }
    })

    const stats = {
      currentBalance,
      totalEarnings,
      totalSpending,
      monthlyEarnings: monthlyEarnings._sum.amount || 0,
      monthlySpending: Math.abs(monthlySpending._sum.amount || 0),
      hasPendingPayout: !!pendingPayout,
      pendingPayoutAmount: pendingPayout?.amount || 0
    }

    // Include legacy stars/coins for backward compatibility
    const legacyData = {
      stars: child.totalStars,
      coins: child.currentCoins,
    }

    return NextResponse.json({
      transactions,
      balance: currentBalance,
      savingsGoal,
      stats,
      ...legacyData
    })
  } catch (error) {
    console.error('Error fetching wallet data:', error)
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
    const { 
      childId,
      action,
      amount,
      description,
      category,
      notes,
      source,
      // For savings goals
      goalItem,
      goalAmount
    } = body

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

    if (action === 'add_transaction') {
      if (typeof amount === 'undefined' || !description) {
        return NextResponse.json({ 
          error: 'Amount and description required for transactions' 
        }, { status: 400 })
      }

      // Validate spending doesn't exceed balance for children
      if (amount < 0) {
        const balanceResult = await prisma.financialTransaction.aggregate({
          where: { childId },
          _sum: { amount: true }
        })
        const currentBalance = balanceResult._sum.amount || 0
        
        if (currentBalance + amount < 0) {
          return NextResponse.json({ 
            error: 'Insufficient balance for this transaction' 
          }, { status: 400 })
        }
      }

      const transaction = await prisma.financialTransaction.create({
        data: {
          childId,
          amount,
          description,
          category: category || 'other',
          notes,
          source: source || 'manual', // 'manual', 'chores', 'stars', 'allowance'
        }
      })

      return NextResponse.json(transaction, { status: 201 })
    }

    if (action === 'request_payout') {
      if (typeof amount === 'undefined' || amount <= 0) {
        return NextResponse.json({ 
          error: 'Valid payout amount required' 
        }, { status: 400 })
      }

      // Check current balance
      const balanceResult = await prisma.financialTransaction.aggregate({
        where: { childId },
        _sum: { amount: true }
      })
      const currentBalance = balanceResult._sum.amount || 0

      if (currentBalance < amount) {
        return NextResponse.json({ 
          error: 'Insufficient balance for payout request' 
        }, { status: 400 })
      }

      // Check for existing pending payout
      const existingPayout = await prisma.payoutRequest.findFirst({
        where: { childId, status: 'pending' }
      })

      if (existingPayout) {
        return NextResponse.json({ 
          error: 'You already have a pending payout request' 
        }, { status: 400 })
      }

      const payoutRequest = await prisma.payoutRequest.create({
        data: {
          childId,
          amount,
          notes: notes || null,
          status: 'pending'
        }
      })

      // TODO: Send notification to parents

      return NextResponse.json({
        ...payoutRequest,
        message: 'Payout request sent to parents for approval'
      }, { status: 201 })
    }

    if (action === 'set_savings_goal') {
      if (!goalItem || typeof goalAmount === 'undefined' || goalAmount <= 0) {
        return NextResponse.json({ 
          error: 'Goal item and valid amount required' 
        }, { status: 400 })
      }

      // Deactivate existing savings goals
      await prisma.savingsGoal.updateMany({
        where: { childId, isActive: true },
        data: { isActive: false }
      })

      const savingsGoal = await prisma.savingsGoal.create({
        data: {
          childId,
          item: goalItem,
          targetAmount: goalAmount,
          isActive: true
        }
      })

      return NextResponse.json(savingsGoal, { status: 201 })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error processing wallet request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.familyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, action, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 })
    }

    if (action === 'update_transaction') {
      // Find and verify transaction belongs to family
      const transaction = await prisma.financialTransaction.findFirst({
        where: {
          id,
          child: { familyId: session.user.familyId }
        }
      })

      if (!transaction) {
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
      }

      const updatedTransaction = await prisma.financialTransaction.update({
        where: { id },
        data: updateData
      })

      return NextResponse.json(updatedTransaction)
    }

    if (action === 'update_savings_goal') {
      // Find and verify savings goal belongs to family
      const savingsGoal = await prisma.savingsGoal.findFirst({
        where: {
          id,
          child: { familyId: session.user.familyId }
        }
      })

      if (!savingsGoal) {
        return NextResponse.json({ error: 'Savings goal not found' }, { status: 404 })
      }

      const updatedGoal = await prisma.savingsGoal.update({
        where: { id },
        data: updateData
      })

      return NextResponse.json(updatedGoal)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating wallet data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.familyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const type = searchParams.get('type') // 'transaction' or 'payout_request'

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    if (type === 'transaction') {
      // Find and verify transaction belongs to family
      const transaction = await prisma.financialTransaction.findFirst({
        where: {
          id,
          child: { familyId: session.user.familyId }
        }
      })

      if (!transaction) {
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
      }

      await prisma.financialTransaction.delete({
        where: { id }
      })

      return NextResponse.json({ message: 'Transaction deleted successfully' })
    }

    if (type === 'payout_request') {
      // Find and verify payout request belongs to family
      const payoutRequest = await prisma.payoutRequest.findFirst({
        where: {
          id,
          child: { familyId: session.user.familyId }
        }
      })

      if (!payoutRequest) {
        return NextResponse.json({ error: 'Payout request not found' }, { status: 404 })
      }

      await prisma.payoutRequest.delete({
        where: { id }
      })

      return NextResponse.json({ message: 'Payout request cancelled successfully' })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (error) {
    console.error('Error deleting wallet data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 