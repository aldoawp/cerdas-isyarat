import { createClient } from '@/lib/supabase/client';
import { Category, Word, DictionaryData } from '@/types/dictionary';

const getKamusData = async (): Promise<DictionaryData> => {
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
        video,
        created_at,
        updated_at,
        assets_thumbnail:assets!dictionary_details_thumbnail_fkey (
          url
        ),
        assets_video:assets!dictionary_details_video_fkey (
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
    const categories: Category[] = (categoriesData || []).map((cat: any) => ({
      id: cat.category_id,
      name: cat.category,
      imageUrl: cat.assets?.url || '/images/default-category.png',
    }));

    // Transform words data
    const words: Word[] = (detailsData || []).map((detail: any) => ({
      id: detail.detail_id,
      name: detail.title,
      category: detail.category_id,
      description: detail.description,
      gifUrl: detail.assets_video?.url || '/images/default-video.gif',
      thumbnailUrl: detail.assets_thumbnail?.url || undefined,
    }));

    return { categories, words };
  } catch (error) {
    console.error('Error fetching kamus data:', error);
    throw error;
  }
};

export { getKamusData };
