import { createClient } from '@/lib/supabase/client';
import {
  DictionaryCategory,
  DictionaryWord,
  DictionarySearchResult,
} from '@/types';

const getKamusData = async (): Promise<DictionarySearchResult> => {
  const supabase = createClient();

  try {
    // Fetch categories with their thumbnail assets
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('dictionary')
      .select(
        `
        category_id,
        category,
        thumbnail,
        created_at,
        updated_at,
        assets!dictionary_thumbnail_fkey (
          url
        )
      `
      )
      .order('category', { ascending: true });

    if (categoriesError) {
      throw new Error(`Failed to fetch categories: ${categoriesError.message}`);
    }

    // Fetch dictionary details with their assets
    const { data: detailsData, error: detailsError } = await supabase
      .from('dictionary_details')
      .select(
        `
        detail_id,
        category_id,
        title,
        description,
        thumbnail,
        media,
        created_at,
        updated_at,
        assets_thumbnail:assets!dictionary_details_thumbnail_fkey (
          url
        ),
        assets_media:assets!dictionary_details_media_fkey (
          url
        )
      `
      )
      .order('title', { ascending: true });

    if (detailsError) {
      throw new Error(
        `Failed to fetch dictionary details: ${detailsError.message}`
      );
    }

    // Transform categories data
    const categories: DictionaryCategory[] = (categoriesData || []).map(
      (cat: any) => ({
        id: cat.category_id,
        name: cat.category,
        thumbnail: cat.assets?.url || '/images/default-category.png',
        order: 0,
        wordCount: 0,
        created_at: cat.created_at,
        updated_at: cat.updated_at,
      })
    );

    // Transform words data
    const words: DictionaryWord[] = (detailsData || []).map((detail: any) => ({
      id: detail.detail_id,
      title: detail.title,
      description: detail.description,
      categoryId: detail.category_id,
      categoryName: '',
      thumbnail: detail.assets_thumbnail?.url,
      mediaUrl: detail.assets_media?.url,
      gifUrl: detail.assets_media?.url,
      order: 0,
      created_at: detail.created_at,
      updated_at: detail.updated_at,
    }));

    return { categories, words, totalResults: words.length };
  } catch (error) {
    console.error('Error fetching kamus data:', error);
    throw error;
  }
};

export { getKamusData };
