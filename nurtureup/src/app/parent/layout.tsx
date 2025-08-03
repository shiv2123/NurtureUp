import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { StageAdaptiveLayout } from '@/components/parent/StageAdaptiveLayout'
import { Child } from '@/hooks/useStage'

export default async function ParentLayout({
  children
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  // TEMPORARY: For demo mode, allow access without authentication
  // Comment out authentication check to enable demo access
  
  // if (!session) {
  //   redirect('/login')
  // }

  // if (session?.user.role !== 'PARENT') {
  //   redirect('/adventure')
  // }

  // For demo mode (no session), provide mock children data
  let stageChildren: Child[] = []
  
  if (session) {
    // Fetch children data for stage detection when authenticated
    try {
      const childrenData = await prisma.child.findMany({
        where: { familyId: session.user.familyId! },
        include: { user: true }
      })

      // Convert to our Child interface
      stageChildren = childrenData.map(child => ({
        id: child.id,
        name: child.user.name,
        dateOfBirth: child.dateOfBirth || new Date(),
      }))
    } catch (error) {
      console.error('Error fetching children:', error)
      // Fallback to empty array if database query fails
      stageChildren = []
    }
  } else {
    // Mock data for demo mode
    stageChildren = [
      {
        id: 'demo-child-1',
        name: 'Emma',
        dateOfBirth: new Date('2019-03-15') // 5 years old - early childhood
      }
    ]
  }

  // TEMPORARY: Bypass StageAdaptiveLayout to show pure demo UI
  return <>{children}</>
  
  // Original layout (commented for demo)
  // return (
  //   <StageAdaptiveLayout childrenData={stageChildren}>
  //     {children}
  //   </StageAdaptiveLayout>
  // )
} 