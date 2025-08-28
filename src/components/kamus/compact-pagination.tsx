import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';
import { PaginationProps } from '@/types/props';
import React from 'react';

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

export default CompactPagination;
