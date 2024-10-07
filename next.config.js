/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
    reactCompiler: true,
  },
  serverExternalPackages: ['winston']
};


module.exports = nextConfig;
