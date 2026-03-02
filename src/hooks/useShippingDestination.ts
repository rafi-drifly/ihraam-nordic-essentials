/**
 * Simplified hook — Sweden only.
 */
export function useShippingDestination() {
  return {
    destination: 'SE' as const,
    setDestination: (_dest: string) => {},
  };
}
