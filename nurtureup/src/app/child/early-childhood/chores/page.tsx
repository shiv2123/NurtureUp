'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Plus, Gift, Star } from 'lucide-react'
import { useOptimisticTasks } from '@/hooks/useOptimisticTasks'

/**
 * Early Childhood Chores Board (Blueprint 5.4.2)
 * 
 * Per blueprint:
 * - Columns: "To Do" and "Done". Child drags card to Done to earn stars (haptic click)
 * - Card Anatomy: icon, short label, star value badge
 * - Reward Store Button: top-right gift icon; opens store overlay with items priced in stars
 * - Add Chore button (bottom-right) only visible if parent allowed; opens simplified form (emoji icon picker, star slider 1-5)
 * - Bulk Star Burst: when ≥3 chores moved to Done at once, fireworks overlay plays
 */
export default function EarlyChildhoodChoresPage() {
  const searchParams = useSearchParams()
  const highlightId = searchParams?.get('highlight')
  const shouldAdd = searchParams?.get('add') === 'true'

  // Use real tasks data
  const { data: tasksData, completeTask, createTask, isLoading } = useOptimisticTasks()

  const [showAddChore, setShowAddChore] = useState(shouldAdd)
  const [showRewardStore, setShowRewardStore] = useState(false)
  const [showFireworks, setShowFireworks] = useState(false)
  const [newChore, setNewChore] = useState({ name: '', icon: '⭐', stars: 3 })
  const [draggedItem, setDraggedItem] = useState<any>(null)
  const [recentCompletions, setRecentCompletions] = useState<string[]>([])

  // Transform real tasks data into chore format
  const todos = tasksData?.activeTasks?.map(task => ({
    id: task.id,
    name: task.title,
    icon: getTaskIcon(task.title),
    stars: task.starValue || 2,
    completed: false,
    task: task
  })) || []

  const done = tasksData?.completedTasks?.map(task => ({
    id: task.id,
    name: task.title,
    icon: getTaskIcon(task.title),
    stars: task.starValue || 2,
    completed: true,
    task: task
  })) || []

  const canAddChores = true // TODO: Check parent permission
  const totalStars = done.reduce((sum, chore) => sum + chore.stars, 0)

  // Helper function to get appropriate icon for task
  function getTaskIcon(taskTitle: string): string {
    const title = taskTitle.toLowerCase()
    if (title.includes('toy') || title.includes('clean')) return '🧸'
    if (title.includes('brush') || title.includes('teeth')) return '🦷'
    if (title.includes('table') || title.includes('set')) return '🍽️'
    if (title.includes('feed') || title.includes('pet')) return '🐕'
    if (title.includes('bed') || title.includes('make')) return '🛏️'
    if (title.includes('book') || title.includes('read')) return '📚'
    if (title.includes('clothes') || title.includes('dress')) return '👕'
    return '⭐'
  }

  const choreIcons = ['⭐', '🧸', '🦷', '🍽️', '🐕', '🛏️', '📚', '👕', '🧼', '🌱', '🎨', '🎵']

  const rewards = [
    { id: 1, name: 'Extra Story', price: 5, icon: '📖' },
    { id: 2, name: 'Choose Dinner', price: 8, icon: '🍕' },
    { id: 3, name: 'Stay Up Late', price: 10, icon: '🌙' },
    { id: 4, name: 'Special Treat', price: 12, icon: '🍭' },
  ]

  useEffect(() => {
    if (highlightId) {
      const element = document.getElementById(`chore-${highlightId}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
        element.classList.add('animate-pulse')
        setTimeout(() => element.classList.remove('animate-pulse'), 2000)
      }
    }
  }, [highlightId])

  const handleDragStart = (chore: typeof todos[0]) => {
    setDraggedItem(chore)
    // Haptic feedback for drag start
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
  }

  const handleDrop = async (targetColumn: 'todo' | 'done') => {
    if (!draggedItem) return

    if (targetColumn === 'done' && !draggedItem.completed && draggedItem.task) {
      try {
        // Complete task using real API
        await completeTask(draggedItem.task.id)
        
        // Track recent completion for bulk star burst
        setRecentCompletions(prev => {
          const newCompletions = [...prev, draggedItem.id]
          
          // Check for bulk completion (≥3 at once)
          if (newCompletions.length >= 3) {
            setShowFireworks(true)
            setTimeout(() => setShowFireworks(false), 3000)
            return [] // Reset after fireworks
          }
          
          // Auto-clear after 5 seconds
          setTimeout(() => {
            setRecentCompletions(current => 
              current.filter(id => id !== draggedItem.id)
            )
          }, 5000)
          
          return newCompletions
        })

        // Haptic feedback for completion
        if ('vibrate' in navigator) {
          navigator.vibrate([100, 50, 100]) // Success pattern
        }

        // Play completion sound
        console.log(`⭐ Earned ${draggedItem.stars} stars for ${draggedItem.name}!`)
      } catch (error) {
        console.error('Failed to complete task:', error)
      }
    }

    setDraggedItem(null)
  }

  const addChore = async () => {
    if (newChore.name.trim()) {
      try {
        await createTask({
          title: newChore.name,
          description: `Created by child from chores board`,
          starValue: newChore.stars,
          category: 'chore',
          priority: 'medium'
        })
        setNewChore({ name: '', icon: '⭐', stars: 3 })
        setShowAddChore(false)
      } catch (error) {
        console.error('Failed to create task:', error)
      }
    }
  }

  const ChoreCard = ({ chore, isDraggable = true }: { chore: typeof todos[0], isDraggable?: boolean }) => (
    <div
      id={`chore-${chore.id}`}
      draggable={isDraggable}
      onDragStart={() => handleDragStart(chore)}
      className={`bg-white rounded-xl p-4 shadow-md border-2 transition-all duration-200 ${
        isDraggable ? 'cursor-move hover:shadow-lg hover:scale-105' : ''
      } ${chore.completed ? 'border-green-300 bg-green-50' : 'border-blue-200'}`}
    >
      <div className="flex items-center gap-3">
        <div className="text-2xl">{chore.icon}</div>
        <div className="flex-1">
          <div className="font-bold text-gray-700">{chore.name}</div>
        </div>
        <div className="bg-yellow-200 px-2 py-1 rounded-full text-sm font-bold text-yellow-800 flex items-center gap-1">
          {chore.stars} <Star className="w-3 h-3" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-purple-100 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-green-700">Chore Board ✅</h1>
          <p className="text-green-600">Drag chores to Done to earn stars!</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-yellow-200 px-4 py-2 rounded-full font-bold text-yellow-800">
            {totalStars} ⭐ Earned
          </div>
          <button
            onClick={() => setShowRewardStore(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-all"
          >
            <Gift className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Chore Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* To Do Column */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop('todo')}
          className="bg-blue-100/50 rounded-2xl p-4 min-h-[400px] border-2 border-dashed border-blue-300"
        >
          <h2 className="text-xl font-bold text-blue-700 mb-4 text-center">
            📋 To Do ({todos.length})
          </h2>
          <div className="space-y-3">
            {todos.map((chore) => (
              <ChoreCard key={chore.id} chore={chore} />
            ))}
            {todos.length === 0 && (
              <div className="text-center text-blue-600 py-8">
                <div className="text-4xl mb-2">🎉</div>
                <p className="font-medium">All done! Great job!</p>
              </div>
            )}
          </div>
        </div>

        {/* Done Column */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop('done')}
          className="bg-green-100/50 rounded-2xl p-4 min-h-[400px] border-2 border-dashed border-green-300"
        >
          <h2 className="text-xl font-bold text-green-700 mb-4 text-center">
            ✅ Done ({done.length})
          </h2>
          <div className="space-y-3">
            {done.map((chore) => (
              <ChoreCard key={chore.id} chore={chore} isDraggable={false} />
            ))}
            {done.length === 0 && (
              <div className="text-center text-green-600 py-8">
                <div className="text-4xl mb-2">🎯</div>
                <p className="font-medium">Drop completed chores here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Chore Button */}
      {canAddChores && (
        <button
          onClick={() => setShowAddChore(true)}
          className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-400 text-white rounded-full shadow-xl hover:scale-110 transition-all flex items-center justify-center z-40"
        >
          <Plus className="w-8 h-8" />
        </button>
      )}

      {/* Add Chore Modal */}
      {showAddChore && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-white m-4 max-w-sm w-full">
            <CardHeader>
              <CardTitle className="text-center text-lg text-green-700">
                Add New Chore ➕
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block font-bold text-gray-700 mb-2">Chore Name</label>
                <input
                  type="text"
                  value={newChore.name}
                  onChange={(e) => setNewChore(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="What needs to be done?"
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-2">Pick an Icon</label>
                <div className="grid grid-cols-6 gap-2">
                  {choreIcons.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setNewChore(prev => ({ ...prev, icon }))}
                      className={`p-2 rounded-lg text-2xl border-2 transition-all ${
                        newChore.icon === icon 
                          ? 'border-green-400 bg-green-100' 
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-2">
                  Star Value: {newChore.stars} ⭐
                </label>
                <Slider
                  value={[newChore.stars]}
                  onValueChange={([value]) => setNewChore(prev => ({ ...prev, stars: value }))}
                  min={1}
                  max={5}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowAddChore(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={addChore}
                  className="flex-1 bg-green-500 hover:bg-green-600"
                  disabled={!newChore.name.trim()}
                >
                  Add Chore
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reward Store Modal */}
      {showRewardStore && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-white m-4 max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-center text-lg text-purple-700">
                🎁 Reward Store ({totalStars} ⭐ available)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {rewards.map((reward) => (
                  <button
                    key={reward.id}
                    disabled={totalStars < reward.price}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      totalStars >= reward.price
                        ? 'border-purple-300 bg-purple-50 hover:border-purple-400'
                        : 'border-gray-200 bg-gray-50 opacity-50'
                    }`}
                  >
                    <div className="text-3xl mb-2">{reward.icon}</div>
                    <div className="font-bold text-sm">{reward.name}</div>
                    <div className="text-purple-600 font-bold">{reward.price} ⭐</div>
                  </button>
                ))}
              </div>
              <Button 
                onClick={() => setShowRewardStore(false)}
                className="w-full"
              >
                Close Store
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Fireworks Overlay */}
      {showFireworks && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 pointer-events-none">
          <div className="text-center animate-bounce">
            <div className="text-8xl mb-4">🎆</div>
            <div className="text-4xl font-bold text-white drop-shadow-lg">
              AMAZING JOB!
            </div>
            <div className="text-2xl text-white drop-shadow-lg">
              You completed lots of chores! 🌟
            </div>
          </div>
        </div>
      )}
    </div>
  )
}