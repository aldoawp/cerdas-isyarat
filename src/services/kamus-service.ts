import { getKamusData } from '@/repositories/kamus-repository';
import { DictionarySearchResult } from '@/types';

export const fetchKamusData = async (): Promise<DictionarySearchResult> => {
  try {
    const data = await getKamusData();
    return data;
  } catch (error) {
    console.error('Error in kamus service:', error);
    throw new Error('Failed to fetch dictionary data');
  }
};
