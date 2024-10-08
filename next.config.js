const basePath = process.env.BASE_PATH || ''
/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
    reactCompiler: true,
  },
  serverExternalPackages: ['winston'],
  basePath: basePath,
  env: {
    BASE_PATH: basePath
  }
};


module.exports = nextConfig;
