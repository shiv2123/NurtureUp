'use client'

import { TimelineFeed } from '@/components/parent/TimelineFeed'
import { AddMilestoneDialog } from '@/components/parent/AddMilestoneDialog'
import { useState } from 'react'

export default function TimelinePage() {
  const [open, setOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-black">Family Timeline</h1>
        <button
          className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-all shadow-sm"
          onClick={() => setOpen(true)}
        >
          + Add Milestone
        </button>
      </div>
      <AddMilestoneDialog
        open={open}
        onOpenChange={setOpen}
        onMilestoneAdded={() => setRefreshKey(k => k + 1)}
      />
      <TimelineFeed key={refreshKey} />
    </div>
  )
} 