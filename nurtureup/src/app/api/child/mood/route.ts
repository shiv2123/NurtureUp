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
    const period = searchParams.get('period') || '7' // days
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

    // Calculate date range
    const periodDays = parseInt(period)
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - (periodDays * 24 * 60 * 60 * 1000))

    const moodEntries = await prisma.moodEntry.findMany({
      where: {
        childId,
        loggedAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { loggedAt: 'desc' },
      take: limit
    })

    // Calculate mood statistics
    const moodScores = moodEntries.map(entry => entry.moodScore)
    const averageMood = moodScores.length > 0 
      ? moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length 
      : 0

    // Calculate mood trend (daily averages for the period)
    const trendData = []
    for (let i = periodDays - 1; i >= 0; i--) {
      const date = new Date(endDate.getTime() - (i * 24 * 60 * 60 * 1000))
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
      
      const dayEntries = moodEntries.filter(entry => 
        entry.loggedAt >= dayStart && entry.loggedAt < dayEnd
      )
      
      const dayAverage = dayEntries.length > 0 
        ? dayEntries.reduce((sum, entry) => sum + entry.moodScore, 0) / dayEntries.length
        : null
      
      trendData.push({
        date: dayStart.toISOString().split('T')[0],
        averageMood: dayAverage,
        entryCount: dayEntries.length
      })
    }

    // Get most recent mood
    const latestMood = moodEntries[0]

    // Calculate wellness insights
    const positiveEntries = moodEntries.filter(entry => entry.moodScore >= 7).length
    const neutralEntries = moodEntries.filter(entry => entry.moodScore >= 4 && entry.moodScore < 7).length
    const concerningEntries = moodEntries.filter(entry => entry.moodScore < 4).length
    
    const moodDistribution = {
      positive: positiveEntries,
      neutral: neutralEntries,
      concerning: concerningEntries
    }

    // Get common mood factors/tags
    const allTags = moodEntries
      .filter(entry => entry.tags)
      .flatMap(entry => entry.tags ? entry.tags.split(',') : [])
      .filter(tag => tag.trim())
    
    const tagCounts = allTags.reduce((counts, tag) => {
      const trimmedTag = tag.trim()
      counts[trimmedTag] = (counts[trimmedTag] || 0) + 1
      return counts
    }, {} as Record<string, number>)

    const topTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }))

    const stats = {
      totalEntries: moodEntries.length,
      averageMood: Math.round(averageMood * 10) / 10,
      moodDistribution,
      topTags,
      latestMood: latestMood ? {
        score: latestMood.moodScore,
        emoji: getMoodEmoji(latestMood.moodScore),
        date: latestMood.loggedAt,
        notes: latestMood.notes
      } : null,
      streakDays: calculateMoodStreak(moodEntries)
    }

    return NextResponse.json({
      moodEntries,
      trendData,
      stats
    })
  } catch (error) {
    console.error('Error fetching mood data:', error)
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
      moodScore, 
      notes, 
      tags, 
      energy, 
      stress, 
      sleep, 
      socialInteraction,
      activities,
      triggers
    } = body

    if (!childId || typeof moodScore === 'undefined') {
      return NextResponse.json({ 
        error: 'Child ID and mood score required' 
      }, { status: 400 })
    }

    if (moodScore < 1 || moodScore > 10) {
      return NextResponse.json({ 
        error: 'Mood score must be between 1 and 10' 
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

    const moodEntry = await prisma.moodEntry.create({
      data: {
        childId,
        moodScore,
        notes: notes || null,
        tags: tags && Array.isArray(tags) ? tags.join(',') : tags || null,
        energy: energy || null,
        stress: stress || null,
        sleep: sleep || null,
        socialInteraction: socialInteraction || null,
        activities: activities && Array.isArray(activities) ? activities.join(',') : activities || null,
        triggers: triggers && Array.isArray(triggers) ? triggers.join(',') : triggers || null,
      }
    })

    // Check for concerning patterns
    const recentEntries = await prisma.moodEntry.findMany({
      where: {
        childId,
        loggedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      orderBy: { loggedAt: 'desc' }
    })

    const concerningPattern = checkForConcerningPatterns(recentEntries)

    return NextResponse.json({
      ...moodEntry,
      moodEmoji: getMoodEmoji(moodScore),
      concerningPattern
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating mood entry:', error)
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
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Mood entry ID required' }, { status: 400 })
    }

    // Find and verify mood entry belongs to family
    const moodEntry = await prisma.moodEntry.findFirst({
      where: {
        id,
        child: {
          familyId: session.user.familyId
        }
      }
    })

    if (!moodEntry) {
      return NextResponse.json({ error: 'Mood entry not found' }, { status: 404 })
    }

    // Process array fields
    if (updateData.tags && Array.isArray(updateData.tags)) {
      updateData.tags = updateData.tags.join(',')
    }
    if (updateData.activities && Array.isArray(updateData.activities)) {
      updateData.activities = updateData.activities.join(',')
    }
    if (updateData.triggers && Array.isArray(updateData.triggers)) {
      updateData.triggers = updateData.triggers.join(',')
    }

    const updatedEntry = await prisma.moodEntry.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      ...updatedEntry,
      moodEmoji: getMoodEmoji(updatedEntry.moodScore)
    })
  } catch (error) {
    console.error('Error updating mood entry:', error)
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

    if (!id) {
      return NextResponse.json({ error: 'Mood entry ID required' }, { status: 400 })
    }

    // Find and verify mood entry belongs to family
    const moodEntry = await prisma.moodEntry.findFirst({
      where: {
        id,
        child: {
          familyId: session.user.familyId
        }
      }
    })

    if (!moodEntry) {
      return NextResponse.json({ error: 'Mood entry not found' }, { status: 404 })
    }

    await prisma.moodEntry.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Mood entry deleted successfully' })
  } catch (error) {
    console.error('Error deleting mood entry:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper functions
function getMoodEmoji(score: number): string {
  if (score >= 9) return '😊'
  if (score >= 7) return '🙂'
  if (score >= 5) return '😐'
  if (score >= 3) return '😔'
  return '😢'
}

function calculateMoodStreak(entries: any[]): number {
  // Calculate consecutive days with mood entries
  if (entries.length === 0) return 0
  
  const today = new Date()
  const dates = new Set(
    entries.map(entry => 
      new Date(entry.loggedAt).toISOString().split('T')[0]
    )
  )
  
  let streak = 0
  let checkDate = new Date(today)
  
  while (dates.has(checkDate.toISOString().split('T')[0])) {
    streak++
    checkDate.setDate(checkDate.getDate() - 1)
  }
  
  return streak
}

function checkForConcerningPatterns(entries: any[]): { 
  hasPattern: boolean; 
  type?: string; 
  message?: string 
} {
  if (entries.length < 3) return { hasPattern: false }
  
  const recentScores = entries.slice(0, 5).map(e => e.moodScore)
  const averageRecent = recentScores.reduce((a, b) => a + b, 0) / recentScores.length
  
  // Check for consistently low mood
  if (averageRecent < 4 && recentScores.every(score => score < 5)) {
    return {
      hasPattern: true,
      type: 'low_mood',
      message: 'Consistently low mood detected. Consider reaching out for support.'
    }
  }
  
  // Check for high stress indicators
  const highStressEntries = entries.filter(entry => entry.stress && entry.stress > 7).length
  if (highStressEntries > entries.length * 0.6) {
    return {
      hasPattern: true,
      type: 'high_stress',
      message: 'High stress levels detected. Consider stress management techniques.'
    }
  }
  
  return { hasPattern: false }
}