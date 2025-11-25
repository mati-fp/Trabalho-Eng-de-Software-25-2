import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Usa standalone apenas em produção
  ...(process.env.NODE_ENV === 'production' && { output: 'standalone' }),
  // Configurações para hot reload no Docker
  webpackDevMiddleware: (config: any) => {
    config.watchOptions = {
      poll: 1000, // Verifica mudanças a cada segundo
      aggregateTimeout: 300,
    };
    return config;
  },
};

export default nextConfig;
