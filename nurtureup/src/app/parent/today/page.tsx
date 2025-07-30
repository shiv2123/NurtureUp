import { redirect } from 'next/navigation'

export default async function TodaysCommandPage() {
  // Redirect to new home page
  redirect('/parent/home')
}