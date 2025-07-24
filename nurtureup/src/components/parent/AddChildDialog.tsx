'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Baby, 
  Child, 
  User, 
  Sparkles,
  Heart,
  Star,
  Zap,
  Crown,
  Rocket
} from 'lucide-react'

const childSchema = z.object({
  nickname: z.string().min(1, 'Nickname is required').max(50),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  birthDate: z.string().min(1, 'Birth date is required'),
  avatar: z.string().default('👤'),
  theme: z.string().default('candy')
})

type ChildFormData = z.infer<typeof childSchema>

const avatarOptions = [
  '👦', '👧', '🧒', '👶', '🦸‍♂️', '🦸‍♀️', 
  '🧙‍♂️', '🧙‍♀️', '🦄', '🐉', '🦁', '🐸',
  '🤖', '👑', '⭐', '🌈', '🚀', '🎨'
]

const themeOptions = [
  { id: 'candy', name: 'Candy Pop', color: 'bg-gradient-to-r from-pink-300 to-purple-300' },
  { id: 'ocean', name: 'Ocean Dreams', color: 'bg-gradient-to-r from-blue-300 to-cyan-300' },
  { id: 'forest', name: 'Forest Adventure', color: 'bg-gradient-to-r from-green-300 to-emerald-300' },
  { id: 'space', name: 'Space Explorer', color: 'bg-gradient-to-r from-purple-400 to-indigo-400' },
  { id: 'sunset', name: 'Golden Sunset', color: 'bg-gradient-to-r from-orange-300 to-red-300' }
]

interface AddChildDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddChild: (data: ChildFormData) => Promise<void>
}

export function AddChildDialog({ open, onOpenChange, onAddChild }: AddChildDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<ChildFormData>({
    resolver: zodResolver(childSchema),
    defaultValues: {
      nickname: '',
      email: '',
      password: '',
      birthDate: '',
      avatar: '👤',
      theme: 'candy'
    }
  })

  const watchedAvatar = form.watch('avatar')
  const watchedTheme = form.watch('theme')

  const onSubmit = async (data: ChildFormData) => {
    try {
      setIsSubmitting(true)
      await onAddChild(data)
      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to add child:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset()
      onOpenChange(false)
    }
  }

  // Calculate age from birth date for preview
  const birthDate = form.watch('birthDate')
  let age = 0
  if (birthDate) {
    const today = new Date()
    const birth = new Date(birthDate)
    age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
  }

  const selectedTheme = themeOptions.find(t => t.id === watchedTheme)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-sunny-yellow" />
            Add New Family Member
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="avatar">Avatar</TabsTrigger>
              <TabsTrigger value="theme">Theme</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nickname">Nickname *</Label>
                  <Input
                    id="nickname"
                    placeholder="What should we call them?"
                    {...form.register('nickname')}
                    className={form.formState.errors.nickname ? 'border-red-500' : ''}
                  />
                  {form.formState.errors.nickname && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.nickname.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="birthDate">Birth Date *</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    {...form.register('birthDate')}
                    className={form.formState.errors.birthDate ? 'border-red-500' : ''}
                  />
                  {form.formState.errors.birthDate && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.birthDate.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="child@example.com"
                  {...form.register('email')}
                  className={form.formState.errors.email ? 'border-red-500' : ''}
                />
                <p className="text-xs text-black mt-1">
                  This will be their login email
                </p>
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  {...form.register('password')}
                  className={form.formState.errors.password ? 'border-red-500' : ''}
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="avatar" className="space-y-4">
              <div>
                <Label>Choose an Avatar</Label>
                <div className="grid grid-cols-6 gap-3 mt-2">
                  {avatarOptions.map((avatar) => (
                    <button
                      key={avatar}
                      type="button"
                      onClick={() => form.setValue('avatar', avatar)}
                      className={`w-12 h-12 rounded-xl border-2 text-2xl transition-all hover:scale-110 ${
                        watchedAvatar === avatar 
                          ? 'border-sage-green bg-sage-green/10' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="theme" className="space-y-4">
              <div>
                <Label>Choose a Theme</Label>
                <div className="grid grid-cols-1 gap-3 mt-2">
                  {themeOptions.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => form.setValue('theme', theme.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        watchedTheme === theme.id 
                          ? 'border-sage-green' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-lg ${theme.color}`} />
                        <div>
                          <div className="font-medium">{theme.name}</div>
                          <div className="text-sm text-black">
                            Perfect for adventures!
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Preview Card */}
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-4">
            <p className="text-sm text-black mb-3">Preview</p>
            <div className={`rounded-xl p-4 ${selectedTheme?.color || 'bg-gray-100'}`}>
              <div className="bg-white rounded-lg p-4 flex items-center space-x-4">
                <div className="text-4xl">{watchedAvatar}</div>
                <div>
                  <div className="font-bold text-lg">
                    {form.watch('nickname') || 'Child\'s Name'}
                  </div>
                  <div className="text-sm text-black">
                    {age > 0 ? `Age ${age}` : 'Age will appear here'} • Level 1 Adventurer
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">0 Stars</span>
                    <span className="text-black">•</span>
                    <span className="text-sm">0 Coins</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="bg-sage-green hover:bg-sage-green/90"
            >
              {isSubmitting ? (
                <>Adding...</>
              ) : (
                <>
                  <Heart className="w-4 h-4 mr-2" />
                  Add to Family
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}