import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure proper static generation
  trailingSlash: false,
  // Optimize for Vercel
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
