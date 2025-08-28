'use client';

import { useState, useEffect } from 'react';

/**
 * Hook untuk mendeteksi ukuran layar dan mengembalikan 'mobile' atau 'desktop'
 * @returns {'mobile' | 'desktop'} - Ukuran layar saat ini
 */
const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState<'mobile' | 'desktop'>('desktop');

  useEffect(() => {
    const checkScreenSize = () => {
      setScreenSize(window.innerWidth < 768 ? 'mobile' : 'desktop');
    };

    // Check on mount
    checkScreenSize();

    // Check on resize
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return screenSize;
};

export default useScreenSize;
