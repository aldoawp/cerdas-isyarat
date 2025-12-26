import { getKamusData } from '@/repositories/kamus-repository';
import { DictionarySearchResult } from '@/types';
import { logServiceError } from '@/lib/utils/error-logger';

export const fetchKamusData = async (): Promise<DictionarySearchResult> => {
  try {
    const data = await getKamusData();
    return data;
  } catch (error) {
    console.error('Error in kamus service:', error);
    await logServiceError(error, 'kamus-service');
    throw new Error('Failed to fetch dictionary data');
  }
};
