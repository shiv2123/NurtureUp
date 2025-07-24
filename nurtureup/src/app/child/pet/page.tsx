import { VirtualPet } from '@/components/child/VirtualPet'

export default function PetPage() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      <h1 className="text-2xl font-child font-bold text-black mb-4">My Virtual Pet</h1>
      <VirtualPet />
    </div>
  )
} 