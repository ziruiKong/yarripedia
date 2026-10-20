import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack(config, { isServer }) {
    if (isServer) config.resolve.alias["@/db/next"] = path.resolve(process.cwd(), "db/next.ts");
    return config;
  },
};
export default nextConfig;
