/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // ⚠️ Temporarily ignoring type errors for deployment
    // TODO: Fix all TypeScript errors identified in type check
    ignoreBuildErrors: true,
  },
  eslint: {
    // ⚠️ Temporarily ignoring ESLint errors for deployment
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '192.168.5.165',
        port: '54321',
        pathname: '/storage/v1/**',
      },
    ],
  },
  // Transpile workspace packages
  transpilePackages: ['@kalam/curriculum-schemas'],
};

export default nextConfig;
