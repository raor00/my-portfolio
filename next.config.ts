import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      {
        source: "/proyectos/iparts-erp",
        destination: "/proyectos/iparts-platform",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
