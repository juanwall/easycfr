import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.output.workerPublicPath = '_next/';
    return config;
  },
};

export default nextConfig;
