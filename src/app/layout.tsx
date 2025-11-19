import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import React from 'react';
import '@/styles/globals.css';
import { MusicProvider } from '@/components/shared/musicplayer/music-context'; // Sesuaikan path
import MusicPlayer from '@/components/shared/musicplayer/musicplayer';
import { AuthProvider } from '@/lib/contexts/auth-context';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Cerdas Isyarat',
  description: 'Belajar Bahasa Isyarat BISINDO',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <MusicProvider>
            {/* Music Player akan muncul di semua halaman */}
            <MusicPlayer />

            {/* Konten halaman */}
            {children}
          </MusicProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
