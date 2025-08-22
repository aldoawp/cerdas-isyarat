'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Asumsi komponen ini ada di path yang benar
import BackButton from '@/components/backbutton/backbutton';
import UserDetail from '@/components/userinfo/userinfo';
import MusicPlayer from '@/components/musicplayer/musicplayer';

// --- TIPE DATA & INTERFACE ---
interface Category {
  id: string;
  name: string;
  imageUrl: string;
}

interface Word {
  id: number;
  name: string;
  category: string;
  gifUrl: string;
}

type SearchResult = Category | Word;

// --- DATA DUMMY ---
const dummyCategories: Category[] = [
  { id: 'hewan', name: 'Hewan', imageUrl: '/images/kategori-hewan.png' },
  {
    id: 'kata-tanya',
    name: 'Kata Tanya',
    imageUrl: '/images/kategori-tanya.png',
  },
  { id: 'abjad', name: 'Abjad', imageUrl: '/images/kategori-abjad.png' },
  {
    id: 'perkenalan',
    name: 'Perkenalan',
    imageUrl: '/images/kategori-kenalan.png',
  },
  {
    id: 'keluarga',
    name: 'Keluarga',
    imageUrl: '/images/kategori-keluarga.png',
  },
  { id: 'angka', name: 'Angka', imageUrl: '/images/kategori-angka.png' },
];
const dummyWords: Word[] = [
  {
    id: 1,
    name: 'Kucing',
    category: 'hewan',
    gifUrl: '/images/gif-placeholder.gif',
  },
  {
    id: 2,
    name: 'Anjing',
    category: 'hewan',
    gifUrl: '/images/gif-placeholder.gif',
  },
  {
    id: 3,
    name: 'Burung',
    category: 'hewan',
    gifUrl: '/images/gif-placeholder.gif',
  },
  {
    id: 4,
    name: 'Kuda',
    category: 'hewan',
    gifUrl: '/images/gif-placeholder.gif',
  },
  {
    id: 5,
    name: 'Kelinci',
    category: 'hewan',
    gifUrl: '/images/gif-placeholder.gif',
  },
  {
    id: 6,
    name: 'Ikan',
    category: 'hewan',
    gifUrl: '/images/gif-placeholder.gif',
  },
  {
    id: 7,
    name: 'Kambing',
    category: 'hewan',
    gifUrl: '/images/gif-placeholder.gif',
  },
  {
    id: 8,
    name: 'Singa',
    category: 'hewan',
    gifUrl: '/images/gif-placeholder.gif',
  },
  {
    id: 9,
    name: 'Gajah',
    category: 'hewan',
    gifUrl: '/images/gif-placeholder.gif',
  },
  {
    id: 10,
    name: 'Harimau',
    category: 'hewan',
    gifUrl: '/images/gif-placeholder.gif',
  },
  {
    id: 11,
    name: 'Zebra',
    category: 'hewan',
    gifUrl: '/images/gif-placeholder.gif',
  },
  {
    id: 12,
    name: 'Jerapah',
    category: 'hewan',
    gifUrl: '/images/gif-placeholder.gif',
  },
  {
    id: 13,
    name: 'Beruang',
    category: 'hewan',
    gifUrl: '/images/gif-placeholder.gif',
  },
  {
    id: 14,
    name: 'Monyet',
    category: 'hewan',
    gifUrl: '/images/gif-placeholder.gif',
  },
  {
    id: 15,
    name: 'Kerbau',
    category: 'hewan',
    gifUrl: '/images/gif-placeholder.gif',
  },
  {
    id: 16,
    name: 'Ayam',
    category: 'hewan',
    gifUrl: '/images/gif-placeholder.gif',
  },
  {
    id: 17,
    name: 'Bebek',
    category: 'hewan',
    gifUrl: '/images/gif-placeholder.gif',
  },
  {
    id: 18,
    name: 'Domba',
    category: 'hewan',
    gifUrl: '/images/gif-placeholder.gif',
  },
  {
    id: 19,
    name: 'Apa',
    category: 'kata-tanya',
    gifUrl: '/images/gif-placeholder.gif',
  },
  {
    id: 20,
    name: 'Siapa',
    category: 'kata-tanya',
    gifUrl: '/images/gif-placeholder.gif',
  },
  {
    id: 21,
    name: 'Di mana',
    category: 'kata-tanya',
    gifUrl: '/images/gif-placeholder.gif',
  },
  {
    id: 22,
    name: 'Kapan',
    category: 'kata-tanya',
    gifUrl: '/images/gif-placeholder.gif',
  },
  {
    id: 23,
    name: 'Mengapa',
    category: 'kata-tanya',
    gifUrl: '/images/gif-placeholder.gif',
  },
  {
    id: 24,
    name: 'Bagaimana',
    category: 'kata-tanya',
    gifUrl: '/images/gif-placeholder.gif',
  },
  {
    id: 25,
    name: 'A',
    category: 'abjad',
    gifUrl: '/images/gif-placeholder.gif',
  },
  {
    id: 26,
    name: 'B',
    category: 'abjad',
    gifUrl: '/images/gif-placeholder.gif',
  },
  {
    id: 27,
    name: 'C',
    category: 'abjad',
    gifUrl: '/images/gif-placeholder.gif',
  },
  {
    id: 28,
    name: 'D',
    category: 'abjad',
    gifUrl: '/images/gif-placeholder.gif',
  },
  {
    id: 29,
    name: 'E',
    category: 'abjad',
    gifUrl: '/images/gif-placeholder.gif',
  },
  {
    id: 30,
    name: 'F',
    category: 'abjad',
    gifUrl: '/images/gif-placeholder.gif',
  },
  {
    id: 31,
    name: 'G',
    category: 'abjad',
    gifUrl: '/images/gif-placeholder.gif',
  },
  {
    id: 32,
    name: 'H',
    category: 'abjad',
    gifUrl: '/images/gif-placeholder.gif',
  },
  {
    id: 33,
    name: 'I',
    category: 'abjad',
    gifUrl: '/images/gif-placeholder.gif',
  },
  {
    id: 34,
    name: 'J',
    category: 'abjad',
    gifUrl: '/images/gif-placeholder.gif',
  },
];

// --- FUNGSI FETCH DATA ---
const fetchData = async (): Promise<{
  categories: Category[];
  words: Word[];
}> => {
  return new Promise(resolve =>
    setTimeout(
      () => resolve({ categories: dummyCategories, words: dummyWords }),
      50
    )
  );
};

// --- KOMPONEN IKON ---
const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="size-5 text-white md:size-6"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    {' '}
    <path
      fillRule="evenodd"
      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
      clipRule="evenodd"
    />{' '}
  </svg>
);
const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    {' '}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />{' '}
  </svg>
);
const ChevronLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    {' '}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 19.5L8.25 12l7.5-7.5"
    />{' '}
  </svg>
);
const ChevronRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    {' '}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 4.5l7.5 7.5-7.5 7.5"
    />{' '}
  </svg>
);
const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    {' '}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
    />{' '}
  </svg>
);

// --- KOMPONEN PAGINATION COMPACT ---
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
const CompactPagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return undefined;
  return (
    <div className="flex items-center justify-center space-x-2">
      {' '}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex size-10 items-center justify-center rounded-full border-2 border-white bg-gradient-to-r from-orange-400 to-yellow-500 font-bold text-white shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
      >
        {' '}
        <ChevronLeftIcon className="size-5" />{' '}
      </button>{' '}
      <div className="flex items-center space-x-1">
        {' '}
        <span className="rounded-full border-2 border-white bg-gradient-to-r from-orange-500 to-yellow-600 px-4 py-2 text-lg font-bold text-white shadow-lg">
          {' '}
          {currentPage} / {totalPages}{' '}
        </span>{' '}
      </div>{' '}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex size-10 items-center justify-center rounded-full border-2 border-white bg-gradient-to-r from-orange-400 to-yellow-500 font-bold text-white shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
      >
        {' '}
        <ChevronRightIcon className="size-5" />{' '}
      </button>{' '}
    </div>
  );
};

// --- BREADCRUMB NAVIGATION ---
interface BreadcrumbProps {
  view: 'category' | 'wordList' | 'search';
  categoryName?: string;
  searchTerm?: string;
  onNavigateToCategories: () => void;
}
const Breadcrumb: React.FC<BreadcrumbProps> = ({
  view,
  categoryName,
  searchTerm,
  onNavigateToCategories,
}) => {
  if (view === 'category') return undefined;
  return (
    <div className="mb-3 flex items-center space-x-2">
      {' '}
      <button
        onClick={onNavigateToCategories}
        className="flex items-center space-x-1 rounded-full border-2 border-white bg-gradient-to-r from-orange-500 to-yellow-600 px-4 py-2 text-sm font-bold text-white shadow-lg transition-colors hover:scale-105 hover:text-yellow-200"
      >
        {' '}
        <HomeIcon className="size-4" /> <span>Kategori</span>{' '}
      </button>{' '}
      <span className="font-bold text-white">/</span>{' '}
      <span className="rounded-full border-2 border-white bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-2 text-sm font-bold text-white shadow-lg">
        {' '}
        {view === 'search' && searchTerm
          ? `Hasil: "${searchTerm}"`
          : categoryName || 'Semua Kata'}{' '}
      </span>{' '}
    </div>
  );
};

// --- HELPER FUNCTIONS ---
const isCategory = (item: SearchResult): item is Category => {
  return 'imageUrl' in item;
};
const isWord = (item: SearchResult): item is Word => {
  return 'category' in item && 'gifUrl' in item;
};

// --- KOMPONEN HALAMAN UTAMA ---
export default function KamusPage() {
  const router = useRouter();
  const [view, setView] = useState<'category' | 'wordList' | 'search'>(
    'category'
  );
  const [allWords, setAllWords] = useState<Word[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [displayedContent, setDisplayedContent] = useState<SearchResult[]>([]);
  const [filteredContent, setFilteredContent] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [pageTitle, setPageTitle] = useState('Kamus BISINDO');
  const [selectedWord, setSelectedWord] = useState<Word | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      const { categories, words } = await fetchData();
      setAllWords(words);
      setCategories(categories);
      setDisplayedContent(categories);
      setFilteredContent(categories);
      setIsLoading(false);
    };
    loadInitialData();
  }, []);

  // Filter dan search logic
  useEffect(() => {
    let filtered: SearchResult[] = [];
    switch (view) {
      case 'category': {
        filtered = categories;

        break;
      }
      case 'wordList': {
        filtered = allWords.filter(
          word => word.category === selectedCategoryId
        );

        break;
      }
      case 'search': {
        if (searchTerm.trim()) {
          const searchLower = searchTerm.toLowerCase();
          const matchedCategories = categories.filter(cat =>
            cat.name.toLowerCase().includes(searchLower)
          );
          const matchedWords = allWords.filter(word =>
            word.name.toLowerCase().includes(searchLower)
          );
          filtered = [...matchedCategories, ...matchedWords];
        } else {
          filtered = [...categories, ...allWords];
        }

        break;
      }
      // No default
    }
    setFilteredContent(filtered);
    setCurrentPage(1);
  }, [view, categories, allWords, selectedCategoryId, searchTerm]);

  // Update displayed content based on pagination
  useEffect(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setDisplayedContent(filteredContent.slice(startIndex, endIndex));
  }, [filteredContent, currentPage]);

  const handleCategoryClick = (category: Category) => {
    setSelectedCategoryId(category.id);
    setPageTitle(category.name);
    setView('wordList');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleNavigateToCategories = () => {
    setView('category');
    setPageTitle('Kamus BISINDO');
    setSearchTerm('');
    setSelectedCategoryId('');
    setCurrentPage(1);
  };

  const handleBack = () => {
    if (selectedWord) {
      closeWordDetail();
      return;
    }
    if (view === 'wordList' || view === 'search') {
      handleNavigateToCategories();
    } else {
      router.back();
    }
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setView('search');
      setPageTitle(`Hasil: "${searchTerm}"`);
      setSelectedCategoryId('');
      setCurrentPage(1);
    } else {
      handleNavigateToCategories();
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (!value.trim() && view === 'search') {
      handleNavigateToCategories();
    }
  };

  const openWordDetail = (word: Word) => setSelectedWord(word);
  const closeWordDetail = () => setSelectedWord(undefined);

  const totalPages = Math.ceil(filteredContent.length / ITEMS_PER_PAGE);
  const selectedCategory = categories.find(
    cat => cat.id === selectedCategoryId
  );

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-mobile-bg bg-cover bg-center font-sans md:bg-desktop-bg">
      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* [DIPERBAIKI] onClick ditambahkan di sini */}
            <div
              onClick={handleBack}
              className="cursor-pointer rounded-full p-2 transition hover:bg-black/10"
            >
              <BackButton />
            </div>
          </div>
          <div className="flex items-center pr-20">
            <div className="md:hidden">
              <UserDetail mode="sidebar" />
            </div>
            <div className="hidden md:block">
              <UserDetail mode="dropdown" />
            </div>
          </div>
        </div>
      </header>

      <MusicPlayer />

      {/* Main Content */}
      <main className="relative z-10 flex flex-1 flex-col px-4 pb-4 pt-20 md:px-8">
        {/* Title */}
        <div className="mb-4 text-center">
          <h1 className="text-3xl font-bold text-brand-yellow drop-shadow-lg text-stroke-md md:text-4xl lg:text-5xl">
            {pageTitle}
          </h1>
        </div>

        {/* Search Bar */}
        <div className="mx-auto mb-4 w-full max-w-lg">
          <form onSubmit={handleSearch} noValidate>
            <div className="relative flex items-center">
              <div className="absolute left-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg bg-icon-orange-bg shadow-lg">
                <SearchIcon className="size-4" />
              </div>
              <input
                type="text"
                placeholder="Cari kategori atau kata..."
                value={searchTerm}
                onChange={e => handleSearchChange(e.target.value)}
                className="h-12 w-full rounded-2xl border-4 border-white/80 bg-gradient-to-r from-white/95 to-white/90 p-2 pl-14 text-sm font-bold text-brand-brown-stroke shadow-xl backdrop-blur-sm placeholder:text-amber-700/70 focus:outline-none focus:ring-4 focus:ring-yellow-400/50"
              />
            </div>
          </form>
        </div>

        {/* Breadcrumb */}
        <div className="mx-auto w-full max-w-6xl">
          <Breadcrumb
            view={view}
            categoryName={selectedCategory?.name}
            searchTerm={searchTerm}
            onNavigateToCategories={handleNavigateToCategories}
          />
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center text-xl font-bold text-white">
            <div className="rounded-3xl border-2 border-white/50 bg-gradient-to-r from-orange-400/30 to-yellow-500/30 p-8 shadow-2xl backdrop-blur-md">
              <div className="animate-pulse">Memuat...</div>
            </div>
          </div>
        ) : (
          <div
            className={`flex flex-1 flex-col ${selectedWord ? 'pointer-events-none blur-sm' : ''}`}
          >
            {/* Content Grid */}
            <div className="mx-auto w-full max-w-6xl flex-1">
              <div
                className={`grid h-full gap-3 md:gap-4 ${displayedContent.length <= 2 ? 'grid-cols-2 place-items-center' : 'grid-cols-2 md:grid-cols-4'}`}
              >
                {displayedContent.map((item, _index) => (
                  <div
                    key={
                      isCategory(item) ? `cat-${item.id}` : `word-${item.id}`
                    }
                    className={`group transform transition-all duration-300 hover:scale-105 ${
                      displayedContent.length <= 2
                        ? 'w-full max-w-[200px]'
                        : 'w-full'
                    }`}
                  >
                    <button
                      onClick={() => {
                        if (isCategory(item)) {
                          handleCategoryClick(item);
                        } else if (isWord(item)) {
                          openWordDetail(item);
                        }
                      }}
                      className={`hover:shadow-3xl flex w-full flex-col rounded-3xl border-4 border-white/80 bg-gradient-to-br from-orange-100/90 to-yellow-100/80 p-3 text-center shadow-2xl backdrop-blur-md transition-all duration-300 hover:border-yellow-400 hover:bg-gradient-to-br hover:from-yellow-200/90 hover:to-orange-200/90 md:p-4 ${
                        displayedContent.length <= 2
                          ? 'aspect-square min-h-[180px]'
                          : 'h-full min-h-[120px] md:min-h-[140px]'
                      }`}
                    >
                      <div className="mx-auto mb-2 flex w-full flex-1 items-center justify-center rounded-2xl border border-orange-200/50 bg-gradient-to-br from-orange-50/95 to-yellow-50/95 shadow-inner">
                        <Image
                          src={isCategory(item) ? item.imageUrl : item.gifUrl}
                          alt={item.name}
                          width={60}
                          height={60}
                          className={`object-contain drop-shadow-sm ${
                            displayedContent.length <= 2
                              ? 'size-16 md:size-24'
                              : 'md:size-20'
                          }`}
                        />
                      </div>
                      <span
                        className={`block font-bold text-brand-brown-stroke drop-shadow-sm group-hover:text-orange-600 ${
                          displayedContent.length <= 2
                            ? 'text-base md:text-xl'
                            : 'text-sm md:text-lg'
                        }`}
                      >
                        {item.name}
                      </span>
                      {isWord(item) && (
                        <div className="mt-1 text-xs font-medium text-brand-brown-stroke/70">
                          {
                            categories.find(cat => cat.id === item.category)
                              ?.name
                          }
                        </div>
                      )}
                    </button>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {filteredContent.length === 0 && (
                <div className="flex flex-1 items-center justify-center">
                  <div className="rounded-3xl border-2 border-white/50 bg-gradient-to-r from-orange-400/30 to-yellow-500/30 p-8 text-center shadow-2xl backdrop-blur-md">
                    <h3 className="mb-2 text-xl font-bold text-white drop-shadow-lg">
                      Tidak ada hasil
                    </h3>
                    <p className="text-sm text-white/90 drop-shadow">
                      Coba gunakan kata kunci yang berbeda.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Compact Pagination */}
            {filteredContent.length > 0 && (
              <div className="mt-4 pb-2">
                <CompactPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Large Word Detail Modal */}
      {selectedWord && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
          onClick={closeWordDetail}
        >
          <div
            className="border-gradient-to-r relative z-50 mx-4 w-full max-w-lg scale-100 transform rounded-3xl border-4 border-orange-200 bg-gradient-to-br from-white via-orange-50 to-yellow-50 p-8 shadow-2xl transition-all duration-300"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={closeWordDetail}
              className="absolute -right-3 -top-3 rounded-full border-2 border-white bg-gradient-to-r from-red-500 to-red-600 p-3 shadow-lg transition-all hover:scale-110 hover:from-red-600 hover:to-red-700"
            >
              <CloseIcon className="size-6 text-white" />
            </button>

            <div className="flex flex-col items-center space-y-6">
              {/* Large GIF/Image Container */}
              <div className="relative size-80 overflow-hidden rounded-3xl border-4 border-orange-200/50 bg-gradient-to-br from-orange-50 to-yellow-50 shadow-inner">
                <Image
                  src={selectedWord.gifUrl}
                  alt={selectedWord.name}
                  fill
                  className="object-contain p-4"
                />
                {/* Play indicator overlay for GIF */}
                <div className="absolute right-4 top-4 rounded-full border-2 border-white bg-gradient-to-r from-green-500 to-green-600 px-3 py-1 text-sm font-bold text-white shadow-lg">
                  GIF
                </div>
              </div>

              {/* Word Details */}
              <div className="space-y-4 text-center">
                <h3 className="text-4xl font-bold text-brand-brown-stroke drop-shadow-lg">
                  {selectedWord.name}
                </h3>
                <div className="inline-block rounded-full border-2 border-white bg-gradient-to-r from-orange-400 to-yellow-500 px-6 py-3 text-lg font-bold text-white shadow-lg">
                  {categories.find(cat => cat.id === selectedWord.category)
                    ?.name || 'Kategori'}
                </div>
                <p className="mx-auto max-w-md text-sm leading-relaxed text-gray-600">
                  Pelajari gerakan bahasa isyarat untuk kata &ldquo;
                  {selectedWord.name}&rdquo; dalam kategori{' '}
                  {categories
                    .find(cat => cat.id === selectedWord.category)
                    ?.name?.toLowerCase()}
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
