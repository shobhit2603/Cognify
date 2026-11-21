/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const backendUrl =
      process.env.BACKEND_PROXY_URL ||
      process.env.BACKEND_URL ||
      (process.env.NODE_ENV === 'production'
        ? 'https://cognify-server.onrender.com'
        : 'http://localhost:5000');

    const cleanBase = backendUrl.replace(/\/+$/, '').replace(/\/api\/v1$/, '');

    return [
      {
        source: '/api/v1/:path*',
        destination: `${cleanBase}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
