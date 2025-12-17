import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  eslint: { ignoreDuringBuilds: true },
  // Exclude server-only packages from bundling (works with both webpack and Turbopack)
  serverExternalPackages: ['knex', 'pg'],
  // Turbopack configuration (Next.js 16 default)
  // Empty config silences the warning - Turbopack handles module resolution automatically
  turbopack: {},
  // Webpack config for backward compatibility (when using --webpack flag)
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push("knex");
    }
    
    return config;
  },
} as NextConfig;

export default nextConfig;

