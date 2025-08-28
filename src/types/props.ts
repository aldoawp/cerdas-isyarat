import React from 'react';

export interface MenuButtonProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  colors: { bg: string; shadow: string; text: string };
  delay: string;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface BreadcrumbProps {
  view: 'category' | 'wordList' | 'search';
  categoryName?: string;
  searchTerm?: string;
  onNavigateToCategories: () => void;
}

export interface InstructionCardProps {
  step: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}
