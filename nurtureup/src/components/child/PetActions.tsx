'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface PetActionsProps {
  petId: string
  className?: string
}

export function PetActions({ petId, className = '' }: PetActionsProps) {
  const [isLoading, setIsLoading] = useState<'feed' | 'play' | null>(null)
  const router = useRouter()

  const handlePetAction = async (action: 'feed' | 'play') => {
    setIsLoading(action)
    try {
      const response = await fetch(`/api/pets/${petId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        // Refresh the page to show updated pet stats
        router.refresh()
      } else {
        console.error(`Failed to ${action} pet`)
      }
    } catch (error) {
      console.error(`Error ${action}ing pet:`, error)
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      <button
        onClick={() => handlePetAction('feed')}
        disabled={isLoading !== null}
        className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium disabled:opacity-50 flex items-center"
      >
        {isLoading === 'feed' ? (
          <Loader2 className="w-4 h-4 animate-spin mr-1" />
        ) : (
          '🍎 '
        )}
        Feed
      </button>
      <button
        onClick={() => handlePetAction('play')}
        disabled={isLoading !== null}
        className="px-4 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors font-medium disabled:opacity-50 flex items-center"
      >
        {isLoading === 'play' ? (
          <Loader2 className="w-4 h-4 animate-spin mr-1" />
        ) : (
          '🎾 '
        )}
        Play
      </button>
    </div>
  )
}