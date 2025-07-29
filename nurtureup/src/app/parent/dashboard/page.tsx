import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  // Redirect to new Today's Command Center
  redirect('/parent/today')
}