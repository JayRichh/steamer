/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Image optimization
  images: {
    domains: ['steamcdn-a.akamaihd.net', 'avatars.steamstatic.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // Optimize build output
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@react-three/drei'],
    webVitalsAttribution: ['CLS', 'LCP'],
    strictNextHead: true,
  },

  // Vercel specific optimizations
  env: {
    VERCEL_URL: process.env.VERCEL_URL,
  },

  // Headers for security and caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
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
            key: 'Cache-Control',
            value: process.env.NODE_ENV === 'production' ? 'public, max-age=31536000, immutable' : 'no-cache, no-store, must-revalidate'
          }
        ],
      },
      {
        source: '/(fonts|images)/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, stale-while-revalidate=300'
          }
        ]
      }
    ];
  },

  // Ensure sitemap and robots.txt are handled correctly
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap',
      },
      {
        source: '/robots.txt',
        destination: '/api/robots',
      },
    ];
  },

  // Production build configuration
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Exclude example pages from production build
      config.module.rules.push({
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: [
          /node_modules/,
          /src\/app\/examples/,
          /src\/app\/three/
        ],
      });

      // Optimize CSS
      config.optimization.splitChunks.cacheGroups.styles = {
        name: 'styles',
        test: /\.(css|scss)$/,
        chunks: 'all',
        enforce: true,
      };
    }
    return config;
  },

  // Exclude paths from production
  async redirects() {
    if (process.env.NODE_ENV === 'production') {
      return [
        {
          source: '/examples/:path*',
          destination: '/404',
          permanent: true,
        },
        {
          source: '/three/:path*',
          destination: '/404',
          permanent: true,
        }
      ];
    }
    return [];
  }
};

module.exports = nextConfig;
