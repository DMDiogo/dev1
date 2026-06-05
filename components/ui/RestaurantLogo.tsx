'use client'

import { useMemo, useState } from 'react'
import { resolveMediaUrl } from '@/lib/media-url'

interface RestaurantLogoProps {
  logoPath: string | null | undefined
  name: string
  className?: string
}

export default function RestaurantLogo({
  logoPath,
  name,
  className = '',
}: RestaurantLogoProps) {
  const [hasError, setHasError] = useState(false)
  const imgSrc = useMemo(() => resolveMediaUrl(logoPath), [logoPath])

  if (!imgSrc || hasError) {
    return (
      <div
        className={`${className} bg-gradient-to-br from-brand-500/20 to-brand-600/10 flex items-center justify-center rounded-xl border border-brand-500/20`}
      >
        <span className="text-2xl font-bold text-brand-500">
          {name?.charAt(0).toUpperCase() || 'R'}
        </span>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgSrc}
        alt={name}
        className="w-full h-full object-cover rounded-xl"
        onError={() => setHasError(true)}
      />
    </div>
  )
}
