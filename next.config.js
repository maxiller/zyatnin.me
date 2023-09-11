/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental:
    {
      mdxRs: true,
    }
}
const withMDX = require('@next/mdx')()
module.exports = withMDX(nextConfig)
