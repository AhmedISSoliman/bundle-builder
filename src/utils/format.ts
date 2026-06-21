/** Currency + label formatting helpers. */

export function formatPrice(value: number): string {
  return `$${value.toFixed(2)}`;
}

/** Formats a price with an optional "/mo" suffix for subscription items. */
export function formatPriceMaybeMonthly(value: number, perMonth?: boolean): string {
  return `${formatPrice(value)}${perMonth ? "/mo" : ""}`;
}
