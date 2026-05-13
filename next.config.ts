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
  buildExcludes: [/middleware-manifest\.json$/, /_next\/static\/.*\.map$/],
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
  runtimeCaching: [
    {
      urlPattern: ({ url }) => url.origin === self.location.origin && url.pathname === '/',
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'homepage-cache',
      },
    },
    {
      urlPattern: /\/_next\/static\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets',
        expiration: { maxEntries: 500, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: ({ url }) => url.pathname.startsWith('/api') || url.pathname.startsWith('/_next/data'),
      handler: 'NetworkFirst',
      options: {
        cacheName: 'dynamic-data',
        networkTimeoutSeconds: 5,
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-cache',
        expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'global-cache',
        networkTimeoutSeconds: 5,
      },
    },
  ],
  fallbacks: {
    document: '/',
  }
})(nextConfig)