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
  buildExcludes: [/middleware-manifest\.json$/],
  runtimeCaching: [
    {
      urlPattern: /^https?:\/\/.*\/_next\/static\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets',
        expiration: { maxEntries: 300, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: ({ url }: { url: URL }) => url.pathname.startsWith('/_next/data') || url.pathname.startsWith('/api'),
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-data',
        networkTimeoutSeconds: 2,
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages-cache',
        networkTimeoutSeconds: 2,
        expiration: { maxEntries: 100, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
  ],
  fallbacks: {
    document: '/',
  }
})(nextConfig)