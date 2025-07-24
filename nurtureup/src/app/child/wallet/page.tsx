import { WalletDisplay } from '@/components/child/WalletDisplay'

export default function WalletPage() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      <h1 className="text-2xl font-child font-bold text-mint-green mb-4">My Wallet</h1>
      <WalletDisplay />
    </div>
  )
} 