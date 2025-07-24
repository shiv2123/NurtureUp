'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, ArrowRight, CheckCircle } from 'lucide-react'

interface PendingApproval {
  id: string
  completedAt: string
  task: {
    title: string
    difficulty: number
  }
  child: {
    nickname: string
    avatar?: string | null
  }
}

export function PendingApprovalsSummary() {
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPendingApprovals = async () => {
      try {
        const response = await fetch('/api/parent/pending-approvals')
        if (!response.ok) throw new Error('Failed to fetch approvals')
        
        const data = await response.json()
        setPendingApprovals(data.pendingApprovals)
      } catch (error) {
        console.error('Error fetching pending approvals:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPendingApprovals()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-slate-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (pendingApprovals.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-success" />
            All Approved!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-black">
            No tasks are waiting for your approval right now.
          </p>
        </CardContent>
      </Card>
    )
  }

  const recentApprovals = pendingApprovals.slice(0, 3)

  return (
    <Card className="border-warning/20 bg-warning/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-5 h-5 text-warning" />
          Pending Approvals
          <Badge variant="outline" className="ml-auto">
            {pendingApprovals.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentApprovals.map((approval) => (
          <div
            key={approval.id}
            className="flex items-center justify-between p-3 bg-white rounded-lg border"
          >
            <div className="flex items-center space-x-3">
              <div className="text-xl">
                {approval.child.avatar || '👤'}
              </div>
              <div>
                <div className="font-medium text-sm">
                  {approval.task.title}
                </div>
                <div className="text-xs text-black">
                  by {approval.child.nickname}
                </div>
              </div>
            </div>
            <div className="text-xs text-black">
              {new Date(approval.completedAt).toLocaleDateString()}
            </div>
          </div>
        ))}
        
        {pendingApprovals.length > 3 && (
          <div className="text-center text-sm text-black pt-2">
            and {pendingApprovals.length - 3} more...
          </div>
        )}
        
        <div className="pt-2">
          <Link href="/parent/approvals">
            <Button variant="outline" size="sm" className="w-full">
              Review All Approvals
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}