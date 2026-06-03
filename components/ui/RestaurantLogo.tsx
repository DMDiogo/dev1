'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface RestaurantLogoProps {
  logoPath: string | null | undefined;
  name: string;
  className?: string;
}

export default function RestaurantLogo({ logoPath, name, className = '' }: RestaurantLogoProps) {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (logoPath && logoPath.trim() !== '') {
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      let fullUrl = logoPath

      if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
        fullUrl = logoPath
      } else if (logoPath.startsWith('/restaurant-logos')) {
        fullUrl = logoPath
      } else if (logoPath.startsWith('/uploads')) {
        fullUrl = `${apiBaseUrl}${logoPath}`
      } else if (!logoPath.includes('/')) {
        fullUrl = `${apiBaseUrl}/uploads/${logoPath}`
      } else {
        const cleanPath = logoPath.startsWith('/') ? logoPath : `/${logoPath}`
        fullUrl = `${apiBaseUrl}${cleanPath}`
      }

      setImgSrc(fullUrl)
      setHasError(false)
    } else {
      setImgSrc('')
      setHasError(true)
    }
  }, [logoPath])

  const handleError = () => {
    setHasError(true);
  };

  // Show placeholder with first letter if image fails to load or no logo
  if (hasError || !imgSrc) {
    return (
      <div className={`${className} bg-gradient-to-br from-brand-500/20 to-brand-600/10 flex items-center justify-center rounded-xl border border-brand-500/20`}>
        <span className="text-2xl font-bold text-brand-500">
          {name?.charAt(0).toUpperCase() || 'R'}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Image
        src={imgSrc}
        alt={name}
        fill
        className="rounded-xl object-cover"
        unoptimized
        onError={handleError}
      />
    </div>
  );
}