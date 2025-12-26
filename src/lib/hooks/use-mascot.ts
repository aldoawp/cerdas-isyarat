import { useState, useEffect } from 'react';
import { getPageMascot } from '@/services/mascot-service';

interface UseMascotReturn {
  mascotUrl: string | undefined;
  loading: boolean;
  error: string | undefined;
}

/**
 * Hook untuk mengambil mascot image untuk page tertentu
 * * @param page - Nama page (e.g., 'onboarding', 'login', 'register')
 * @param position - Optional position filter
 * @param fallback - Fallback image URL jika fetch gagal
 */
export const useMascot = (
  page: string,
  position?: string,
  fallback?: string
): UseMascotReturn => {
  // Ganti null dengan undefined
  const [mascotUrl, setMascotUrl] = useState<string | undefined>(
    fallback || undefined
  );
  const [loading, setLoading] = useState(true);
  // Ganti null dengan undefined
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;

    const fetchMascot = async () => {
      try {
        setLoading(true);
        // Ganti null dengan undefined
        setError(undefined);

        const url = await getPageMascot(page, position);

        if (isMounted) {
          // Jika ada URL dari DB, gunakan itu. Jika tidak, gunakan fallback.
          // Terakhir gunakan undefined sebagai pengganti null.
          setMascotUrl(url || fallback || undefined);
        }
      } catch (error_) {
        if (isMounted) {
          setError('Gagal memuat mascot');
          console.error('Mascot fetch error:', error_);
          // Tetap gunakan fallback jika ada error
          if (fallback) {
            setMascotUrl(fallback);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMascot();

    return () => {
      isMounted = false;
    };
  }, [page, position, fallback]);

  return { mascotUrl, loading, error };
};
