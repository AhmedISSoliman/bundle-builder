import type { Product } from "../../types/bundle";
import type { BundleBuilderApi } from "../../hooks/useBundleBuilder";
import { formatPrice, formatPriceMaybeMonthly } from "../../utils/format";
import { getDiscountPercent } from "../../utils/pricing";
import { QuantityStepper } from "../QuantityStepper/QuantityStepper";
import { VariantSelector } from "../VariantSelector/VariantSelector";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: Product;
  api: BundleBuilderApi;
}

export function ProductCard({ product, api }: ProductCardProps) {
  const hasVariants = !!product.variants && product.variants.length > 0;
  const activeVariantId = api.getActiveVariantId(product);
  const quantity = api.getCardQuantity(product);
  // Highlight follows the quantity currently shown on the card (active variant),
  // so the border matches the visible stepper value.
  const selected = quantity > 0;

  const activeVariant = hasVariants
    ? product.variants!.find((v) => v.id === activeVariantId)
    : undefined;
  // The main image is the currently selected colour's image (falls back to the
  // product's default image when a variant has none).
  const image = activeVariant?.image ?? product.image;

  const minusDisabled = product.required && quantity <= (product.minQuantity ?? 1);
  const discountPercent = getDiscountPercent(product.price, product.compareAtPrice);

  return (
    <article
      className={`${styles.card} ${selected ? styles.selected : ""}`}
      aria-label={product.title}
    >
      {discountPercent != null && (
        <span className={styles.badge}>Save {discountPercent}%</span>
      )}

      <div className={styles.top}>
        <div className={styles.media}>
          <img src={image} alt={product.title} className={styles.image} loading="lazy" />
        </div>

        <div className={styles.info}>
          <h3 className={styles.title}>{product.title}</h3>
          {product.description && (
            <p className={styles.description}>
              {product.description}{" "}
              {product.learnMoreUrl && (
                <a className={styles.learnMore} href={product.learnMoreUrl}>
                  Learn More
                </a>
              )}
            </p>
          )}

          {hasVariants && (
            <VariantSelector
              variants={product.variants!}
              activeVariantId={activeVariantId!}
              onSelect={(variantId) => api.setActiveVariant(product.id, variantId)}
            />
          )}
        </div>
      </div>

      <div className={styles.footer}>
        <QuantityStepper
          quantity={quantity}
          onIncrement={() => api.adjustActiveQuantity(product, 1)}
          onDecrement={() => api.adjustActiveQuantity(product, -1)}
          minusDisabled={minusDisabled}
          ariaLabel={`Quantity for ${product.title}`}
        />

        <div className={styles.pricing}>
          {product.compareAtPrice != null && (
            <span className={styles.compareAt}>
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
          <span className={styles.price}>
            {product.price === 0
              ? "FREE"
              : formatPriceMaybeMonthly(product.price, product.perMonth)}
          </span>
        </div>
      </div>
    </article>
  );
}
