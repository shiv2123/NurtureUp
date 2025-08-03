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
    const category = searchParams.get('category')
    
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

    const whereClause = { childId }
    if (category) {
      Object.assign(whereClause, { category })
    }

    const skills = await prisma.schoolReadinessSkill.findMany({
      where: whereClause,
      orderBy: [
        { category: 'asc' },
        { skill: 'asc' }
      ]
    })

    // Group by categories and calculate progress
    const categories = ['social', 'emotional', 'cognitive', 'physical', 'communication']
    const categorizedData = categories.map(cat => {
      const categorySkills = skills.filter(skill => skill.category === cat)
      const averageLevel = categorySkills.length > 0 ? 
        categorySkills.reduce((sum, skill) => sum + skill.level, 0) / categorySkills.length : 0
      const progress = Math.round((averageLevel / 4) * 100)
      
      return {
        name: cat,
        skills: categorySkills,
        averageLevel,
        progress
      }
    })

    // Calculate overall readiness
    const overallReadiness = skills.length > 0 ? 
      Math.round((skills.reduce((sum, skill) => sum + skill.level, 0) / (skills.length * 4)) * 100) : 0

    // Generate recommendations
    const recommendations: string[] = []
    categorizedData.forEach(category => {
      const lowSkills = category.skills.filter(skill => skill.level < 3)
      if (lowSkills.length > 0) {
        recommendations.push(`Focus on ${category.name} skills: ${lowSkills.map(s => s.skill).join(', ')}`)
      }
    })

    if (recommendations.length === 0) {
      recommendations.push('Great progress! Continue practicing all areas for school readiness.')
    }

    return NextResponse.json({
      skills,
      categories: categorizedData,
      overallReadiness,
      recommendations
    })
  } catch (error) {
    console.error('Error fetching school readiness data:', error)
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
    const { childId, category, skill, level, notes, assessedAt } = body

    if (!childId || !category || !skill || level === undefined) {
      return NextResponse.json({ error: 'Child ID, category, skill, and level required' }, { status: 400 })
    }

    if (level < 1 || level > 4) {
      return NextResponse.json({ error: 'Level must be between 1 and 4' }, { status: 400 })
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

    // Check if skill assessment already exists
    const existingSkill = await prisma.schoolReadinessSkill.findFirst({
      where: {
        childId,
        category,
        skill
      }
    })

    let skillAssessment

    if (existingSkill) {
      // Update existing assessment
      skillAssessment = await prisma.schoolReadinessSkill.update({
        where: { id: existingSkill.id },
        data: {
          level,
          notes,
          assessedAt: assessedAt ? new Date(assessedAt) : new Date(),
          assessedBy: session.user.id
        }
      })
    } else {
      // Create new assessment
      skillAssessment = await prisma.schoolReadinessSkill.create({
        data: {
          childId,
          category,
          skill,
          level,
          notes,
          assessedAt: assessedAt ? new Date(assessedAt) : new Date(),
          assessedBy: session.user.id
        }
      })
    }

    return NextResponse.json(skillAssessment, { status: 201 })
  } catch (error) {
    console.error('Error creating skill assessment:', error)
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
    const { id, level, notes, assessedAt } = body

    if (!id) {
      return NextResponse.json({ error: 'Skill assessment ID required' }, { status: 400 })
    }

    // Verify skill assessment belongs to family
    const skillAssessment = await prisma.schoolReadinessSkill.findFirst({
      where: { id },
      include: {
        child: true
      }
    })

    if (!skillAssessment || skillAssessment.child.familyId !== session.user.familyId) {
      return NextResponse.json({ error: 'Skill assessment not found' }, { status: 404 })
    }

    const updateData: { level?: number; notes?: string; assessedAt?: Date; assessedBy?: string } = {}
    
    if (level !== undefined) {
      if (level < 1 || level > 4) {
        return NextResponse.json({ error: 'Level must be between 1 and 4' }, { status: 400 })
      }
      updateData.level = level
    }
    
    if (notes !== undefined) updateData.notes = notes
    if (assessedAt) updateData.assessedAt = new Date(assessedAt)
    updateData.assessedBy = session.user.id

    const updatedSkill = await prisma.schoolReadinessSkill.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(updatedSkill)
  } catch (error) {
    console.error('Error updating skill assessment:', error)
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
      return NextResponse.json({ error: 'Skill assessment ID required' }, { status: 400 })
    }

    // Verify skill assessment belongs to family
    const skillAssessment = await prisma.schoolReadinessSkill.findFirst({
      where: { id },
      include: {
        child: true
      }
    })

    if (!skillAssessment || skillAssessment.child.familyId !== session.user.familyId) {
      return NextResponse.json({ error: 'Skill assessment not found' }, { status: 404 })
    }

    await prisma.schoolReadinessSkill.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Skill assessment deleted successfully' })
  } catch (error) {
    console.error('Error deleting skill assessment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}