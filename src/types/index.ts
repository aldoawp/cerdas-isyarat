// Main types export file - provides clean imports for the entire application

// Shared types
export * from './shared';

// Domain types
export * from './user';
export * from './game';
export * from './dictionary';
export * from './ui';
export * from './api';

// Legacy compatibility exports (to be removed after migration)
// Note: These types have been moved to their respective domain folders
// FormDataState -> UserRegistration in user domain
// MenuButtonProps, PaginationProps, etc. -> ui domain
