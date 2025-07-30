import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params
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

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        assignedToId: child.id,
        isActive: true
      }
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('photo') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No photo provided' }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'task-photos')
    
    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${taskId}-${child.id}-${timestamp}.${file.name.split('.').pop()}`
    const filepath = join(uploadDir, filename)
    
    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    try {
      await writeFile(filepath, buffer)
    } catch (error) {
      console.error('Failed to save file:', error)
      return NextResponse.json({ error: 'Failed to save photo' }, { status: 500 })
    }

    // Return the photo URL
    const photoUrl = `/uploads/task-photos/${filename}`
    
    return NextResponse.json({ 
      success: true, 
      photoUrl,
      message: 'Photo uploaded successfully' 
    })
  } catch (error) {
    console.error('Failed to upload photo:', error)
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    )
  }
}