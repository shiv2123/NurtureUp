import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PetCareService } from '@/lib/petCareService'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'CHILD') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const child = await prisma.child.findUnique({
      where: { userId: session.user.id },
      include: { pet: true }
    })
    if (!child || !child.pet) {
      return NextResponse.json({ error: 'Virtual pet not found' }, { status: 404 })
    }

    const petCareService = PetCareService.getInstance()
    
    // Apply decay to get current stats
    const decayedStats = petCareService.calculateDecay(child.pet)
    
    // Get care schedule info
    const careSchedule = petCareService.getNextCareTime(child.pet.lastFed, child.pet.lastPlayed)
    
    // Update pet if decay occurred
    if (
      decayedStats.happiness !== child.pet.happiness ||
      decayedStats.energy !== child.pet.energy ||
      decayedStats.mood !== child.pet.mood
    ) {
      await prisma.virtualPet.update({
        where: { id: child.pet.id },
        data: {
          happiness: decayedStats.happiness,
          energy: decayedStats.energy,
          mood: decayedStats.mood
        }
      })
    }
    
    // Return updated pet data with care schedule
    const updatedPet = {
      ...child.pet,
      happiness: decayedStats.happiness,
      energy: decayedStats.energy,
      mood: decayedStats.mood,
      careSchedule: {
        canFeedNow: careSchedule.canFeedNow,
        canPlayNow: careSchedule.canPlayNow,
        nextFeeding: careSchedule.nextFeeding?.toISOString() || null,
        nextPlay: careSchedule.nextPlay?.toISOString() || null
      }
    }

    return NextResponse.json(updatedPet)
  } catch (error) {
    console.error('Failed to fetch pet:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pet' },
      { status: 500 }
    )
  }
} 