// Types for Dictionary/Kamus feature based on Supabase schema

export interface DictionaryCategory {
  category_id: string;
  category: string;
  thumbnail: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface DictionaryDetail {
  detail_id: string;
  category_id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  video: string | null;
  created_at: string;
  updated_at: string | null;
}

// Transformed types for UI usage
export interface Category {
  id: string;
  name: string;
  imageUrl: string;
}

export interface Word {
  id: string;
  name: string;
  category: string;
  description: string | null;
  gifUrl: string;
  thumbnailUrl: string | null;
}

export type SearchResult = Category | Word;

// Service response types
export interface DictionaryData {
  categories: Category[];
  words: Word[];
}
