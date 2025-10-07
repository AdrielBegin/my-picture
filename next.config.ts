import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['storage.googleapis.com'],
  },
  serverExternalPackages: ['firebase-admin']
};

export default nextConfig;
