'use client';

import { useEffect } from 'react';

export function PwaRegistrar() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    navigator.serviceWorker
      .register(`${basePath}/sw.js`)
      .catch(() => {
        // service worker registration optional
      });
  }, []);

  return null;
}
