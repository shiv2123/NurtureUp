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
    const subject = searchParams.get('subject') // 'phonics', 'numbers', 'shapes'
    const limit = parseInt(searchParams.get('limit') || '50')
    
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

    // Build where clause for learning scores
    let whereClause: any = { childId }
    if (subject) {
      whereClause.subject = subject
    }

    const learningScores = await prisma.learningScore.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    // Calculate XP by subject
    const subjectXP = await prisma.learningScore.groupBy({
      by: ['subject'],
      where: { childId },
      _sum: {
        xpEarned: true
      }
    })

    const xpBySubject = subjectXP.reduce((acc, item) => {
      acc[item.subject] = item._sum.xpEarned || 0
      return acc
    }, {} as Record<string, number>)

    // Calculate total XP and stars
    const totalXP = Object.values(xpBySubject).reduce((sum, xp) => sum + xp, 0)
    const starsFromXP = Math.floor(totalXP / 100) // 100 XP = 1 star

    // Get game progress for each subject
    const gameProgress = await Promise.all([
      'phonics', 'numbers', 'shapes'
    ].map(async (subj) => {
      const games = [
        // Phonics games
        ...(subj === 'phonics' ? [
          { id: 'letter-sounds', name: 'Letter Sounds', minXP: 0, maxXP: 25 },
          { id: 'rhyme-time', name: 'Rhyme Time', minXP: 25, maxXP: 50 },
          { id: 'word-builder', name: 'Word Builder', minXP: 50, maxXP: 75 },
          { id: 'reading-fun', name: 'Reading Fun', minXP: 100, maxXP: 125 },
          { id: 'story-time', name: 'Story Time', minXP: 150, maxXP: 200 }
        ] : []),
        // Numbers games
        ...(subj === 'numbers' ? [
          { id: 'count-to-10', name: 'Count to 10', minXP: 0, maxXP: 20 },
          { id: 'number-match', name: 'Number Match', minXP: 20, maxXP: 50 },
          { id: 'simple-math', name: 'Simple Math', minXP: 50, maxXP: 80 },
          { id: 'number-line', name: 'Number Line', minXP: 80, maxXP: 120 },
          { id: 'math-wizard', name: 'Math Wizard', minXP: 120, maxXP: 200 }
        ] : []),
        // Shapes games
        ...(subj === 'shapes' ? [
          { id: 'shape-hunt', name: 'Shape Hunt', minXP: 0, maxXP: 25 },
          { id: 'pattern-play', name: 'Pattern Play', minXP: 25, maxXP: 55 },
          { id: 'shape-build', name: 'Shape Build', minXP: 45, maxXP: 75 },
          { id: 'geometry-fun', name: 'Geometry Fun', minXP: 75, maxXP: 100 },
          { id: 'shape-master', name: 'Shape Master', minXP: 100, maxXP: 150 }
        ] : [])
      ]

      const subjectXPTotal = xpBySubject[subj] || 0
      
      return {
        subject: subj,
        totalXP: subjectXPTotal,
        games: games.map(game => ({
          ...game,
          unlocked: subjectXPTotal >= game.minXP,
          completed: subjectXPTotal >= game.maxXP,
          progress: Math.min(100, Math.max(0, ((subjectXPTotal - game.minXP) / (game.maxXP - game.minXP)) * 100))
        }))
      }
    }))

    // Get recent activity (last 10 sessions)
    const recentActivity = await prisma.learningScore.findMany({
      where: { childId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        subject: true,
        gameId: true,
        xpEarned: true,
        score: true,
        createdAt: true
      }
    })

    // Calculate streaks and milestones
    const today = new Date()
    const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const weeklyActivity = await prisma.learningScore.findMany({
      where: {
        childId,
        createdAt: { gte: last7Days }
      },
      select: { createdAt: true }
    })

    // Calculate daily streak
    let currentStreak = 0
    const activityDates = new Set(
      weeklyActivity.map(activity => 
        activity.createdAt.toISOString().split('T')[0]
      )
    )

    let checkDate = new Date()
    while (activityDates.has(checkDate.toISOString().split('T')[0])) {
      currentStreak++
      checkDate.setDate(checkDate.getDate() - 1)
    }

    const stats = {
      totalXP,
      starsFromXP,
      xpBySubject,
      currentStreak,
      weeklyXP: weeklyActivity.reduce((sum, activity) => {
        const dayActivity = learningScores.find(score => 
          score.createdAt.toISOString().split('T')[0] === activity.createdAt.toISOString().split('T')[0]
        )
        return sum + (dayActivity?.xpEarned || 0)
      }, 0),
      gamesUnlocked: gameProgress.reduce((sum, subject) => 
        sum + subject.games.filter(game => game.unlocked).length, 0
      ),
      gamesCompleted: gameProgress.reduce((sum, subject) => 
        sum + subject.games.filter(game => game.completed).length, 0
      )
    }

    return NextResponse.json({
      learningScores,
      gameProgress,
      recentActivity,
      stats
    })
  } catch (error) {
    console.error('Error fetching learning data:', error)
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
      subject, 
      gameId, 
      score, 
      xpEarned, 
      durationSeconds,
      metadata 
    } = body

    if (!childId || !subject || !gameId || typeof score === 'undefined' || typeof xpEarned === 'undefined') {
      return NextResponse.json({ 
        error: 'Child ID, subject, game ID, score, and XP earned required' 
      }, { status: 400 })
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

    // Create learning score record
    const learningScore = await prisma.learningScore.create({
      data: {
        childId,
        subject,
        gameId,
        score,
        xpEarned,
        durationSeconds: durationSeconds || null,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    })

    // Update child's total XP and potentially award stars
    const totalXP = await prisma.learningScore.aggregate({
      where: { childId },
      _sum: { xpEarned: true }
    })

    const newTotalXP = totalXP._sum.xpEarned || 0
    const newStars = Math.floor(newTotalXP / 100)
    
    // Update child record
    await prisma.child.update({
      where: { id: childId },
      data: {
        xp: newTotalXP,
        totalStars: Math.max(child.totalStars, newStars)
      }
    })

    // Check for new achievements/badges
    if (newStars > Math.floor((child.xp || 0) / 100)) {
      // New star earned!
      console.log(`🌟 Child ${childId} earned ${newStars - Math.floor((child.xp || 0) / 100)} new stars from learning!`)
      // TODO: Trigger achievement notification
    }

    return NextResponse.json({
      ...learningScore,
      newTotalXP,
      starsEarned: newStars - Math.floor((child.xp || 0) / 100),
      totalStars: newStars
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating learning score:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH endpoint for updating game progress/settings
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.familyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { childId, action, subject, gameId, ...updateData } = body

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

    if (action === 'reset_progress' && subject) {
      // Reset progress for a specific subject (parent/admin action)
      await prisma.learningScore.deleteMany({
        where: {
          childId,
          subject
        }
      })

      // Recalculate child's total XP
      const totalXP = await prisma.learningScore.aggregate({
        where: { childId },
        _sum: { xpEarned: true }
      })

      await prisma.child.update({
        where: { id: childId },
        data: {
          xp: totalXP._sum.xpEarned || 0
        }
      })

      return NextResponse.json({ message: 'Progress reset successfully' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating learning data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}