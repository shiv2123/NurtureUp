import { redirect } from 'next/navigation'

export default async function ArcadePage() {
  // Redirect to new explore page
  redirect('/child/explore')
}