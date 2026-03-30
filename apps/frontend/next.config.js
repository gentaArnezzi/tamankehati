/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',
  images: {
    remotePatterns: [
      // Development - localhost support
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/uploads/**',
      },
      // Production - KKH server (via Nginx and direct backend access)
      {
        protocol: 'http',
        hostname: '103.125.91.16',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '103.125.91.16',
        port: '8000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true, // Allow build to proceed despite ESLint warnings
    dirs: ['.'],
  },
  // Optimasi untuk development
  experimental: {
    // optimizeCss: true, // Disabled - requires 'critters' package
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Optimasi untuk production
  productionBrowserSourceMaps: false,
  // Optimasi routing - prefetching
  async rewrites() {
    return [];
  },
  // Optimasi prefetching untuk navigation yang lebih cepat
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
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400'
          }
        ],
      },
    ];
  },
  // Optimasi untuk SSR
  reactStrictMode: true,
  // Optimasi compress
  compress: true,
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
