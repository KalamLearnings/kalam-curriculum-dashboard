/** @type {import('next').NextConfig} */
const nextConfig = {
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
};

export default nextConfig;
