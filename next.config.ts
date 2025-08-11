import type { NextConfig } from 'next';

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  // Tambahkan blok ini untuk mengizinkan domain gambar eksternal
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pinimg.com',
      },
      {
        protocol: 'https',
        hostname: 'st5.depositphotos.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
      },
      {
        protocol: 'https',
        hostname: 'www.clipartmax.com',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
      },
    ],
  },

  // Konfigurasi untuk menangani file statis (yang sudah Anda miliki)
  async headers() {
    return [
      {
        source: '/music/:path*',
        headers: [
          { key: 'Content-Type', value: 'audio/mpeg' },
          { key: 'Accept-Ranges', value: 'bytes' },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          { key: 'Content-Disposition', value: 'inline' },
        ],
      },
      {
        source: '/:path*.(mp3|wav|ogg|m4a)',
        headers: [
          { key: 'Accept-Ranges', value: 'bytes' },
          { key: 'Content-Disposition', value: 'inline' },
        ],
      },
    ];
  },

  // Pastikan file statis dapat diakses (yang sudah Anda miliki)
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
