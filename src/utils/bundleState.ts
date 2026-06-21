/**
 * Bundle configuration state: the seed (initial design state) and the persisted
 * user configuration. Only the user's *configuration* (quantities + active
 * variants) is stored — product data always stays in the JSON.
 */

import type { BundleData } from "../types/bundle";

const STORAGE_KEY = "wyze-bundle-builder:v1";

export interface BundleConfig {
  /** Quantities keyed by line key (`productId` or `productId:variantId`). */
  quantities: Record<string, number>;
  /** Active (currently selected) variant per product id. */
  activeVariants: Record<string, string>;
}

/** The seed configuration straight from the data file (matches the design). */
function seedConfig(data: BundleData): BundleConfig {
  return {
    quantities: { ...data.seedQuantities },
    activeVariants: { ...data.seedActiveVariants },
  };
}

/**
 * Loads the saved configuration if the shopper previously clicked
 * "Save my system for later"; otherwise returns the seed. The seed's
 * active-variant defaults are merged in so newly added products always have a
 * sensible active variant even against an older saved payload.
 */
export function loadConfig(data: BundleData): BundleConfig {
  const seed = seedConfig(data);
  if (typeof window === "undefined") return seed;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed;
    const parsed = JSON.parse(raw) as Partial<BundleConfig>;
    return {
      quantities: { ...parsed.quantities },
      activeVariants: { ...seed.activeVariants, ...parsed.activeVariants },
    };
  } catch {
    return seed;
  }
}

export function saveConfig(config: BundleConfig): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    return true;
  } catch {
    return false;
  }
}
