'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Sparkles, 
  Home, 
  BookOpen, 
  Heart, 
  Dumbbell,
  Palette,
  Music,
  Gamepad2,
  Camera,
  RefreshCw,
  Star
} from 'lucide-react'
import { cn } from '@/lib/utils'

const taskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  category: z.string(),
  difficulty: z.number().min(1).max(5),
  starValue: z.number().min(1).max(50),
  assignedToId: z.string().optional(),
  isRecurring: z.boolean(),
  recurringDays: z.array(z.number()).optional(),
  requiresProof: z.boolean()
})

type TaskFormData = z.infer<typeof taskSchema>

const presetTasks = [
  { title: 'Make Bed', category: 'home', icon: Home, difficulty: 1, description: 'Tidy up bedroom and make bed neat' },
  { title: 'Brush Teeth', category: 'health', icon: Heart, difficulty: 1, description: 'Brush teeth for 2 minutes' },
  { title: 'Read for 20 mins', category: 'learning', icon: BookOpen, difficulty: 2, description: 'Choose a book and read quietly' },
  { title: 'Practice Piano', category: 'music', icon: Music, difficulty: 3, description: 'Practice piano for 15 minutes' },
  { title: 'Tidy Room', category: 'home', icon: Home, difficulty: 2, description: 'Clean and organize bedroom' },
  { title: 'Exercise 30 mins', category: 'health', icon: Dumbbell, difficulty: 3, description: 'Physical activity or workout' },
  { title: 'Art Project', category: 'creative', icon: Palette, difficulty: 3, description: 'Creative arts and crafts time' },
  { title: 'No Screen Challenge', category: 'challenge', icon: Gamepad2, difficulty: 4, description: 'Go screen-free for the day' }
]

const difficultyConfig = [
  { level: 1, label: 'Easy', color: 'bg-sunny-yellow', description: '5 minutes or less' },
  { level: 2, label: 'Medium', color: 'bg-soft-coral', description: '10-15 minutes' },
  { level: 3, label: 'Hard', color: 'bg-sky-blue', description: '20-30 minutes' },
  { level: 4, label: 'Expert', color: 'bg-mint-green', description: '45+ minutes' },
  { level: 5, label: 'Epic', color: 'bg-sage-green', description: 'Major challenge' }
]

const weekDays = [
  { day: 1, label: 'Mon' },
  { day: 2, label: 'Tue' },
  { day: 3, label: 'Wed' },
  { day: 4, label: 'Thu' },
  { day: 5, label: 'Fri' },
  { day: 6, label: 'Sat' },
  { day: 7, label: 'Sun' }
]

interface TaskForgeProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: any[]
  onCreateTask: (task: TaskFormData) => Promise<void>
}

export function TaskForge({ open, onOpenChange, children, onCreateTask }: TaskForgeProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [currentStep, setCurrentStep] = useState<'presets' | 'customize' | 'preview'>('presets')
  
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'home',
      difficulty: 1,
      starValue: 5,
      isRecurring: false,
      requiresProof: false,
      recurringDays: []
    }
  })

  const difficulty = form.watch('difficulty')
  const starValue = form.watch('starValue')
  const isRecurring = form.watch('isRecurring')
  const recurringDays = form.watch('recurringDays') || []

  const handlePresetSelect = (preset: typeof presetTasks[0]) => {
    setSelectedPreset(preset.title)
    form.setValue('title', preset.title)
    form.setValue('category', preset.category)
    form.setValue('difficulty', preset.difficulty)
    form.setValue('starValue', preset.difficulty * 5)
    form.setValue('description', preset.description)
    setCurrentStep('customize')
  }

  const handleCustomTask = () => {
    setSelectedPreset(null)
    form.reset()
    setCurrentStep('customize')
  }

  const toggleRecurringDay = (day: number) => {
    const current = recurringDays
    const updated = current.includes(day) 
      ? current.filter(d => d !== day)
      : [...current, day].sort()
    form.setValue('recurringDays', updated)
  }

  const onSubmit = async (data: TaskFormData) => {
    try {
      setIsCreating(true)
      await onCreateTask(data)
      form.reset()
      setCurrentStep('presets')
      setSelectedPreset(null)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to create task:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const currentDifficulty = difficultyConfig.find(d => d.level === difficulty)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-sunny-yellow" />
            Task Forge
            <span className="text-sm font-normal text-black ml-2">
              Create magical quests for your little ones
            </span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Preset Selection */}
          {currentStep === 'presets' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-black mb-2">
                  Choose Your Quest Type
                </h3>
                <p className="text-sm text-black">
                  Pick from popular quests or create your own custom adventure
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {presetTasks.map((preset) => {
                  const Icon = preset.icon
                  const config = difficultyConfig.find(d => d.level === preset.difficulty)
                  return (
                    <Card
                      key={preset.title}
                      className={cn(
                        'cursor-pointer transition-all hover:shadow-medium hover:scale-105',
                        'border-2 hover:border-sage-green/50'
                      )}
                      onClick={() => handlePresetSelect(preset)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center',
                            config?.color
                          )}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-black">{preset.title}</div>
                            <div className="text-xs text-black">{config?.label}</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-black">{preset.category}</span>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: preset.difficulty }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-warning text-warning" />
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <div className="flex justify-center pt-4">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={handleCustomTask}
                  className="gap-2"
                >
                  <Palette className="w-4 h-4" />
                  Create Custom Quest
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Customization */}
          {currentStep === 'customize' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-black">
                  Customize Your Quest
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep('presets')}
                >
                  ← Back to Presets
                </Button>
              </div>

              {/* Task Details */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Quest Name *
                  </label>
                  <Input
                    placeholder="Enter an exciting quest name..."
                    {...form.register('title')}
                    className="text-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Quest Description
                  </label>
                  <Input
                    placeholder="Add details about the quest..."
                    {...form.register('description')}
                  />
                </div>
              </div>

              {/* Difficulty Selector */}
              <div>
                <label className="block text-sm font-medium text-black mb-3">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {difficultyConfig.map((config) => (
                    <Button
                      key={config.level}
                      type="button"
                      variant={difficulty === config.level ? 'default' : 'outline'}
                      size="sm"
                      className={cn(
                        'flex-col h-auto py-3',
                        difficulty === config.level && config.color + ' text-white'
                      )}
                      onClick={() => {
                        form.setValue('difficulty', config.level)
                        form.setValue('starValue', config.level * 5)
                      }}
                    >
                      <span className="font-semibold">{config.level}</span>
                      <span className="text-xs">{config.label}</span>
                    </Button>
                  ))}
                </div>
                {currentDifficulty && (
                  <p className="text-xs text-black mt-2">
                    {currentDifficulty.description} • {starValue} stars
                  </p>
                )}
              </div>

              {/* Assignment */}
              {children.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-black mb-3">
                    Assign Quest To
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={!form.watch('assignedToId') ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => form.setValue('assignedToId', undefined)}
                    >
                      All Kids
                    </Button>
                    {children.map((child) => (
                      <Button
                        key={child.id}
                        type="button"
                        variant={form.watch('assignedToId') === child.id ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => form.setValue('assignedToId', child.id)}
                        className="gap-2"
                      >
                        <span>{child.avatar || '👤'}</span>
                        {child.nickname}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quest Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <div className="font-medium text-black">Recurring Quest</div>
                    <div className="text-sm text-black">Repeat this quest regularly</div>
                  </div>
                  <Button
                    type="button"
                    variant={isRecurring ? 'success' : 'outline'}
                    size="sm"
                    onClick={() => form.setValue('isRecurring', !isRecurring)}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {isRecurring ? 'On' : 'Off'}
                  </Button>
                </div>

                {isRecurring && (
                  <div className="pl-4">
                    <label className="block text-sm font-medium text-black mb-2">
                      Repeat On
                    </label>
                    <div className="flex gap-1">
                      {weekDays.map(({ day, label }) => (
                        <Button
                          key={day}
                          type="button"
                          variant={recurringDays.includes(day) ? 'primary' : 'outline'}
                          size="sm"
                          className="w-12 h-10"
                          onClick={() => toggleRecurringDay(day)}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <div className="font-medium text-black">Photo Proof Required</div>
                    <div className="text-sm text-black">Kids need to take a photo to complete</div>
                  </div>
                  <Button
                    type="button"
                    variant={form.watch('requiresProof') ? 'success' : 'outline'}
                    size="sm"
                    onClick={() => form.setValue('requiresProof', !form.watch('requiresProof'))}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {form.watch('requiresProof') ? 'Required' : 'Optional'}
                  </Button>
                </div>
              </div>

              {/* Preview Card */}
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4">
                <p className="text-sm text-black mb-3">Quest Preview</p>
                <Card className={cn('overflow-hidden', currentDifficulty?.color)}>
                  <CardContent className="p-4 text-white">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold">
                        {form.watch('title') || 'Quest Name'}
                      </h3>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: starValue }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                        ))}
                      </div>
                    </div>
                    {form.watch('description') && (
                      <p className="text-white/80 text-sm mb-2">
                        {form.watch('description')}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="opacity-80">{currentDifficulty?.label} Quest</span>
                      {form.watch('requiresProof') && (
                        <div className="flex items-center gap-1 opacity-80">
                          <Camera className="w-3 h-3" />
                          Photo Required
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep('presets')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={isCreating}
                  loadingText="Creating Quest..."
                  className="flex-1"
                >
                  Create Quest ✨
                </Button>
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}