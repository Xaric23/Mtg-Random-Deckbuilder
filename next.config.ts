import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Remove API routes in static export
  // The app already calls Scryfall directly from the client
};

export default nextConfig;
