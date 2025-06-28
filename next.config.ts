import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true, // Important for routing on static hosts
};

export default nextConfig;
