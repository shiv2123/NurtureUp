'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  RefreshCw, 
  Clock, 
  Calendar,
  AlertCircle, 
  CheckCircle,
  Zap,
  Settings
} from 'lucide-react'

export default function AdminPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateRecurringTasks = async () => {
    try {
      setIsGenerating(true)
      setError(null)
      setResult(null)

      const response = await fetch('/api/tasks/recurring/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate tasks')
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleInitializeBadges = async () => {
    try {
      const response = await fetch('/api/admin/init-badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()
      
      if (response.ok) {
        alert('Badge system initialized successfully!')
      } else {
        alert('Failed to initialize badges: ' + data.error)
      }
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-black">System Admin</h1>
          <p className="text-black mt-1">
            Manage recurring tasks, badges, and system maintenance
          </p>
        </div>
        <Badge variant="outline" className="text-sage-green border-sage-green">
          Admin Panel
        </Badge>
      </div>

      {/* Recurring Tasks Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-sky-blue" />
            Recurring Tasks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-black">Generate New Task Instances</h3>
              <p className="text-sm text-black mt-1">
                Creates new daily/weekly task instances based on recurring task templates.
                This normally happens automatically every morning at 6 AM.
              </p>
            </div>
            <Button 
              onClick={handleGenerateRecurringTasks}
              disabled={isGenerating}
              className="bg-sky-blue hover:bg-sky-blue/90"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Generate Now
                </>
              )}
            </Button>
          </div>

          {result && (
            <div className="bg-sage-green/10 border border-sage-green/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-sage-green" />
                <span className="font-medium text-sage-green">Success!</span>
              </div>
              <p className="text-sm text-black">
                Generated {result.created} new task instance{result.created !== 1 ? 's' : ''}
              </p>
              {result.created > 0 && (
                <p className="text-xs text-black mt-1">
                  Notifications sent to children about new quests!
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="bg-error/10 border border-error/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-error" />
                <span className="font-medium text-error">Error</span>
              </div>
              <p className="text-sm text-black">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Badge System Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-warning" />
            Badge System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-black">Initialize Default Badges</h3>
              <p className="text-sm text-black mt-1">
                Creates the default set of achievement badges if they don't exist.
                Only needed once or after database resets.
              </p>
            </div>
            <Button 
              onClick={handleInitializeBadges}
              variant="outline"
              className="border-warning text-warning hover:bg-warning/10"
            >
              <Settings className="w-4 h-4 mr-2" />
              Initialize Badges
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-mint-green" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-mint-green" />
                <span className="font-medium text-black">Automatic Scheduling</span>
              </div>
              <p className="text-sm text-black">
                Recurring tasks are automatically generated every day at 6:00 AM
              </p>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-sage-green" />
                <span className="font-medium text-black">Badge System</span>
              </div>
              <p className="text-sm text-black">
                Badges are automatically awarded when children complete tasks
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-sunny-yellow" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 text-left"
              onClick={() => window.location.href = '/parent/tasks'}
            >
              <div>
                <div className="font-medium text-black">Manage Tasks</div>
                <div className="text-sm text-black">Create, edit, and assign tasks</div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 text-left"
              onClick={() => window.location.href = '/parent/settings'}
            >
              <div>
                <div className="font-medium text-black">Family Settings</div>
                <div className="text-sm text-black">Configure rewards and features</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}