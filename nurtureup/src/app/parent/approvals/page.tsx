'use client'

import { useState, useEffect } from 'react'
import { TaskApprovalCenter } from '@/components/parent/TaskApprovalCenter'

interface TaskCompletion {
  id: string
  completedAt: string
  proofImage?: string | null
  notes?: string | null
  starsAwarded: number
  task: {
    id: string
    title: string
    description?: string | null
    difficulty: number
    category?: string | null
  }
  child: {
    id: string
    nickname: string
    avatar?: string | null
  }
}

export default function ApprovalsPage() {
  const [pendingApprovals, setPendingApprovals] = useState<TaskCompletion[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchPendingApprovals = async () => {
    try {
      const response = await fetch('/api/parent/pending-approvals')
      if (!response.ok) throw new Error('Failed to fetch approvals')
      
      const data = await response.json()
      setPendingApprovals(data.pendingApprovals.map((approval: any) => ({
        ...approval,
        completedAt: new Date(approval.completedAt)
      })))
    } catch (error) {
      console.error('Error fetching pending approvals:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingApprovals()
  }, [])

  const handleApprovalComplete = () => {
    fetchPendingApprovals()
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-gray">
          Task Approvals
        </h1>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-green"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-gray">
          Task Approvals
        </h1>
        <div className="text-sm text-black">
          {pendingApprovals.length} pending approval{pendingApprovals.length !== 1 ? 's' : ''}
        </div>
      </div>

      <TaskApprovalCenter 
        pendingApprovals={pendingApprovals}
        onApprovalComplete={handleApprovalComplete}
      />
    </div>
  )
}