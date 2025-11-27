import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Usa standalone apenas em produção
  // ...(process.env.NODE_ENV === 'production' && { output: 'standalone' }),

};

export default nextConfig;
