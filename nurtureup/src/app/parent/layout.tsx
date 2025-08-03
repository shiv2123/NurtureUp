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

  if (!session) {
    redirect('/login')
  }

  if (session.user.role !== 'PARENT') {
    redirect('/adventure')
  }

  // Fetch children data for stage detection
  const childrenData = await prisma.child.findMany({
    where: { familyId: session.user.familyId! },
    include: { user: true }
  })

  // Convert to our Child interface
  const stageChildren: Child[] = childrenData.map(child => ({
    id: child.id,
    name: child.user.name,
    dateOfBirth: child.dateOfBirth || new Date(), // Use actual DOB when available
  }))

  // TEMPORARY: Bypass StageAdaptiveLayout to show pure demo UI
  return <>{children}</>
  
  // Original layout (commented for demo)
  // return (
  //   <StageAdaptiveLayout childrenData={stageChildren}>
  //     {children}
  //   </StageAdaptiveLayout>
  // )
} 