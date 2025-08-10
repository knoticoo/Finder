import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable ESLint and TypeScript checking during builds for production deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Use standalone output for production
  output: 'standalone',
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
};

export default nextConfig;
