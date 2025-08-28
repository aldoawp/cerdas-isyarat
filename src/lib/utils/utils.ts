import { SearchResult, Category, Word } from '@/types/models';

const isCategory = (item: SearchResult): item is Category => {
  return 'imageUrl' in item;
};

const isWord = (item: SearchResult): item is Word => {
  return 'category' in item && 'gifUrl' in item;
};

export { isCategory, isWord };
