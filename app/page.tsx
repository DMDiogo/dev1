import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const session = await getSession()

  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role === 'RESTAURANT') {
    redirect(
      session.user.restaurantId
        ? '/restaurant/dashboard'
        : '/restaurant/setup'
    )
  }

  redirect('/dashboard')
}
