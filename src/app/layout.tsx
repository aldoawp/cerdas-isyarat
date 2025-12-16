import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import React from 'react';
import '@/styles/globals.css';
import { MusicProvider } from '@/components/shared/musicplayer/music-context';
import MusicPlayer from '@/components/shared/musicplayer/musicplayer';
import { AuthProvider } from '@/lib/contexts/auth-context';
import { GlobalBackgroundProvider } from '@/components/providers/global-background-provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Bisindo Learning App',
  description: 'Aplikasi Pembelajaran Bahasa Isyarat Indonesia',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GlobalBackgroundProvider>
          <AuthProvider>
            <MusicProvider>
              <MusicPlayer />
              {children}
            </MusicProvider>
          </AuthProvider>
        </GlobalBackgroundProvider>
      </body>
    </html>
  );
}
