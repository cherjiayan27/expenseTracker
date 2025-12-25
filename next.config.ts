import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Toggle for cache components (Phase 2)
    // Set to true to enable React cache components optimization
    // cacheComponents: false,
  },
};

export default nextConfig;

