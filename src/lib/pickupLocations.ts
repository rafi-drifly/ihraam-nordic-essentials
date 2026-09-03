/**
 * Free mosque collection points.
 *
 * `address` and `hours` are optional: when they are filled in they are shown in
 * the cart before the customer commits, which is the whole point of this file.
 * Until then the cart falls back to telling them the details arrive by email,
 * rather than inventing a place and a time nobody agreed to.
 *
 * The ids must match PICKUP_LOCATIONS in supabase/functions/create-checkout.
 */
export interface PickupLocation {
  id: "uppsala-mosque" | "stockholm-mosque";
  /** i18n key for the display name. */
  labelKey: string;
  address?: string;
  hours?: string;
}

export const PICKUP_LOCATIONS: PickupLocation[] = [
  { id: "uppsala-mosque", labelKey: "cart.delivery.uppsala" },
  { id: "stockholm-mosque", labelKey: "cart.delivery.stockholm" },
];

export function getPickupLocation(id: string): PickupLocation | undefined {
  return PICKUP_LOCATIONS.find((l) => l.id === id);
}
