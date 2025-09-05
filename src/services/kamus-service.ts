import { getKamusData } from '@/repositories/kamus-repository';
import { DictionaryData } from '@/types/dictionary';

export const fetchKamusData = async (): Promise<DictionaryData> => {
  try {
    const data = await getKamusData();
    return data;
  } catch (error) {
    console.error('Error in kamus service:', error);
    throw new Error('Failed to fetch dictionary data');
  }
};
