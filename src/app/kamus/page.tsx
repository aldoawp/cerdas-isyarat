import KamusPage from '@/containers/kamus';
import { fetchKamusData } from '@/services/kamus-service';
import { DictionarySearchResult } from '@/types';

export default async function Kamus() {
  let dictionaryData: DictionarySearchResult = {
    categories: [],
    words: [],
    totalResults: 0,
  };

  try {
    dictionaryData = await fetchKamusData();
  } catch {
    // Continue with empty data - the component will handle the empty state
  }

  return <KamusPage dictionaryData={dictionaryData} />;
}
