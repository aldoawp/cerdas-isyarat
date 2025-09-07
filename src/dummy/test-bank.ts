import { Question } from '@/types';

export const TEST_DURATION_MS = 30 * 60 * 1000; // 30 menit

export const testBank: { [levelId: number]: Question[] } = {
  1: [
    {
      id: 1,
      mode: 'multiple-choice-image',
      questionAsset: '/gifs/isyarat-kucing.gif',
      levelId: 1,
      order: 1,
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
      levelId: 1,
      order: 2,
      correctAnswer: 'BUKU',
    },
    {
      id: 3,
      mode: 'fill-in-the-blank',
      questionAsset: '/gifs/isyarat-mobil.gif',
      levelId: 1,
      order: 3,
      correctAnswer: 'MOBIL',
    },
    {
      id: 4,
      mode: 'multiple-choice-image',
      questionAsset: '/gifs/isyarat-rumah.gif',
      levelId: 1,
      order: 4,
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
      levelId: 1,
      order: 5,
      correctAnswer: 'MAKAN',
    },
  ],
  // Tambahkan level lain di sini
};
