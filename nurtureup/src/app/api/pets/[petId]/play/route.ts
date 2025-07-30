import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ petId: string }> }
) {
  try {
    const { petId } = await params
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

    const pet = await prisma.virtualPet.findFirst({
      where: {
        id: petId,
        childId: child.id
      }
    })

    if (!pet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 })
    }

    // Calculate new stats after playing
    const newHappiness = Math.min(100, pet.happiness + 15)
    const newEnergy = Math.max(0, pet.energy - 10)
    const bonusXp = 5

    // Update pet stats
    const updatedPet = await prisma.virtualPet.update({
      where: { id: petId },
      data: {
        happiness: newHappiness,
        energy: newEnergy,
        lastPlayed: new Date()
      }
    })

    // Give the child some bonus XP for playing with their pet
    await prisma.child.update({
      where: { id: child.id },
      data: {
        xp: { increment: bonusXp }
      }
    })

    return NextResponse.json({
      success: true,
      pet: updatedPet,
      bonusXp,
      message: 'Had fun playing with your pet!'
    })
  } catch (error) {
    console.error('Failed to play with pet:', error)
    return NextResponse.json(
      { error: 'Failed to play with pet' },
      { status: 500 }
    )
  }
}