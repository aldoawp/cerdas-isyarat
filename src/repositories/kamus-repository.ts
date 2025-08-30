import { dummyCategories, dummyWords } from '@/dummy/kamus-data';
import { Category, Word } from '@/types/models';

const getKamusData = async (): Promise<{
  categories: Category[];
  words: Word[];
}> => {
  return new Promise(resolve =>
    setTimeout(
      () => resolve({ categories: dummyCategories, words: dummyWords }),
      50
    )
  );
};

export { getKamusData };
