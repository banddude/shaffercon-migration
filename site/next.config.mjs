/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // No base path needed for custom domain (shaffercon.com)
  // Note: This will break banddude.github.io/shaffercon URL, but custom domain will work
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Ensure trailing slashes for GitHub Pages
  trailingSlash: true,
};

export default nextConfig;
