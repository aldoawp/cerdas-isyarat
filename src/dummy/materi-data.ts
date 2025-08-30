// src/data/materiData.ts

export interface MateriItem {
  id: string;
  name: string;
  imageUrl: string;
  exampleSentence: string;
}

export const materiData: { [levelId: number]: MateriItem[] } = {
  1: [
    // Abjad A - E
    {
      id: '1a',
      name: 'Huruf A',
      imageUrl: '/images/materi/placeholder.png',
      exampleSentence: 'Saya suka **A**pel.',
    },
    {
      id: '1b',
      name: 'Huruf B',
      imageUrl: '/images/materi/placeholder.png',
      exampleSentence: 'Ini **B**ola baru.',
    },
    {
      id: '1c',
      name: 'Huruf C',
      imageUrl: '/images/materi/placeholder.png',
      exampleSentence: '**C**icak di dinding.',
    },
    {
      id: '1d',
      name: 'Huruf D',
      imageUrl: '/images/materi/placeholder.png',
      exampleSentence: 'Itu **D**omba putih.',
    },
    {
      id: '1e',
      name: 'Huruf E',
      imageUrl: '/images/materi/placeholder.png',
      exampleSentence: '**E**lang terbang tinggi.',
    },
  ],
  2: [
    // Abjad F - J
    {
      id: '2f',
      name: 'Huruf F',
      imageUrl: '/images/materi/placeholder.png',
      exampleSentence: '**F**oto keluarga kami.',
    },
    {
      id: '2g',
      name: 'Huruf G',
      imageUrl: '/images/materi/placeholder.png',
      exampleSentence: 'Dia punya **G**ajah mainan.',
    },
    {
      id: '2h',
      name: 'Huruf H',
      imageUrl: '/images/materi/placeholder.png',
      exampleSentence: 'Hari ini **H**ujan.',
    },
    {
      id: '2i',
      name: 'Huruf I',
      imageUrl: '/images/materi/placeholder.png',
      exampleSentence: 'Adik makan **I**kan.',
    },
    {
      id: '2j',
      name: 'Huruf J',
      imageUrl: '/images/materi/placeholder.png',
      exampleSentence: 'Aku suka **J**eruk.',
    },
  ],
  3: [
    // Kata Tanya
    {
      id: '3a',
      name: 'Apa?',
      imageUrl: '/images/materi/placeholder.png',
      exampleSentence: '**Apa** warna bajumu?',
    },
    {
      id: '3b',
      name: 'Siapa?',
      imageUrl: '/images/materi/placeholder.png',
      exampleSentence: '**Siapa** nama ibumu?',
    },
    {
      id: '3c',
      name: 'Di mana?',
      imageUrl: '/images/materi/placeholder.png',
      exampleSentence: '**Di mana** kamu tinggal?',
    },
    {
      id: '3d',
      name: 'Kapan?',
      imageUrl: '/images/materi/placeholder.png',
      exampleSentence: '**Kapan** kamu lahir?',
    },
    {
      id: '3e',
      name: 'Mengapa?',
      imageUrl: '/images/materi/placeholder.png',
      exampleSentence: '**Mengapa** kamu sedih?',
    },
    {
      id: '3f',
      name: 'Bagaimana?',
      imageUrl: '/images/materi/placeholder.png',
      exampleSentence: '**Bagaimana** cara membuatnya?',
    },
  ],
  4: [
    // Kata Sapaan
    {
      id: '4a',
      name: 'Halo',
      imageUrl: '/images/materi/placeholder.png',
      exampleSentence: '**Halo**, apa kabar?',
    },
    {
      id: '4b',
      name: 'Selamat Pagi',
      imageUrl: '/images/materi/placeholder.png',
      exampleSentence: '**Selamat Pagi**, Ayah.',
    },
    {
      id: '4c',
      name: 'Terima Kasih',
      imageUrl: '/images/materi/placeholder.png',
      exampleSentence: '**Terima kasih** atas hadiahnya.',
    },
    {
      id: '4d',
      name: 'Maaf',
      imageUrl: '/images/materi/placeholder.png',
      exampleSentence: '**Maaf**, aku tidak sengaja.',
    },
    {
      id: '4e',
      name: 'Sampai Jumpa',
      imageUrl: '/images/materi/placeholder.png',
      exampleSentence: '**Sampai jumpa** besok!',
    },
  ],
};
