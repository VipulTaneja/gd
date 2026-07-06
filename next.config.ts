import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.gulshandynasty.com",
      },
      {
        protocol: "https",
        hostname: "media.designcafe.com",
      },
      {
        protocol: "https",
        hostname: "meenakshigroup.com",
      },
      {
        protocol: "https",
        hostname: "vistafolia.com",
      },
    ],
  },
};

export default nextConfig;
