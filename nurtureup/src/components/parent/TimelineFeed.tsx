'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface Milestone {
  id: string
  title: string
  description?: string
  date: string
  category: string
  images: string[]
  tags: string[]
  childrenIds: string[]
}

export function TimelineFeed() {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMilestones() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/milestones')
        if (!res.ok) throw new Error('Failed to fetch milestones')
        const data = await res.json()
        setMilestones(data.milestones)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchMilestones()
  }, [])

  if (loading) {
    return <div className="text-center text-black py-8">Loading timeline...</div>
  }
  if (error) {
    return <div className="text-center text-error py-8">{error}</div>
  }
  if (milestones.length === 0) {
    return <div className="rounded-2xl border border-slate-200 bg-white shadow-soft p-6 text-center text-black">No milestones yet. Start by adding your first family memory!</div>
  }

  return (
    <div className="space-y-6">
      {milestones.map((m) => (
        <Card key={m.id}>
          <CardHeader>
            <CardTitle>{m.title}</CardTitle>
            <div className="text-xs text-black mt-1">{new Date(m.date).toLocaleDateString()}</div>
          </CardHeader>
          <CardContent>
            {m.description && <p className="mb-2 text-black">{m.description}</p>}
            {m.images && m.images.length > 0 && (
              <div className="flex gap-2 mt-2">
                {m.images.map((img, i) => (
                  <img key={i} src={img} alt="Milestone" className="w-20 h-20 object-cover rounded-xl border" />
                ))}
              </div>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              {m.tags.map((tag) => (
                <span key={tag} className="bg-sky-blue/20 text-sky-blue px-2 py-1 rounded text-xs">#{tag}</span>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 