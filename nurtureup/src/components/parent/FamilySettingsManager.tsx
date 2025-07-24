'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Settings, 
  Star, 
  Coins, 
  Clock, 
  Users,
  Save,
  Gamepad2
} from 'lucide-react'
import type { Family, FamilySettings, Child, User } from '@prisma/client'

const settingsSchema = z.object({
  familyName: z.string().min(1, 'Family name is required'),
  starToCoinsRatio: z.number().min(1).max(100),
  dailyTaskLimit: z.number().nullable(),
  enableCommunity: z.boolean(),
  enableLearning: z.boolean(),
  enablePets: z.boolean()
})

type SettingsFormData = z.infer<typeof settingsSchema>

interface FamilyWithDetails extends Family {
  settings: FamilySettings | null
  children: (Child & {
    user: {
      name: string | null
      email: string
    }
  })[]
}

interface FamilySettingsManagerProps {
  family: FamilyWithDetails
}

export function FamilySettingsManager({ family }: FamilySettingsManagerProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      familyName: family.name,
      starToCoinsRatio: family.settings?.starToCoinsRatio || 10,
      dailyTaskLimit: family.settings?.dailyTaskLimit,
      enableCommunity: family.settings?.enableCommunity || false,
      enableLearning: family.settings?.enableLearning || true,
      enablePets: family.settings?.enablePets || true
    }
  })

  const starToCoinsRatio = form.watch('starToCoinsRatio')

  const onSubmit = async (data: SettingsFormData) => {
    try {
      setIsSaving(true)
      setSaveMessage(null)

      const response = await fetch('/api/family/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      setSaveMessage('Settings saved successfully!')
      setTimeout(() => setSaveMessage(null), 3000)

    } catch (error) {
      console.error('Error saving settings:', error)
      setSaveMessage('Failed to save settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Family Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="familyName">Family Name</Label>
                  <Input
                    id="familyName"
                    {...form.register('familyName')}
                    className={form.formState.errors.familyName ? 'border-red-500' : ''}
                  />
                  {form.formState.errors.familyName && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.familyName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Family Members</Label>
                  <div className="space-y-2 mt-2">
                    {family.children.map((child) => (
                      <div key={child.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{child.avatar || '👤'}</div>
                          <div>
                            <div className="font-medium">{child.nickname}</div>
                            <div className="text-sm text-black">{child.user.email}</div>
                          </div>
                        </div>
                        <div className="text-sm text-black">
                          Level {child.level}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Task Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="dailyTaskLimit">Daily Task Limit (per child)</Label>
                  <Input
                    id="dailyTaskLimit"
                    type="number"
                    min="0"
                    placeholder="No limit"
                    {...form.register('dailyTaskLimit', { 
                      setValueAs: (v) => v === '' ? null : parseInt(v) 
                    })}
                  />
                  <p className="text-xs text-black mt-1">
                    Leave empty for no limit. Recommended: 3-5 tasks per day.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="rewards" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-sunny-yellow" />
                  Reward System
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>Stars to Coins Conversion</Label>
                    <div className="text-sm text-black">
                      {starToCoinsRatio} stars = 1 coin
                    </div>
                  </div>
                  <Slider
                    value={[starToCoinsRatio]}
                    onValueChange={([value]) => form.setValue('starToCoinsRatio', value)}
                    min={1}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-black mt-2">
                    <span>1 star = 1 coin</span>
                    <span>50 stars = 1 coin</span>
                  </div>
                </div>

                <div className="bg-sky-blue/10 p-4 rounded-lg">
                  <h4 className="font-medium text-black mb-2">Preview</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Easy task (5 stars)</span>
                      <span className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-mint-green" />
                        {Math.floor(5 / starToCoinsRatio)} coin{Math.floor(5 / starToCoinsRatio) !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Hard task (25 stars)</span>
                      <span className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-mint-green" />
                        {Math.floor(25 / starToCoinsRatio)} coin{Math.floor(25 / starToCoinsRatio) !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Feature Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Learning Arcade</Label>
                    <p className="text-sm text-black">
                      Educational games and quizzes for children
                    </p>
                  </div>
                  <Switch
                    checked={form.watch('enableLearning')}
                    onCheckedChange={(checked) => form.setValue('enableLearning', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Virtual Pets</Label>
                    <p className="text-sm text-black">
                      Each child gets a virtual pet to care for
                    </p>
                  </div>
                  <Switch
                    checked={form.watch('enablePets')}
                    onCheckedChange={(checked) => form.setValue('enablePets', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Community Features</Label>
                    <p className="text-sm text-black">
                      Connect with other families (coming soon)
                    </p>
                  </div>
                  <Switch
                    checked={form.watch('enableCommunity')}
                    onCheckedChange={(checked) => form.setValue('enableCommunity', checked)}
                    disabled
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <div className="flex items-center justify-between">
            <div>
              {saveMessage && (
                <p className={`text-sm ${saveMessage.includes('success') ? 'text-success' : 'text-error'}`}>
                  {saveMessage}
                </p>
              )}
            </div>
            <Button 
              type="submit" 
              disabled={isSaving}
              className="bg-sage-green hover:bg-sage-green/90"
            >
              {isSaving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  )
}