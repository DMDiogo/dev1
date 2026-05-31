'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

export default function AuthRedirect() {
  const { status, data } = useSession()

  useEffect(() => {
    if (status !== 'authenticated' || !data?.user) return

    const { role, restaurantId } = data.user

    let destination = '/dashboard'
    if (role === 'RESTAURANT') {
      destination = restaurantId
        ? '/restaurant/dashboard'
        : '/setup'
    }

    window.location.replace(destination)
  }, [status, data])

  return null
}
