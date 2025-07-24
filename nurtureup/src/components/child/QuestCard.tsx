'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { PhotoUpload } from '@/components/shared/PhotoUpload'
import { ConfettiAnimation } from '@/components/shared/ConfettiAnimation'
import { Camera, Check, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuestCardProps {
  task: {
    id: string
    title: string
    description?: string | null
    difficulty: number
    starValue: number
    requiresProof: boolean
    dueDate?: string | null
  }
  completion?: {
    id: string
    isApproved: boolean
    approvedAt?: string | null
    notes?: string | null
    starsAwarded: number
    bonusStars: number
    coinsAwarded: number
  } | null
  onComplete: (taskId: string, proofImage?: string) => Promise<void>
}

const difficultyGradients = [
  'from-yellow-300 to-yellow-400',
  'from-orange-300 to-orange-400',
  'from-red-300 to-red-400',
  'from-purple-300 to-purple-400',
  'from-indigo-300 to-indigo-400'
]

export function QuestCard({ task, completion, onComplete }: QuestCardProps) {
  const [isCompleting, setIsCompleting] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)
  const [showPhotoDialog, setShowPhotoDialog] = useState(false)
  const [proofImage, setProofImage] = useState<string | null>(null)

  // Determine current status
  const getStatus = () => {
    if (!completion) return 'available'
    if (completion.approvedAt && completion.isApproved) return 'approved'
    if (completion.approvedAt && !completion.isApproved) return 'rejected'
    return 'pending'
  }

  const status = getStatus()

  const handleComplete = async () => {
    try {
      setIsCompleting(true)
      if (task.requiresProof && !proofImage) {
        setShowPhotoDialog(true)
        return
      }
      await onComplete(task.id, proofImage || undefined)
      setIsFlipped(true)
      setShowConfetti(true)
      setTimeout(() => {
        setShowConfetti(false)
        setIsFlipped(false)
      }, 1500)
    } catch (error) {
      // Handle error
    } finally {
      setIsCompleting(false)
    }
  }

  const handlePhotoSubmit = async () => {
    if (!proofImage) return
    
    setShowPhotoDialog(false)
    try {
      setIsCompleting(true)
      await onComplete(task.id, proofImage)
      setIsFlipped(true)
      setShowConfetti(true)
      setTimeout(() => {
        setShowConfetti(false)
        setIsFlipped(false)
      }, 1500)
    } catch (error) {
      // Handle error
    } finally {
      setIsCompleting(false)
    }
  }

  return (
    <div className="relative">
      {/* Confetti Animation */}
      <ConfettiAnimation
        isActive={showConfetti}
        duration={2000}
        intensity="high"
        emojis={['🎉', '⭐', '🎊', '✨', '🏆', '🎈', '🌟']}
        onComplete={() => setShowConfetti(false)}
      />
      <Card
        className={cn(
          'relative overflow-hidden cursor-pointer transition-all',
          'hover:shadow-large',
          isFlipped && 'pointer-events-none opacity-60'
        )}
      >
        {/* Front of card */}
        <div
          className={cn(
            'p-6 bg-gradient-to-br',
            difficultyGradients[task.difficulty - 1],
            isFlipped && 'invisible'
          )}
        >
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-bold text-white font-child">
              {task.title}
            </h3>
            <div className="flex items-center gap-1">
              {Array.from({ length: task.starValue }).map((_, i) => (
                <span key={i} className="text-2xl">⭐</span>
              ))}
            </div>
          </div>
          {task.description && (
            <p className="text-white/80 text-sm mb-4">
              {task.description}
            </p>
          )}
          {task.dueDate && (
            <div className="flex items-center gap-2 text-white/70 text-sm mb-4">
              <Clock className="w-4 h-4" />
              <span>Due by {new Date(task.dueDate).toLocaleTimeString()}</span>
            </div>
          )}
          {/* Status-based button/info */}
          {status === 'available' && (
            <Button
              onClick={handleComplete}
              isLoading={isCompleting}
              variant="secondary"
              className="w-full bg-white/20 hover:bg-white/30 text-white border-2 border-white/50"
            >
              {task.requiresProof ? (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Complete Quest
                </>
              )}
            </Button>
          )}

          {status === 'pending' && (
            <div className="bg-white/20 rounded-lg p-3 text-center text-white">
              <div className="flex items-center justify-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Waiting for Review</span>
              </div>
              <p className="text-xs text-white/80">
                Your parent is reviewing your work!
              </p>
            </div>
          )}

          {status === 'approved' && completion && (
            <div className="bg-white/20 rounded-lg p-3 text-center text-white">
              <div className="flex items-center justify-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">Approved! 🎉</span>
              </div>
              <div className="text-xs text-white/80">
                <div>+{completion.starsAwarded + completion.bonusStars} stars</div>
                <div>+{completion.coinsAwarded} coins earned!</div>
                {completion.notes && (
                  <div className="mt-1 italic">"{completion.notes}"</div>
                )}
              </div>
            </div>
          )}

          {status === 'rejected' && completion && (
            <div className="bg-white/20 rounded-lg p-3 text-center text-white">
              <div className="flex items-center justify-center gap-2 mb-1">
                <XCircle className="w-4 h-4" />
                <span className="font-medium">Try Again</span>
              </div>
              <div className="text-xs text-white/80">
                {completion.notes || "Your parent wants you to give it another try!"}
              </div>
              <Button
                onClick={handleComplete}
                isLoading={isCompleting}
                variant="secondary"
                size="sm"
                className="mt-2 bg-white/20 hover:bg-white/30 text-white border border-white/50"
              >
                <Check className="w-3 h-3 mr-1" />
                Try Again
              </Button>
            </div>
          )}
        </div>
        {/* Back of card (shown when flipped) */}
        {isFlipped && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-mint-green to-sky-blue p-6">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-white font-child">
                Quest Complete!
              </h3>
              <p className="text-white/80 mt-2">
                +{task.starValue} stars earned!
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Photo Upload Dialog */}
      <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-sage-green" />
              Add Photo Proof
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-sm text-black">
              Take a photo or upload an image to show you completed "{task.title}"
            </div>
            
            <PhotoUpload
              onImageSelected={setProofImage}
              onImageRemoved={() => setProofImage(null)}
              currentImage={proofImage || undefined}
              placeholder="Take photo of your completed task"
            />
            
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPhotoDialog(false)
                  setProofImage(null)
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePhotoSubmit}
                disabled={!proofImage || isCompleting}
                isLoading={isCompleting}
                className="flex-1 bg-sage-green hover:bg-sage-green/90"
              >
                Complete Quest
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 