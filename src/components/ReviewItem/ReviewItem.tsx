import type { SelectedLine } from "../../types/bundle";
import type { BundleBuilderApi } from "../../hooks/useBundleBuilder";
import { QuantityStepper } from "../QuantityStepper/QuantityStepper";
import { formatPrice, formatPriceMaybeMonthly } from "../../utils/format";
import styles from "./ReviewItem.module.css";

interface ReviewItemProps {
  line: SelectedLine;
  api: BundleBuilderApi;
}

export function ReviewItem({ line, api }: ReviewItemProps) {
  const { product, variant, quantity } = line;
  const image = variant?.image ?? product.image;
  const isFree = product.price === 0;
  const showCompareAt = product.compareAtPrice != null;
  const minusDisabled = product.required && quantity <= (product.minQuantity ?? 1);

  return (
    <div className={styles.item}>
      <div className={styles.thumb}>
        <img src={image} alt={product.title} loading="lazy" />
      </div>

      <div className={styles.info}>
        <span className={styles.name}>{product.title}</span>
        {variant && <span className={styles.variant}>{variant.label}</span>}
      </div>

      <div className={styles.controls}>
        <QuantityStepper
          size="sm"
          quantity={quantity}
          onIncrement={() => api.adjustQuantity(product, variant?.id, 1)}
          onDecrement={() => api.adjustQuantity(product, variant?.id, -1)}
          minusDisabled={minusDisabled}
          ariaLabel={`Quantity for ${product.title}${variant ? ` ${variant.label}` : ""}`}
        />

        <div className={styles.pricing}>
          {showCompareAt && (
            <span className={styles.compareAt}>
              {formatPriceMaybeMonthly(line.lineCompareAtTotal, product.perMonth)}
            </span>
          )}
          <span className={`${styles.price} ${isFree ? styles.free : ""}`}>
            {isFree
              ? "FREE"
              : formatPriceMaybeMonthly(line.lineTotal, product.perMonth)}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Lightweight static row (shipping, etc.) styled like a review line. */
export function ReviewExtraRow({
  icon,
  label,
  value,
  compareAt,
  free,
}: {
  icon?: React.ReactNode;
  label: React.ReactNode;
  value: string;
  compareAt?: number;
  free?: boolean;
}) {
  return (
    <div className={`${styles.item} ${styles.itemStatic}`}>
      {icon && <div className={styles.thumbIcon}>{icon}</div>}
      <div className={styles.info}>
        <span className={styles.name}>{label}</span>
      </div>
      <div className={styles.controls}>
        <div className={styles.pricing}>
          {compareAt != null && (
            <span className={styles.compareAt}>{formatPrice(compareAt)}</span>
          )}
          <span className={`${styles.price} ${free ? styles.free : ""}`}>{value}</span>
        </div>
      </div>
    </div>
  );
}
