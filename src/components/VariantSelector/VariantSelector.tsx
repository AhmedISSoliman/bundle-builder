import type { Variant } from "../../types/bundle";
import styles from "./VariantSelector.module.css";

interface VariantSelectorProps {
  variants: Variant[];
  activeVariantId: string;
  onSelect: (variantId: string) => void;
}

/**
 * Row of color chips. Selecting a chip makes it the active variant; the card's
 * stepper then binds to that variant's independent quantity.
 */
export function VariantSelector({
  variants,
  activeVariantId,
  onSelect,
}: VariantSelectorProps) {
  return (
    <div className={styles.row} role="radiogroup" aria-label="Choose a color">
      {variants.map((variant) => {
        const isActive = variant.id === activeVariantId;
        const chipSrc = variant.chipImage ?? variant.image;
        return (
          <button
            type="button"
            key={variant.id}
            role="radio"
            aria-checked={isActive}
            className={`${styles.chip} ${isActive ? styles.active : ""}`}
            onClick={() => onSelect(variant.id)}
            title={variant.label}
          >
            {chipSrc ? (
              <img
                className={styles.thumb}
                src={chipSrc}
                alt=""
                aria-hidden="true"
              />
            ) : (
              <span
                className={styles.swatch}
                style={{ background: variant.swatch }}
                aria-hidden="true"
              />
            )}
            <span className={styles.label}>{variant.label}</span>
          </button>
        );
      })}
    </div>
  );
}
