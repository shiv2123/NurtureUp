import { QuestList } from '@/components/child/QuestList'

export default function QuestsPage() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-child font-bold text-black mb-4">Today's Quests</h1>
      <QuestList />
    </div>
  )
} 