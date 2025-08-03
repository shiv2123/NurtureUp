'use client'

import { useState } from 'react'
import { CheckCircle, Camera, Loader2, Wifi, WifiOff } from 'lucide-react'
import { useOptimisticTasks } from '@/hooks/useOptimisticTasks'
import { Button } from '@/components/ui/button'

interface QuestActionsProps {
  taskId: string
  taskTitle: string
  task?: any // Full task object for optimistic state
  requiresProof?: boolean
  className?: string
}

export function QuestActions({ taskId, taskTitle, task, requiresProof = false, className = '' }: QuestActionsProps) {
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const { completeTask, isConnected } = useOptimisticTasks()

  // Check if task is in optimistic state
  const isOptimisticallyCompleting = task?._optimistic?.isCompleting
  const isOptimisticallyCompleted = task?._optimistic?.isCompleted || 
    (task?.completions && task.completions.length > 0)

  const handleCompleteTask = async (proofImage?: string, notes?: string) => {
    try {
      await completeTask(taskId, proofImage, notes)
    } catch (error) {
      console.error('Failed to complete task:', error)
    }
  }

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingPhoto(true)
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
        await handleCompleteTask(photoData.photoUrl)
      } else {
        console.error('Failed to upload photo')
      }
    } catch (error) {
      console.error('Error uploading photo:', error)
    } finally {
      setUploadingPhoto(false)
    }
  }

  // Show completed state
  if (isOptimisticallyCompleted) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-success font-semibold bg-success/10 px-4 py-2 rounded-lg border border-success/20">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">
            {task?.requiresProof && !task?.completions?.[0]?.isApproved
              ? 'Waiting for approval...'
              : 'Quest Complete! ✨'
            }
          </span>
        </div>
        {!isConnected && (
          <div className="flex items-center gap-1 text-warning text-xs">
            <WifiOff className="w-3 h-3" />
            <span>Offline</span>
          </div>
        )}
      </div>
    )
  }

  const isLoading = isOptimisticallyCompleting || uploadingPhoto

  return (
    <div className={`flex gap-2 ${className}`}>
      {/* Connection status indicator */}
      {!isConnected && (
        <div className="flex items-center gap-1 text-warning text-xs px-2 py-1 bg-warning/10 rounded border border-warning/20">
          <WifiOff className="w-3 h-3" />
          <span>Offline</span>
        </div>
      )}
      
      <Button
        onClick={() => handleCompleteTask()}
        disabled={isLoading}
        size="sm"
        className="bg-success hover:bg-success/90"
      >
        {isOptimisticallyCompleting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Completing...
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Complete Quest
          </>
        )}
      </Button>
      
      {requiresProof && (
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isLoading}
          />
          <Button
            disabled={isLoading}
            size="sm"
            variant="secondary"
          >
            {uploadingPhoto ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Camera className="w-4 h-4 mr-2" />
                Add Photo
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}