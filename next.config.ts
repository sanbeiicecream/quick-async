import type { NextConfig } from 'next'
const basePath = process.env.BASE_PATH || ''

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
  },
  serverExternalPackages: ['winston'],
  basePath: basePath,
  env: {
    BASE_PATH: basePath,
  },
}

export default nextConfig
