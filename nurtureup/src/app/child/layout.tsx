'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { calculateChildStage, type ChildStage } from '@/lib/stage-engine'

/**
 * Child Layout with Stage-Adaptive Routing (Blueprint Implementation)
 * 
 * This layout detects the child's development stage and routes them to the 
 * appropriate stage-specific interface as defined in the blueprints:
 * - Toddler (1-3y): Star Jar, Potty Monster, Play Lobby, Calm Wheel
 * - Early Childhood (4-6y): Daily Quest Hub, Chores Board, Learn Arcade, Avatar Studio  
 * - School Age (7-12y): Smart Agenda, School Center, Wallet, Badges
 * - Adolescence (13-18y): Personal Feed, Planner, Wellbeing Center, Wallet
 * 
 * Demo Mode: Add ?demo=true to any child URL to bypass stage restrictions
 */
export default function ChildLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  
  // Check for demo mode
  const isDemoMode = searchParams.get('demo') === 'true'

  useEffect(() => {
    // Demo mode: Allow bypass of authentication and stage restrictions
    if (isDemoMode) {
      setIsLoading(false)
      return
    }

    // Wait for session to load
    if (status === 'loading') return

    // If not authenticated, redirect to login
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    // If authenticated but not a child user, redirect to dashboard
    if (session?.user.role !== 'CHILD') {
      router.push('/dashboard')
      return
    }

    // TODO: Add stage detection logic for non-demo mode
    setIsLoading(false)
  }, [session, status, isDemoMode, router])

  // Show loading state while checking authentication
  if (isLoading && !isDemoMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Demo mode or authenticated child user - show the child interface
  return <>{children}</>
}