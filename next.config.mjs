/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
