import type { NextConfig } from 'next'
const withPWA = require('next-pwa')

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {},
}

module.exports = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\/_next\/static\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets',
        expiration: { maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /^https:\/\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'hospital-queue-pages',
        expiration: { maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 },
        networkTimeoutSeconds: 10,
      },
    },
  ],
})(nextConfig)