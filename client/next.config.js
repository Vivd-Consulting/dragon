/** @type {import('next').NextConfig} */
import withGraphql from 'next-plugin-graphql';

const nextConfig = {
  reactStrictMode: false,
  ...withGraphql(),
  images: {
    domains: ['localhost'],
    formats: ['image/avif', 'image/webp']
  },
  eslint: { ignoreDuringBuilds: true },
  pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js'],
  async redirects() {
    return [];
  }
};

export default nextConfig;
