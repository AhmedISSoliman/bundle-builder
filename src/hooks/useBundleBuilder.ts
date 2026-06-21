import { useCallback, useMemo, useState } from "react";
import rawData from "../data/bundle-products.json";
import type { BundleData, Product } from "../types/bundle";
import {
  calculateCompareAtTotal,
  calculateSavings,
  calculateSubtotal,
  getSelectedItems,
  getSelectedCountByStep,
  groupByCategory,
  lineKeyFor,
} from "../utils/pricing";
import { BundleConfig, loadConfig, saveConfig } from "../utils/bundleState";

const data = rawData as BundleData;

/** Line key for a product using its currently active variant. */
function activeLineKey(
  product: Product,
  activeVariants: Record<string, string>
): string {
  if (product.variants && product.variants.length > 0) {
    const variantId = activeVariants[product.id] ?? product.variants[0].id;
    return lineKeyFor(product.id, variantId);
  }
  return lineKeyFor(product.id);
}

export function useBundleBuilder() {
  const [config, setConfig] = useState<BundleConfig>(() => loadConfig(data));
  const [activeStepId, setActiveStepId] = useState<string>(data.steps[0].id);
  const [justSaved, setJustSaved] = useState(false);

  const { quantities, activeVariants } = config;

  /* ---------------- Accordion ---------------- */

  const toggleStep = useCallback((stepId: string) => {
    setActiveStepId((current) => (current === stepId ? "" : stepId));
  }, []);

  const goToNextStep = useCallback((currentStepId: string) => {
    const idx = data.steps.findIndex((s) => s.id === currentStepId);
    const next = data.steps[idx + 1];
    setActiveStepId(next ? next.id : currentStepId);
  }, []);

  /* ---------------- Variants ---------------- */

  const setActiveVariant = useCallback((productId: string, variantId: string) => {
    setConfig((prev) => ({
      ...prev,
      activeVariants: { ...prev.activeVariants, [productId]: variantId },
    }));
  }, []);

  const getActiveVariantId = useCallback(
    (product: Product): string | undefined => {
      if (!product.variants || product.variants.length === 0) return undefined;
      return activeVariants[product.id] ?? product.variants[0].id;
    },
    [activeVariants]
  );

  /* ---------------- Quantities ---------------- */

  const setQuantity = useCallback((lineKey: string, next: number) => {
    setConfig((prev) => {
      const value = Math.max(0, Math.round(next));
      const nextQuantities = { ...prev.quantities };
      if (value === 0) delete nextQuantities[lineKey];
      else nextQuantities[lineKey] = value;
      return { ...prev, quantities: nextQuantities };
    });
    setJustSaved(false);
  }, []);

  /** Change the quantity of a specific product + variant by a delta. */
  const adjustQuantity = useCallback(
    (product: Product, variantId: string | undefined, delta: number) => {
      const key = lineKeyFor(product.id, variantId);
      const current = quantities[key] ?? 0;
      const floor = product.required ? product.minQuantity ?? 1 : 0;
      setQuantity(key, Math.max(floor, current + delta));
    },
    [quantities, setQuantity]
  );

  /** Change the quantity of a product's currently active variant (card stepper). */
  const adjustActiveQuantity = useCallback(
    (product: Product, delta: number) => {
      adjustQuantity(product, getActiveVariantId(product), delta);
    },
    [adjustQuantity, getActiveVariantId]
  );

  /** Quantity shown on a product card = its active variant's quantity. */
  const getCardQuantity = useCallback(
    (product: Product): number =>
      quantities[activeLineKey(product, activeVariants)] ?? 0,
    [quantities, activeVariants]
  );

  /* ---------------- Derived data ---------------- */

  const selectedLines = useMemo(
    () => getSelectedItems(data, quantities),
    [quantities]
  );

  const groupedLines = useMemo(
    () => groupByCategory(selectedLines, data.review.categoryOrder),
    [selectedLines]
  );

  const subtotal = useMemo(() => calculateSubtotal(selectedLines), [selectedLines]);
  const compareAtTotal = useMemo(
    () => calculateCompareAtTotal(selectedLines),
    [selectedLines]
  );
  const savings = useMemo(() => calculateSavings(selectedLines), [selectedLines]);

  const selectedCountByStep = useCallback(
    (stepId: string) => getSelectedCountByStep(data, stepId, quantities),
    [quantities]
  );

  /* ---------------- Persistence ---------------- */

  const save = useCallback(() => {
    const ok = saveConfig(config);
    setJustSaved(ok);
    return ok;
  }, [config]);

  return {
    data,
    // accordion
    activeStepId,
    toggleStep,
    goToNextStep,
    // variants
    getActiveVariantId,
    setActiveVariant,
    // quantities
    getCardQuantity,
    adjustQuantity,
    adjustActiveQuantity,
    // derived data for the review panel
    groupedLines,
    subtotal,
    compareAtTotal,
    savings,
    selectedCountByStep,
    // persistence
    save,
    justSaved,
  };
}

export type BundleBuilderApi = ReturnType<typeof useBundleBuilder>;
