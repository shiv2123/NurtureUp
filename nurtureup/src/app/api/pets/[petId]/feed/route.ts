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

    // Calculate new stats after feeding
    const newHappiness = Math.min(100, pet.happiness + 10)
    const newEnergy = Math.min(100, pet.energy + 5)
    const newHunger = Math.max(0, pet.hunger - 20)

    // Update pet stats
    const updatedPet = await prisma.virtualPet.update({
      where: { id: petId },
      data: {
        happiness: newHappiness,
        energy: newEnergy,
        hunger: newHunger,
        lastFed: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      pet: updatedPet,
      message: 'Pet fed successfully!'
    })
  } catch (error) {
    console.error('Failed to feed pet:', error)
    return NextResponse.json(
      { error: 'Failed to feed pet' },
      { status: 500 }
    )
  }
}