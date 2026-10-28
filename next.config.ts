import type { NextConfig } from 'next';

const config: NextConfig = {
  poweredByHeader: false,
  // This folder is its own app (its own lockfile), even inside the ShopFast monorepo.
  turbopack: { root: process.cwd() },
  outputFileTracingRoot: process.cwd(),
};

export default config;
