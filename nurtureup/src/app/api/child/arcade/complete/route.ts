import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const completeSchema = z.object({
  subject: z.string(),
  score: z.number(),
  total: z.number()
})

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { subject, score, total } = completeSchema.parse(body)

    // Award bonus stars: 2 stars per correct answer
    const stars = score * 2
    await prisma.child.update({
      where: { id: child.id },
      data: {
        totalStars: { increment: stars },
        xp: { increment: score * 5 }
      }
    })

    // Save quiz completion (optional, for progress tracking)
    await prisma.learningScore.create({
      data: {
        childId: child.id,
        subject,
        score: Math.round((score / total) * 100),
        questionsAnswered: total,
        correctAnswers: score,
        timeSpent: 0, // Not tracked in this MVP
        completedAt: new Date()
      }
    })

    return NextResponse.json({ starsAwarded: stars })
  } catch (error) {
    console.error('Failed to record quiz completion:', error)
    return NextResponse.json(
      { error: 'Failed to record quiz completion' },
      { status: 500 }
    )
  }
} 