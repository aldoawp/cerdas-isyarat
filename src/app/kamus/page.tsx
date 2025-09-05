import KamusPage from '@/containers/kamus';
import { fetchKamusData } from '@/services/kamus-service';
import { DictionaryData } from '@/types/dictionary';

export default async function Kamus() {
  let dictionaryData: DictionaryData = { categories: [], words: [] };

  try {
    dictionaryData = await fetchKamusData();
  } catch {
    // Continue with empty data - the component will handle the empty state
  }

  return <KamusPage dictionaryData={dictionaryData} />;
}
