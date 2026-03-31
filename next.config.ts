import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  experimental: {},
  // Prevent static prerendering for all pages
  output: undefined,
};

export default nextConfig;
