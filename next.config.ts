import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['bcryptjs', 'pg'],
  env: {
    BACKEND_API_URL: process.env.BACKEND_API_URL || '',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'aodelivery-api.angolaerp.co.ao',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
    ],
  },
}

export default nextConfig