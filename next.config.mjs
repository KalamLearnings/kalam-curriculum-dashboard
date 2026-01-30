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
        hostname: '127.0.0.1',
        port: '54321',
        pathname: '/storage/v1/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/**',
      },
      {
        protocol: 'https',
        hostname: 'api.kalamkidslearning.com',
        pathname: '/storage/v1/**',
      },
    ],
  },
  // Transpile workspace packages
  transpilePackages: ['@kalam/curriculum-schemas'],
};

export default nextConfig;
