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
      let fullUrl = logoPath;
      
      // If it's already a full URL
      if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
        fullUrl = logoPath;
      } 
      // If it starts with /uploads
      else if (logoPath.startsWith('/uploads')) {
        const apiBaseUrl = process.env.BACKEND_API_URL || 'http://localhost:3000';
        fullUrl = `${apiBaseUrl}${logoPath}`;
      }
      // If it's just a filename
      else if (!logoPath.includes('/')) {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        fullUrl = `${apiBaseUrl}/uploads/${logoPath}`;
      }
      // For any other relative path
      else {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const cleanPath = logoPath.startsWith('/') ? logoPath : `/${logoPath}`;
        fullUrl = `${apiBaseUrl}${cleanPath}`;
      }
      
      setImgSrc(fullUrl);
    } else {
      setHasError(true);
    }
  }, [logoPath]);

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