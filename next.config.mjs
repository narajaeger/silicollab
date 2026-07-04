/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Tipe sudah divalidasi via `npm run typecheck` (tsc). Lint tidak
    // menggagalkan build; jalankan terpisah dengan `npm run lint`.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
