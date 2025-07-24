'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Star, 
  Camera,
  MessageSquare,
  Gift
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Image from 'next/image'

interface TaskCompletion {
  id: string
  completedAt: Date
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

interface TaskApprovalCenterProps {
  pendingApprovals: TaskCompletion[]
  onApprovalComplete?: () => void
}

export function TaskApprovalCenter({ pendingApprovals, onApprovalComplete }: TaskApprovalCenterProps) {
  const [selectedCompletion, setSelectedCompletion] = useState<TaskCompletion | null>(null)
  const [isApproving, setIsApproving] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [bonusStars, setBonusStars] = useState(0)

  const handleApproval = async (approved: boolean) => {
    if (!selectedCompletion) return

    try {
      setIsApproving(true)
      
      const response = await fetch(`/api/tasks/completions/${selectedCompletion.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approved,
          feedback: feedback.trim() || undefined,
          bonusStars: approved ? bonusStars : 0
        })
      })

      if (!response.ok) {
        throw new Error('Failed to process approval')
      }

      const result = await response.json()
      
      // Show success message
      if (approved) {
        alert(`✅ Task approved! ${selectedCompletion.child.nickname} earned ${result.starsAwarded} stars and ${result.coinsEarned} coins!`)
      } else {
        alert(`❌ Task feedback sent to ${selectedCompletion.child.nickname}`)
      }

      // Reset form and close dialog
      setSelectedCompletion(null)
      setFeedback('')
      setBonusStars(0)
      
      // Refresh the parent component
      onApprovalComplete?.()

    } catch (error) {
      console.error('Error processing approval:', error)
      alert('Failed to process approval. Please try again.')
    } finally {
      setIsApproving(false)
    }
  }

  const openApprovalDialog = (completion: TaskCompletion) => {
    setSelectedCompletion(completion)
    setFeedback('')
    setBonusStars(0)
  }

  if (pendingApprovals.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <CheckCircle className="w-16 h-16 mx-auto text-success mb-4" />
          <h3 className="text-xl font-semibold text-black mb-2">
            All caught up!
          </h3>
          <p className="text-black">
            No tasks waiting for your approval right now.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-warning" />
            Tasks Awaiting Approval ({pendingApprovals.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pendingApprovals.map((completion) => (
            <div
              key={completion.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="text-2xl">
                  {completion.child.avatar || '👤'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{completion.task.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {completion.child.nickname}
                    </Badge>
                  </div>
                  <div className="text-sm text-black flex items-center gap-4">
                    <span>Completed {formatDate(completion.completedAt)}</span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-sunny-yellow" />
                      {completion.starsAwarded} stars
                    </span>
                    {completion.proofImage && (
                      <span className="flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        Photo attached
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Button
                onClick={() => openApprovalDialog(completion)}
                variant="outline"
                size="sm"
              >
                Review
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog 
        open={!!selectedCompletion} 
        onOpenChange={() => !isApproving && setSelectedCompletion(null)}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{selectedCompletion?.child.avatar || '👤'}</span>
              Review Task Completion
            </DialogTitle>
          </DialogHeader>

          {selectedCompletion && (
            <div className="space-y-6">
              {/* Task Details */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">
                  {selectedCompletion.task.title}
                </h3>
                {selectedCompletion.task.description && (
                  <p className="text-black text-sm mb-3">
                    {selectedCompletion.task.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-sunny-yellow" />
                    {selectedCompletion.starsAwarded} stars
                  </span>
                  <span>Difficulty: {selectedCompletion.task.difficulty}/5</span>
                  <span>By: {selectedCompletion.child.nickname}</span>
                </div>
              </div>

              {/* Proof Image */}
              {selectedCompletion.proofImage && (
                <div>
                  <Label className="text-sm font-medium">Proof Submitted</Label>
                  <div className="mt-2 border rounded-lg overflow-hidden">
                    <Image
                      src={selectedCompletion.proofImage}
                      alt="Task completion proof"
                      width={500}
                      height={300}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Child's Notes */}
              {selectedCompletion.notes && (
                <div>
                  <Label className="text-sm font-medium">Child's Notes</Label>
                  <div className="mt-2 p-3 bg-sky-blue/10 rounded-lg">
                    <p className="text-sm">{selectedCompletion.notes}</p>
                  </div>
                </div>
              )}

              {/* Bonus Stars Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Bonus Stars (optional)</Label>
                  <span className="text-sm text-black">+{bonusStars} stars</span>
                </div>
                <Slider
                  value={[bonusStars]}
                  onValueChange={([value]) => setBonusStars(value)}
                  min={0}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-black mt-1">
                  <span>No bonus</span>
                  <span>Extra awesome!</span>
                </div>
              </div>

              {/* Feedback */}
              <div>
                <Label htmlFor="feedback" className="text-sm font-medium">
                  Feedback for {selectedCompletion.child.nickname} (optional)
                </Label>
                <Input
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Great job! Keep it up!"
                  className="mt-2"
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleApproval(false)}
              disabled={isApproving}
              className="text-error hover:bg-error/10"
            >
              <XCircle className="w-4 h-4 mr-2" />
              {isApproving ? 'Processing...' : 'Needs Work'}
            </Button>
            <Button
              onClick={() => handleApproval(true)}
              disabled={isApproving}
              className="bg-success hover:bg-success/90"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {isApproving ? 'Processing...' : 'Approve & Reward'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}