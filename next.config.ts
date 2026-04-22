import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  devIndicators: false,
  experimental: {
    nextDev: {
      statusBar: false,
    },
  },
  // Allow Bing image URLs used for place thumbnails
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'tse3.mm.bing.net' },
      { protocol: 'https', hostname: '*.mm.bing.net' },
    ],
  },
};

export default nextConfig;
