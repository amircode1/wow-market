import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'render.worldofwarcraft.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'render-us.worldofwarcraft.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'render-eu.worldofwarcraft.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
