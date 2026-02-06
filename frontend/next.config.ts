import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A veces la configuración correcta para orígenes está en serverActions
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000", 
        "172.17.144.1:3000",
        /* "192.168.105.217:3000", */
      ]
    }
  },
};

export default nextConfig;