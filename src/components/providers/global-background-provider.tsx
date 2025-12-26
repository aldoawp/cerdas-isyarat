'use client';

import React, { useEffect, useState } from 'react';
import { getGlobalBackgrounds } from '@/services/background-service';

interface GlobalBackgroundProviderProps {
  children: React.ReactNode;
}

/**
 * Provider yang inject CSS variables untuk background images
 * 100% dari Supabase
 */
export const GlobalBackgroundProvider: React.FC<
  GlobalBackgroundProviderProps
> = ({ children }) => {
  const [backgrounds, setBackgrounds] = useState({
    desktop: '',
    mobile: '',
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchBackgrounds = async () => {
      try {
        const data = await getGlobalBackgrounds();

        if (isMounted) {
          setBackgrounds({
            desktop: data.desktop || '',
            mobile: data.mobile || '',
          });
          setIsLoaded(true);
        }
      } catch {
        if (isMounted) {
          setIsLoaded(true);
        }
      }
    };

    fetchBackgrounds();

    return () => {
      isMounted = false;
    };
  }, []);

  // Inject CSS variables ke document root
  useEffect(() => {
    if (isLoaded) {
      if (backgrounds.desktop) {
        document.documentElement.style.setProperty(
          '--bg-desktop',
          `url("${backgrounds.desktop}")`
        );
      }

      if (backgrounds.mobile) {
        document.documentElement.style.setProperty(
          '--bg-mobile',
          `url("${backgrounds.mobile}")`
        );
      }
    }
  }, [backgrounds, isLoaded]);

  return <>{children}</>;
};
