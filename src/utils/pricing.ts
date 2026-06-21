/**
 * Pure pricing / selection utilities.
 *
 * All money math lives here (never in JSX) so totals stay consistent and
 * testable. Quantities are keyed by a "line key":
 *   - products with variants:    `${productId}:${variantId}`
 *   - products without variants:  `${productId}`
 */

import type {
  BundleData,
  Product,
  SelectedLine,
  Variant,
  CategoryId,
} from "../types/bundle";

/** Builds the canonical line key for a product (+ optional variant). */
export function lineKeyFor(productId: string, variantId?: string): string {
  return variantId ? `${productId}:${variantId}` : productId;
}

/**
 * Whole-number discount percentage derived from a product's own prices, so the
 * "Save X%" badge can never disagree with the actual price reduction. Returns
 * null when there is no genuine discount.
 */
export function getDiscountPercent(price: number, compareAt?: number): number | null {
  if (compareAt == null || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

function findProduct(data: BundleData, productId: string): Product | undefined {
  return data.products.find((p) => p.id === productId);
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function calcLineTotal(unitPrice: number, quantity: number): number {
  return round(unitPrice * quantity);
}

function makeLine(
  lineKey: string,
  product: Product,
  variant: Variant | undefined,
  quantity: number
): SelectedLine {
  const unitPrice = product.price;
  const unitCompareAt = product.compareAtPrice ?? product.price;
  return {
    lineKey,
    product,
    variant,
    quantity,
    unitPrice,
    unitCompareAt,
    lineTotal: calcLineTotal(unitPrice, quantity),
    lineCompareAtTotal: calcLineTotal(unitCompareAt, quantity),
  };
}

/**
 * Derives the selected review-panel lines from raw quantities: one line per
 * product (no variants) or per variant with quantity > 0, keeping the product
 * order from the data file.
 */
export function getSelectedItems(
  data: BundleData,
  quantities: Record<string, number>
): SelectedLine[] {
  const lines: SelectedLine[] = [];

  for (const product of data.products) {
    if (product.variants && product.variants.length > 0) {
      for (const variant of product.variants) {
        const key = lineKeyFor(product.id, variant.id);
        const qty = quantities[key] ?? 0;
        if (qty > 0) lines.push(makeLine(key, product, variant, qty));
      }
    } else {
      const key = lineKeyFor(product.id);
      const qty = quantities[key] ?? 0;
      if (qty > 0) lines.push(makeLine(key, product, undefined, qty));
    }
  }

  return lines;
}

/**
 * Bundle subtotal at current prices. Matches the design's headline total,
 * which sums every selected line including the plan's first month.
 */
export function calculateSubtotal(lines: SelectedLine[]): number {
  return round(lines.reduce((sum, l) => sum + l.lineTotal, 0));
}

/** Subtotal at compare-at prices (pre-discount). */
export function calculateCompareAtTotal(lines: SelectedLine[]): number {
  return round(lines.reduce((sum, l) => sum + l.lineCompareAtTotal, 0));
}

export function calculateSavings(lines: SelectedLine[]): number {
  return round(calculateCompareAtTotal(lines) - calculateSubtotal(lines));
}

/**
 * Number of distinct selected products in a step. A product with multiple
 * selected variants counts once, matching the "N selected" indicator.
 */
export function getSelectedCountByStep(
  data: BundleData,
  stepId: string,
  quantities: Record<string, number>
): number {
  const step = data.steps.find((s) => s.id === stepId);
  if (!step) return 0;

  let count = 0;
  for (const productId of step.productIds) {
    const product = findProduct(data, productId);
    if (!product) continue;
    const selected =
      product.variants && product.variants.length > 0
        ? product.variants.some(
            (v) => (quantities[lineKeyFor(product.id, v.id)] ?? 0) > 0
          )
        : (quantities[lineKeyFor(product.id)] ?? 0) > 0;
    if (selected) count += 1;
  }
  return count;
}

/** Groups selected lines under their category, honoring a fixed order. */
export function groupByCategory(
  lines: SelectedLine[],
  order: CategoryId[]
): { category: CategoryId; lines: SelectedLine[] }[] {
  return order
    .map((category) => ({
      category,
      lines: lines.filter((l) => l.product.category === category),
    }))
    .filter((g) => g.lines.length > 0);
}
