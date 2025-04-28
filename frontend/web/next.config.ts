import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    authInterrupts: true,
  },
  output: "standalone",
};

export default nextConfig;
