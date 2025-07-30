'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Camera, Loader2 } from 'lucide-react'

interface QuestActionsProps {
  taskId: string
  taskTitle: string
  requiresProof?: boolean
  className?: string
}

export function QuestActions({ taskId, taskTitle, requiresProof = false, className = '' }: QuestActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [showPhotoUpload, setShowPhotoUpload] = useState(false)
  const router = useRouter()

  const handleStartQuest = async (proofImage?: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completedAt: new Date().toISOString(),
          proofImage,
        }),
      })

      if (response.ok) {
        setIsCompleted(true)
        // Refresh the page to show updated data
        router.refresh()
      } else {
        console.error('Failed to complete task')
      }
    } catch (error) {
      console.error('Error completing task:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('photo', file)
      formData.append('taskId', taskId)

      const photoResponse = await fetch(`/api/tasks/${taskId}/photo`, {
        method: 'POST',
        body: formData,
      })

      if (photoResponse.ok) {
        const photoData = await photoResponse.json()
        // After photo upload, complete the task with the photo URL
        await handleStartQuest(photoData.photoUrl)
      } else {
        console.error('Failed to upload photo')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Error uploading photo:', error)
      setIsLoading(false)
    }
  }

  if (isCompleted) {
    return (
      <div className="flex items-center gap-2 text-green-600 font-medium">
        <CheckCircle className="w-4 h-4" />
        Complete!
      </div>
    )
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      <button
        onClick={handleStartQuest}
        disabled={isLoading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center transition-colors"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <CheckCircle className="w-4 h-4 mr-1" />
            Complete
          </>
        )}
      </button>
      
      {requiresProof && (
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isLoading}
          />
          <button
            disabled={isLoading}
            className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center transition-colors"
          >
            <Camera className="w-4 h-4 mr-1" />
            Photo
          </button>
        </div>
      )}
    </div>
  )
}