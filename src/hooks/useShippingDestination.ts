import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { ShippingDestination } from '@/lib/shipping';

const STORAGE_KEY = 'ihram-shipping-destination';

/**
 * Hook to manage shipping destination state.
 * Defaults to 'NO' when locale is Norwegian, otherwise 'SE'.
 * Persists user selection to localStorage.
 */
export function useShippingDestination(): {
  destination: ShippingDestination;
  setDestination: (dest: ShippingDestination) => void;
} {
  const { i18n } = useTranslation();

  const getDefault = (): ShippingDestination => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'SE' || stored === 'NO') return stored;
    return i18n.language === 'no' ? 'NO' : 'SE';
  };

  const [destination, setDestinationState] = useState<ShippingDestination>(getDefault);

  // Sync default when locale changes (only if user hasn't manually selected)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setDestinationState(i18n.language === 'no' ? 'NO' : 'SE');
    }
  }, [i18n.language]);

  const setDestination = (dest: ShippingDestination) => {
    localStorage.setItem(STORAGE_KEY, dest);
    setDestinationState(dest);
  };

  return { destination, setDestination };
}
