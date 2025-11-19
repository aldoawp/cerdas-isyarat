import { DictionaryCategory, DictionaryWord } from '@/types';

type SearchResult = DictionaryCategory | DictionaryWord;

const isCategory = (item: SearchResult): item is DictionaryCategory => {
  return 'thumbnail' in item;
};

const isWord = (item: SearchResult): item is DictionaryWord => {
  return 'categoryId' in item && 'title' in item;
};

export { isCategory, isWord };
