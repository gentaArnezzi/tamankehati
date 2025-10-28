/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'localhost', 
      'tamankehati-21.onrender.com', 
      'images.unsplash.com', 
      'example.com', 
      'picsum.photos',
      'chatgpt.com',
      'cdn.prod.website-files.com',
      'tamankehati-backend.onrender.com'
    ],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
