import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML/JS/CSS export so the game can be bundled into a native
  // Capacitor Android app (WebView) and run fully offline.
  output: "export",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
