import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "eysbvuebtdwqhpswiths.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "3mb",
    },
  },
};

export default nextConfig;
