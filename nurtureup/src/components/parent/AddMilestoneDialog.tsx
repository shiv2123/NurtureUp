'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

const categories = [
  { value: 'first', label: 'First' },
  { value: 'achievement', label: 'Achievement' },
  { value: 'memory', label: 'Memory' },
  { value: 'quote', label: 'Quote' }
]

export function AddMilestoneDialog({ open, onOpenChange, onMilestoneAdded }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onMilestoneAdded: () => void
}) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().slice(0, 10),
    category: 'memory',
    tags: '',
    childrenIds: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
          childrenIds: form.childrenIds.split(',').map(t => t.trim()).filter(Boolean)
        })
      })
      if (!res.ok) throw new Error('Failed to add milestone')
      setForm({
        title: '',
        description: '',
        date: new Date().toISOString().slice(0, 10),
        category: 'memory',
        tags: '',
        childrenIds: ''
      })
      onMilestoneAdded()
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Family Milestone</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              required
              placeholder="Milestone title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Input
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Details (optional)"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Date</label>
              <Input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              >
                {categories.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
            <Input
              value={form.tags}
              onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              placeholder="e.g. birthday, park, funny"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Children IDs (comma separated, optional)</label>
            <Input
              value={form.childrenIds}
              onChange={e => setForm(f => ({ ...f, childrenIds: e.target.value }))}
              placeholder="e.g. child1, child2"
            />
          </div>
          {error && <div className="text-error text-sm">{error}</div>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading}>
              Add Milestone
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 