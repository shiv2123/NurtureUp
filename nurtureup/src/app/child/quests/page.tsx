import { redirect } from 'next/navigation'

export default async function QuestsPage() {
  // Redirect to new quest page
  redirect('/child/quest')
}