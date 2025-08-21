// src/data/testBank.ts
import type { Question } from '@/types/test';

export const TEST_DURATION_MS = 30 * 60 * 1000; // 30 menit

export const testBank: { [levelId: number]: Question[] } = {
  1: [
    {
      id: 1,
      mode: 'multiple-choice-image',
      questionAsset: '/gifs/isyarat-kucing.gif',
      options: [
        { id: 'a', asset: '/images/pilihan-kucing.png' },
        { id: 'b', asset: '/images/pilihan-anjing.png' },
        { id: 'c', asset: '/images/pilihan-burung.png' },
        { id: 'd', asset: '/images/pilihan-ikan.png' },
      ],
      correctAnswerId: 'a',
    },
    {
      id: 2,
      mode: 'fill-in-the-blank',
      questionAsset: '/gifs/isyarat-buku.gif',
      correctAnswer: 'BUKU',
    },
    {
      id: 3,
      mode: 'fill-in-the-blank',
      questionAsset: '/gifs/isyarat-mobil.gif',
      correctAnswer: 'MOBIL',
    },
    {
      id: 4,
      mode: 'multiple-choice-image',
      questionAsset: '/gifs/isyarat-rumah.gif',
      options: [
        { id: 'a', asset: '/images/pilihan-sekolah.png' },
        { id: 'b', asset: '/images/pilihan-rumah.png' },
        { id: 'c', asset: '/images/pilihan-kantor.png' },
        { id: 'd', asset: '/images/pilihan-taman.png' },
      ],
      correctAnswerId: 'b',
    },
    {
      id: 5,
      mode: 'fill-in-the-blank',
      questionAsset: '/gifs/isyarat-makan.gif',
      correctAnswer: 'MAKAN',
    },
  ],
  // Tambahkan level lain di sini
};
