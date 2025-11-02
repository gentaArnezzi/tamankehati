/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'tamankehati-backend-pxnu.onrender.com',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'tamankehati-21.onrender.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'tamankehati-backend-zxb9.onrender.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'tamankehati-backend.onrender.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
    domains: [
      'localhost', 
      'tamankehati-21.onrender.com', 
      'tamankehati-backend-zxb9.onrender.com',
      'tamankehati-backend.onrender.com',
      'tamankehati-backend-pxnu.onrender.com',
      'images.unsplash.com', 
      'example.com', 
      'picsum.photos',
      'chatgpt.com',
      'cdn.prod.website-files.com'
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
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
