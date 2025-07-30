'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, X, Loader2 } from 'lucide-react'

interface ApprovalButtonProps {
  completionId: string
  taskTitle: string
  childName: string
  className?: string
}

export function ApprovalButton({ completionId, taskTitle, childName, className = '' }: ApprovalButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isApproved, setIsApproved] = useState(false)
  const router = useRouter()

  const handleApprove = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/tasks/completions/${completionId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isApproved: true,
          bonusStars: 0
        }),
      })

      if (response.ok) {
        setIsApproved(true)
        // Refresh the page to show updated data
        router.refresh()
      } else {
        console.error('Failed to approve task')
      }
    } catch (error) {
      console.error('Error approving task:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isApproved) {
    return (
      <div className="flex items-center gap-2 text-green-600 text-sm">
        <CheckCircle className="w-4 h-4" />
        Approved
      </div>
    )
  }

  return (
    <button
      onClick={handleApprove}
      disabled={isLoading}
      className={`bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <CheckCircle className="w-4 h-4 mr-2" />
          Approve
        </>
      )}
    </button>
  )
}