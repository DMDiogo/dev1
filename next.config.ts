import type { NextConfig } from 'next'

const apiHost = (() => {
  try {
    const url = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL
    return url ? new URL(url).hostname : 'aodelivery-api.angolaerp.co.ao'
  } catch {
    return 'aodelivery-api.angolaerp.co.ao'
  }
})()

const nextConfig: NextConfig = {
  serverExternalPackages: ['bcryptjs', 'pg'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: apiHost,
        pathname: '/uploads/**',
      },
    ],
  },
}

export default nextConfig
