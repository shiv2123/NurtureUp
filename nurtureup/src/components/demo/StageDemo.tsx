'use client'

import React, { useState } from 'react'
import { StageProvider, useStageContext, useStageTheme } from '@/contexts/StageContext'
import { StageNavigation } from '@/components/navigation/StageNavigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChildStage, ParentStage, STAGE_CONFIGS } from '@/lib/stage-engine'
import { Child } from '@/hooks/useStage'
import { cn } from '@/lib/utils'

// Demo child data
const DEMO_CHILDREN: Child[] = [
  {
    id: 'demo-newborn',
    name: 'Baby Emma',
    dateOfBirth: new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000), // 3 months old
  },
  {
    id: 'demo-toddler',
    name: 'Toddler Sam',
    dateOfBirth: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000), // 2 years old
  },
  {
    id: 'demo-school',
    name: 'Riley',
    dateOfBirth: new Date(Date.now() - 8 * 365 * 24 * 60 * 60 * 1000), // 8 years old
  },
  {
    id: 'demo-teen',
    name: 'Alex',
    dateOfBirth: new Date(Date.now() - 15 * 365 * 24 * 60 * 60 * 1000), // 15 years old
  },
]

function StageDemoInner() {
  const { state, setUserType, addChild, setActiveChild } = useStageContext()
  const { theme, stage, isChildUI, isParentUI } = useStageTheme()
  const [activeTab, setActiveTab] = useState('home')
  
  // Initialize with demo data on first load
  React.useEffect(() => {
    if (state.children.length === 0) {
      DEMO_CHILDREN.forEach(child => addChild(child))
      setActiveChild(DEMO_CHILDREN[0].id)
      setUserType('parent')
    }
  }, [])
  
  const handleStageChange = (newStage: ChildStage | ParentStage) => {
    if (state.currentUser === 'parent') {
      // Find a child that would have this stage
      const matchingChild = DEMO_CHILDREN.find(child => {
        const childStage = child.dateOfBirth ? calculateChildStageFromBirth(child.dateOfBirth) : 'toddler'
        return childStage === newStage
      })
      if (matchingChild) {
        setActiveChild(matchingChild.id)
      }
    }
  }
  
  const currentStageConfig = state.stageConfig
  const currentChild = state.activeChild
  
  return (
    <div className="min-h-screen bg-surface">
      {/* Header with stage controls */}
      <header className="bg-white border-b border-neutral-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-neutral-900">
                Stage-Adaptive UI Demo
              </h1>
              <p className="text-sm text-neutral-600">
                Experience how NurtureUp adapts to different development stages
              </p>
            </div>
            
            {/* User type toggle */}
            <div className="flex gap-2">
              <Button
                variant={state.currentUser === 'parent' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setUserType('parent')}
              >
                Parent View
              </Button>
              <Button
                variant={state.currentUser === 'child' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setUserType('child')}
              >
                Child View
              </Button>
            </div>
          </div>
          
          {/* Stage selector */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(STAGE_CONFIGS).map(([stageKey, config]) => {
              const isActive = (state.currentUser === 'parent' ? state.parentStage : state.childStage) === stageKey
              
              return (
                <button
                  key={stageKey}
                  onClick={() => handleStageChange(stageKey as ChildStage | ParentStage)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-all",
                    isActive
                      ? "text-white shadow-sm"
                      : "text-neutral-600 bg-neutral-100 hover:bg-neutral-200"
                  )}
                  style={
                    isActive ? { backgroundColor: config.primaryColor } : {}
                  }
                >
                  {config.displayName}
                </button>
              )
            })}
          </div>
        </div>
      </header>
      
      {/* Main content area */}
      <main className="max-w-4xl mx-auto p-4 pb-20">
        {currentStageConfig && (
          <div className="mb-6">
            <Card 
              className="mb-6"
              style={{ borderColor: theme?.primary + '20' }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: theme?.primary }}
                  />
                  {currentStageConfig.displayName}
                  {currentChild && (
                    <span className="text-sm text-neutral-500 font-normal">
                      • {currentChild.name}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-neutral-600 mb-2">
                      <strong>Age Range:</strong> {currentStageConfig.ageRange}
                    </p>
                    <p className="text-sm text-neutral-600 mb-4">
                      {currentStageConfig.description}
                    </p>
                    <div>
                      <p className="text-sm font-medium text-neutral-700 mb-2">Key Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {currentStageConfig.features.map((feature) => (
                          <span
                            key={feature}
                            className="text-xs px-2 py-1 rounded-full bg-neutral-100 text-neutral-700"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center items-center">
                    <Progress 
                      value={Math.random() * 100} 
                      size={120}
                      color={theme?.primary}
                      showValue
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Sample dashboard cards based on stage */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card variant="elevated" interactive>
            <CardHeader>
              <CardTitle>Today's Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-600">
                {isChildUI 
                  ? "Ready for adventure! Complete your quests to earn stars." 
                  : "Track your family's daily activities and milestones."
                }
              </p>
            </CardContent>
          </Card>
          
          {currentStageConfig?.features.includes('Chore Board') && (
            <Card variant="elevated" interactive>
              <CardHeader>
                <CardTitle>Chore Board</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">3 completed</span>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => (
                      <div
                        key={i}
                        className={cn(
                          "w-2 h-2 rounded-full",
                          i <= 3 ? "bg-success" : "bg-neutral-200"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {currentStageConfig?.features.includes('Feed Tracking') && (
            <Card variant="elevated" interactive>
              <CardHeader>
                <CardTitle>Last Feed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-neutral-900">2h 15m</p>
                <p className="text-sm text-neutral-600">ago</p>
              </CardContent>
            </Card>
          )}
          
          {currentStageConfig?.features.includes('Screen-Time Manager') && (
            <Card variant="elevated" interactive>
              <CardHeader>
                <CardTitle>Screen Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <Progress 
                    value={65} 
                    size={60}
                    color="#F59E0B"
                  >
                    <span className="text-xs font-medium">1h 30m</span>
                  </Progress>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Navigation gestures info */}
        {currentStageConfig && (
          <Card variant="flat">
            <CardHeader>
              <CardTitle>Stage-Specific Gestures</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentStageConfig.navigation.gestures.map((gesture, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <span className="font-mono text-xs bg-neutral-100 px-2 py-1 rounded">
                      {gesture.gesture}
                    </span>
                    <span className="text-sm text-neutral-600 ml-4 flex-1">
                      {gesture.description}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      
      {/* Stage-aware navigation */}
      <StageNavigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  )
}

// Helper function to calculate stage from birth date
function calculateChildStageFromBirth(dateOfBirth: Date): ChildStage {
  const now = new Date()
  const ageInMonths = (now.getTime() - dateOfBirth.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  
  if (ageInMonths < 12) return 'newborn'
  if (ageInMonths < 36) return 'toddler'
  if (ageInMonths < 84) return 'early-childhood'
  if (ageInMonths < 156) return 'school-age'
  return 'adolescence'
}

// Main demo component with provider
export function StageDemo() {
  return (
    <StageProvider>
      <StageDemoInner />
    </StageProvider>
  )
}

export default StageDemo