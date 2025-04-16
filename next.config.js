/** @type {import('next').NextConfig} */
const nextConfig = {
  // Включение Strict Mode для выявления потенциальных проблем
  reactStrictMode: true,
  
  // Оптимизация изображений
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'nupzyzszudzpccdfpqhm.supabase.co',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3000',
        pathname: '**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3001',
        pathname: '**',
      },
    ],
    // Улучшение производительности (quality: 80 - оптимальный баланс качества и размера)
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24, // 24 часа кэширования
    dangerouslyAllowSVG: true, // Разрешить отображение SVG изображений
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Настройки для работы с Supabase
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
    ]
  },

  // Включение компрессии для уменьшения размера страниц
  compress: true,

  // Настройки для улучшения производительности
  swcMinify: true, // Использование SWC для минификации
  
  // Настройки для экспериментальных возможностей
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'], // Для Supabase
    optimizeCss: true, // Оптимизация CSS в продакшене
  },
  
  // Настройки для работы в production
  productionBrowserSourceMaps: false, // Отключаем source maps в продакшене
  poweredByHeader: false, // Отключаем X-Powered-By заголовок

  // Настройки для PWA (опционально)
  // pwa: {
  //   dest: 'public',
  //   register: true,
  //   skipWaiting: true,
  // },
}

module.exports = nextConfig