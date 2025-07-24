'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const categories = [
  'experience', 'item', 'privilege', 'screentime'
]

export function AddRewardDialog({ open, onOpenChange, onRewardAdded }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRewardAdded: () => void
}) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    image: '',
    category: 'experience',
    coinCost: 1,
    quantity: '',
    minAge: '',
    maxAge: '',
    requiresApproval: true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/parent/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          coinCost: Number(form.coinCost),
          quantity: form.quantity ? Number(form.quantity) : undefined,
          minAge: form.minAge ? Number(form.minAge) : undefined,
          maxAge: form.maxAge ? Number(form.maxAge) : undefined
        })
      })
      if (!res.ok) throw new Error('Failed to add reward')
      setForm({
        title: '',
        description: '',
        image: '',
        category: 'experience',
        coinCost: 1,
        quantity: '',
        minAge: '',
        maxAge: '',
        requiresApproval: true
      })
      onRewardAdded()
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
          <DialogTitle>Add Family Reward</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              required
              placeholder="Reward title"
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
          <div>
            <label className="block text-sm font-medium mb-1">Image URL (optional)</label>
            <Input
              value={form.image}
              onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
              placeholder="https://..."
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
              <label className="block text-sm font-medium mb-1">Coin Cost</label>
              <Input
                type="number"
                min={1}
                value={form.coinCost}
                onChange={e => setForm(f => ({ ...f, coinCost: Number(e.target.value) }))}
                required
              />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Quantity (optional)</label>
              <Input
                type="number"
                min={1}
                value={form.quantity}
                onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                placeholder="Leave blank for unlimited"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Min Age (optional)</label>
              <Input
                type="number"
                min={0}
                value={form.minAge}
                onChange={e => setForm(f => ({ ...f, minAge: e.target.value }))}
                placeholder=""
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Max Age (optional)</label>
              <Input
                type="number"
                min={0}
                value={form.maxAge}
                onChange={e => setForm(f => ({ ...f, maxAge: e.target.value }))}
                placeholder=""
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.requiresApproval}
              onChange={e => setForm(f => ({ ...f, requiresApproval: e.target.checked }))}
              id="approval"
              className="mr-2"
            />
            <label htmlFor="approval" className="text-sm">Requires Parent Approval</label>
          </div>
          {error && <div className="text-error text-sm">{error}</div>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading}>
              Add Reward
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 