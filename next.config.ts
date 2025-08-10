import type { NextConfig } from 'next';

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  // Konfigurasi untuk menangani file statis
  async headers() {
    return [
      {
        // Header untuk semua file statis
        source: '/music/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'audio/mpeg',
          },
          {
            key: 'Accept-Ranges',
            value: 'bytes',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            // Mencegah download otomatis
            key: 'Content-Disposition',
            value: 'inline',
          },
        ],
      },
      {
        // Header umum untuk file media
        source: '/:path*.(mp3|wav|ogg|m4a)',
        headers: [
          {
            key: 'Accept-Ranges',
            value: 'bytes',
          },
          {
            key: 'Content-Disposition',
            value: 'inline',
          },
        ],
      },
    ];
  },

  // Pastikan file statis dapat diakses
  async rewrites() {
    return [
      {
        source: '/music/:path*',
        destination: '/music/:path*',
      },
    ];
  },
};

export default nextConfig;