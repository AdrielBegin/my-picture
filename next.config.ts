import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  allowedDevOrigins: ['http://192.168.1.2:3000'],
  images: {
    domains: ['storage.googleapis.com'],
  },
};

export const config = {
  matcher: ['/routes/dashboard/:path*'],
};

export default nextConfig;
