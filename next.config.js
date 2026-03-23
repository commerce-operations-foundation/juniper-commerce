/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: { unoptimized: true },
  transpilePackages: ['lucide-react'],
  serverExternalPackages: ['pg', 'better-sqlite3'],
};
module.exports = nextConfig;
