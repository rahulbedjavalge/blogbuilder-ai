/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['plausible.io'],
  },
  experimental: {
    esmExternals: false,
  },
  transpilePackages: ['react-markdown'],
}

module.exports = nextConfig
