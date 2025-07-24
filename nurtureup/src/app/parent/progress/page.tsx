import { ProgressHubWidgets } from '@/components/parent/ProgressHubWidgets'

export default function ProgressPage() {
  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold text-sky-blue mb-6">Progress Hub</h1>
      <ProgressHubWidgets />
      {/* Comparison Pulse Placeholder */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-soft p-6">
        <h2 className="text-xl font-bold mb-2">Comparison Pulse</h2>
        <div className="text-black">(Optional) Compare sibling progress side-by-side.</div>
        <div className="h-16 flex items-center justify-center text-black">[Comparison pulse coming soon]</div>
      </div>
    </div>
  )
} 