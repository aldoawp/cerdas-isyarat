// Dictionary/Kamus domain types

export interface DictionaryCategory {
  id: string;
  name: string;
  description?: string;
  thumbnail: string;
  order: number;
  wordCount: number;
  created_at: string;
  updated_at?: string;
}

export interface DictionaryWord {
  id: string;
  title: string;
  description?: string;
  categoryId: string;
  categoryName: string;
  thumbnail?: string;
  mediaUrl?: string;
  gifUrl?: string;
  order: number;
  created_at: string;
  updated_at?: string;
}

export interface DictionarySearchResult {
  categories: DictionaryCategory[];
  words: DictionaryWord[];
  totalResults: number;
}

export interface DictionaryView {
  type: 'category' | 'wordList' | 'search';
  categoryId?: string;
  categoryName?: string;
  searchTerm?: string;
}

export interface DictionaryFilters {
  categoryId?: string;
  searchTerm?: string;
  sortBy?: 'name' | 'created_at' | 'order';
  sortOrder?: 'asc' | 'desc';
}
