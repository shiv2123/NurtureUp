'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const categories = [
  'home', 'health', 'learning', 'music', 'creative', 'challenge'
]

export function AddTaskDialog({ open, onOpenChange, onTaskAdded }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTaskAdded: () => void
}) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'home',
    difficulty: 1,
    starValue: 5,
    assignedToId: '',
    isRecurring: false,
    requiresProof: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          difficulty: Number(form.difficulty),
          starValue: Number(form.starValue),
          isRecurring: Boolean(form.isRecurring),
          requiresProof: Boolean(form.requiresProof),
          assignedToId: form.assignedToId || undefined
        })
      })
      if (!res.ok) throw new Error('Failed to add task')
      setForm({
        title: '',
        description: '',
        category: 'home',
        difficulty: 1,
        starValue: 5,
        assignedToId: '',
        isRecurring: false,
        requiresProof: false
      })
      onTaskAdded()
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
          <DialogTitle>Add Chore Quest</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              required
              placeholder="Task title"
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
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Difficulty</label>
              <Input
                type="number"
                min={1}
                max={5}
                value={form.difficulty}
                onChange={e => setForm(f => ({ ...f, difficulty: Number(e.target.value), starValue: Number(e.target.value) * 5 }))}
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Stars</label>
              <Input
                type="number"
                min={1}
                max={50}
                value={form.starValue}
                onChange={e => setForm(f => ({ ...f, starValue: Number(e.target.value) }))}
                required
              />
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <input
              type="checkbox"
              checked={form.isRecurring}
              onChange={e => setForm(f => ({ ...f, isRecurring: e.target.checked }))}
              id="recurring"
              className="mr-2"
            />
            <label htmlFor="recurring" className="text-sm">Recurring</label>
            <input
              type="checkbox"
              checked={form.requiresProof}
              onChange={e => setForm(f => ({ ...f, requiresProof: e.target.checked }))}
              id="proof"
              className="ml-4 mr-2"
            />
            <label htmlFor="proof" className="text-sm">Require Photo Proof</label>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Assign to (child ID, optional)</label>
            <Input
              value={form.assignedToId}
              onChange={e => setForm(f => ({ ...f, assignedToId: e.target.value }))}
              placeholder="Leave blank for all children"
            />
          </div>
          {error && <div className="text-error text-sm">{error}</div>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading}>
              Add Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 