/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.tgdd.vn',
      },
      // You can add more patterns here if your product images come from other domains
    ],
  },
};

export default nextConfig;
