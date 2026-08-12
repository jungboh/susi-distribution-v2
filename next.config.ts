import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  webpack: (config) => {
    // unzipper (a read-excel-file dependency) exposes optional S3 helpers,
    // but this app only parses uploaded in-memory Excel buffers.
    // Exclude the unused optional SDK from the bundle.
    config.resolve.alias["@aws-sdk/client-s3"] = false;
    return config;
  },
};

export default nextConfig;
