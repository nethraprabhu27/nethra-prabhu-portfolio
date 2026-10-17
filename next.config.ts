import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Lets the page work when opened by the computer's network address (e.g. 10.0.0.236:3002) as well as localhost;
  // otherwise the dev server blocks its scripts there and nothing on the page responds.
  allowedDevOrigins: ["10.0.0.236"],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
