// UI component types

import React from 'react';

export interface MenuButtonProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  colors: { bg: string; shadow: string; text: string };
  delay: string;
  onClick?: () => void;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  maxVisiblePages?: number;
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
  variant?: 'default' | 'highlighted' | 'completed';
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  required?: boolean;
  disabled?: boolean;
  className?: string;
}
