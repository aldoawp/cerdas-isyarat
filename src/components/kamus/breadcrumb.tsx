import { HomeIcon } from '@/components/icons';
import { BreadcrumbProps } from '@/types';
import React from 'react';

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

export default Breadcrumb;
