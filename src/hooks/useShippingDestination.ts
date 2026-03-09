/**
 * Hook for shipping destination — now supports all of Europe.
 */
import { useState } from "react";

export function useShippingDestination() {
  const [destination, setDestination] = useState<string>('SE');
  
  return {
    destination,
    setDestination,
  };
}
