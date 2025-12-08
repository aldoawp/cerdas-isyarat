'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import BackButton from '@/components/shared/backbutton/backbutton';
import UserDetail from '@/components/shared/userinfo';
import MusicPlayer from '@/components/shared/musicplayer/musicplayer';
import { SearchIcon, CloseIcon } from '@/components/icons';
import Breadcrumb from '@/components/kamus/breadcrumb';
import CompactPagination from '@/components/kamus/compact-pagination';
import { isCategory, isWord } from '@/lib/utils/utils';
import {
  DictionaryWord,
  DictionaryCategory,
  DictionarySearchResult,
} from '@/types';
import { useRequireAuth, usePageLoading } from '@/lib/contexts/auth-context';
import LoadingScreen from '@/components/shared/loading-screen';

interface KamusPageProps {
  dictionaryData: DictionarySearchResult;
}

interface ImageLoadingState {
  [key: string]: boolean;
}

export default function KamusPage({ dictionaryData }: KamusPageProps) {
  const router = useRouter();
  const { loading: authLoading } = useRequireAuth();
  const { isPageLoading } = usePageLoading();
  const [view, setView] = useState<'category' | 'wordList' | 'search'>(
    'category'
  );
  const [allWords] = useState<DictionaryWord[]>(dictionaryData.words);
  const [categories] = useState<DictionaryCategory[]>(
    dictionaryData.categories
  );
  const [displayedContent, setDisplayedContent] = useState<
    (DictionaryCategory | DictionaryWord)[]
  >(dictionaryData.categories);
  const [filteredContent, setFilteredContent] = useState<
    (DictionaryCategory | DictionaryWord)[]
  >(dictionaryData.categories);
  const [isLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [pageTitle, setPageTitle] = useState('Kamus BISINDO');
  const [selectedWord, setSelectedWord] = useState<DictionaryWord | undefined>(
    undefined
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [imageLoadingStates, setImageLoadingStates] =
    useState<ImageLoadingState>({});
  const ITEMS_PER_PAGE = 8;

  // Filter dan search logic
  useEffect(() => {
    let filtered: (DictionaryCategory | DictionaryWord)[] = [];
    switch (view) {
      case 'category': {
        filtered = categories;
        break;
      }
      case 'wordList': {
        filtered = allWords.filter(
          word => word.categoryId === selectedCategoryId
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
            word.title.toLowerCase().includes(searchLower)
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
    const newContent = filteredContent.slice(startIndex, endIndex);
    setDisplayedContent(newContent);

    // Reset loading states untuk konten baru
    const newLoadingStates: ImageLoadingState = {};
    for (const item of newContent) {
      const itemId = isCategory(item) ? `cat-${item.id}` : `word-${item.id}`;
      newLoadingStates[itemId] = true;
    }
    setImageLoadingStates(prev => ({ ...prev, ...newLoadingStates }));
  }, [filteredContent, currentPage]);

  const handleImageLoad = (itemId: string) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [itemId]: false,
    }));
  };

  const handleImageError = (itemId: string) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [itemId]: false,
    }));
  };

  const handleCategoryClick = (category: DictionaryCategory) => {
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
      router.push('/onboarding');
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

  const openWordDetail = (word: DictionaryWord) => {
    setSelectedWord(word);
    setImageLoadingStates(prev => ({
      ...prev,
      [`modal-${word.id}`]: true,
    }));
  };

  const closeWordDetail = () => setSelectedWord(undefined);

  const totalPages = Math.ceil(filteredContent.length / ITEMS_PER_PAGE);
  const selectedCategory = categories.find(
    cat => cat.id === selectedCategoryId
  );

  // Show loading screen while page is loading or checking authentication
  if (isPageLoading || authLoading) {
    return <LoadingScreen message="Memeriksa autentikasi..." />;
  }

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-mobile-bg bg-cover bg-center font-sans md:bg-desktop-bg">
      {/* Header - Fixed */}
      <header className="fixed inset-x-0 top-0 z-30 bg-gradient-to-b from-black/20 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div
              onClick={handleBack}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleBack();
                }
              }}
              role="button"
              tabIndex={0}
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

      {/* Main Content - Scrollable */}
      <main className="relative z-10 flex flex-1 flex-col overflow-hidden pt-20">
        {/* Fixed Header Section */}
        <div className="flex-shrink-0 px-4 md:px-8">
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
          <div className="mx-auto w-full max-w-6xl pb-4">
            <Breadcrumb
              view={view}
              categoryName={selectedCategory?.name}
              searchTerm={searchTerm}
              onNavigateToCategories={handleNavigateToCategories}
            />
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 md:px-8">
          {/* Loading State */}
          {isLoading ? (
            <div className="flex min-h-[400px] items-center justify-center text-xl font-bold text-white">
              <div className="rounded-3xl border-2 border-white/50 bg-gradient-to-r from-orange-400/30 to-yellow-500/30 p-8 shadow-2xl backdrop-blur-md">
                <div className="animate-pulse">Memuat...</div>
              </div>
            </div>
          ) : (
            <div
              className={`${selectedWord ? 'pointer-events-none blur-sm' : ''}`}
            >
              {/* Content Grid */}
              <div className="mx-auto w-full max-w-6xl">
                <div
                  className={`grid gap-3 md:gap-4 ${displayedContent.length <= 2 ? 'grid-cols-2 place-items-center' : 'grid-cols-2 md:grid-cols-4'}`}
                >
                  {displayedContent.map(item => {
                    const itemId = isCategory(item)
                      ? `cat-${item.id}`
                      : `word-${item.id}`;
                    const isImageLoading = imageLoadingStates[itemId] !== false;

                    return (
                      <div
                        key={itemId}
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
                          <div className="relative mx-auto mb-2 flex w-full flex-1 items-center justify-center rounded-2xl border border-orange-200/50 bg-gradient-to-br from-orange-50/95 to-yellow-50/95 shadow-inner">
                            {isImageLoading && (
                              <div className="absolute inset-0 flex items-center justify-center bg-orange-50/80">
                                <div
                                  className={`animate-spin rounded-full border-4 border-orange-300 border-t-orange-600 ${
                                    displayedContent.length <= 2
                                      ? 'size-10'
                                      : 'size-8'
                                  }`}
                                ></div>
                              </div>
                            )}
                            <Image
                              src={
                                isCategory(item)
                                  ? item.thumbnail
                                  : item.gifUrl || '/images/default-video.gif'
                              }
                              alt={isCategory(item) ? item.name : item.title}
                              width={60}
                              height={60}
                              onLoad={() => handleImageLoad(itemId)}
                              onError={() => handleImageError(itemId)}
                              className={`object-cover drop-shadow-sm transition-opacity duration-300 ${
                                displayedContent.length <= 2
                                  ? 'size-16 md:size-24'
                                  : 'md:size-20'
                              } ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                              unoptimized={
                                !isCategory(item) &&
                                (item.gifUrl?.endsWith('.gif') || false)
                              }
                            />
                          </div>
                          <span
                            className={`block font-bold text-brand-brown-stroke drop-shadow-sm group-hover:text-orange-600 ${
                              displayedContent.length <= 2
                                ? 'text-base md:text-xl'
                                : 'text-sm md:text-lg'
                            }`}
                          >
                            {isCategory(item) ? item.name : item.title}
                          </span>
                          {isWord(item) && (
                            <div className="mt-1 text-xs font-medium text-brand-brown-stroke/70">
                              {
                                categories.find(
                                  cat => cat.id === item.categoryId
                                )?.name
                              }
                            </div>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Empty State */}
                {filteredContent.length === 0 && (
                  <div className="flex min-h-[400px] items-center justify-center">
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
        </div>
      </main>

      {/* Large Word Detail Modal */}
      {selectedWord && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
          onClick={closeWordDetail}
          onKeyDown={e => {
            if (e.key === 'Escape') {
              closeWordDetail();
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="word-detail-title"
          tabIndex={-1}
        >
          <div
            className="border-gradient-to-r relative z-50 mx-4 w-full max-w-lg scale-100 transform rounded-3xl border-4 border-orange-200 bg-gradient-to-br from-white via-orange-50 to-yellow-50 p-8 shadow-2xl transition-all duration-300"
            onClick={e => e.stopPropagation()}
            onKeyDown={e => e.stopPropagation()}
            role="document"
            tabIndex={0}
          >
            <button
              onClick={closeWordDetail}
              className="absolute -right-3 -top-3 rounded-full border-2 border-white bg-gradient-to-r from-red-500 to-red-600 p-3 shadow-lg transition-all hover:scale-110 hover:from-red-600 hover:to-red-700"
              aria-label="Tutup detail kata"
            >
              <CloseIcon className="size-6 text-white" />
            </button>

            <div className="flex flex-col items-center space-y-6">
              {/* Large GIF/Image Container */}
              <div className="relative size-80 overflow-hidden rounded-3xl border-4 border-orange-200/50 bg-gradient-to-br from-orange-50 to-yellow-50 shadow-inner">
                {imageLoadingStates[`modal-${selectedWord.id}`] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-orange-50/80">
                    <div className="size-12 animate-spin rounded-full border-4 border-orange-300 border-t-orange-600"></div>
                  </div>
                )}
                <Image
                  src={selectedWord.gifUrl || '/images/default-video.gif'}
                  alt={selectedWord.title}
                  fill
                  onLoad={() => handleImageLoad(`modal-${selectedWord.id}`)}
                  onError={() => handleImageError(`modal-${selectedWord.id}`)}
                  className={`object-contain p-4 transition-opacity duration-300 ${
                    imageLoadingStates[`modal-${selectedWord.id}`]
                      ? 'opacity-0'
                      : 'opacity-100'
                  }`}
                  unoptimized={selectedWord.gifUrl?.endsWith('.gif') || false}
                />
                {/* Play indicator overlay for GIF */}
                <div className="absolute right-4 top-4 rounded-full border-2 border-white bg-gradient-to-r from-green-500 to-green-600 px-3 py-1 text-sm font-bold text-white shadow-lg">
                  GIF
                </div>
              </div>

              {/* Word Details */}
              <div className="space-y-4 text-center">
                <h3
                  id="word-detail-title"
                  className="text-4xl font-bold text-brand-brown-stroke drop-shadow-lg"
                >
                  {selectedWord.title}
                </h3>
                <div className="inline-block rounded-full border-2 border-white bg-gradient-to-r from-orange-400 to-yellow-500 px-6 py-3 text-lg font-bold text-white shadow-lg">
                  {categories.find(cat => cat.id === selectedWord.categoryId)
                    ?.name || 'Kategori'}
                </div>
                <p className="mx-auto max-w-md text-sm leading-relaxed text-gray-600">
                  Pelajari gerakan bahasa isyarat untuk kata &ldquo;
                  {selectedWord.title}&rdquo; dalam kategori{' '}
                  {categories
                    .find(cat => cat.id === selectedWord.categoryId)
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
