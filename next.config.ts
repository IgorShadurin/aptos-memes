import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Disable Next.js's internal ESLint processing
    // We'll use our own ESLint configuration
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
