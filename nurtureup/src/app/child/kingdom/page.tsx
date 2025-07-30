import { redirect } from 'next/navigation'

export default async function MyKingdomPage() {
  // Redirect to new me page
  redirect('/child/me')
}