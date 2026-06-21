import type { BundleBuilderApi } from "../../hooks/useBundleBuilder";
import { ReviewExtraRow, ReviewItem } from "../ReviewItem/ReviewItem";
import { Button } from "../Button/Button";
import { formatPrice } from "../../utils/format";
import styles from "./ReviewPanel.module.css";

interface ReviewPanelProps {
  api: BundleBuilderApi;
}

/** Display labels for the review-panel category subheadings. */
const CATEGORY_LABEL: Record<string, string> = {
  Plan: "Home Monitoring Plan",
};

export function ReviewPanel({ api }: ReviewPanelProps) {
  const { data, groupedLines, subtotal, compareAtTotal, savings, justSaved } = api;
  const review = data.review;

  const handleCheckout = () => {
    window.alert(
      "Thanks! This is a prototype, so there's no real checkout.\n\nOrder total: " +
        formatPrice(subtotal)
    );
  };

  const handleSave = () => {
    api.save();
  };

  return (
    <aside className={styles.panel} aria-label={review.title}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <h2 className={styles.title}>{review.title}</h2>
          <p className={styles.subtitle}>{review.subtitle}</p>
        </header>

        <div className={styles.layout}>
          {/* Line items */}
          <div className={styles.items}>
            {groupedLines.map((group) => (
              <section key={group.category} className={styles.group}>
                <h3 className={styles.groupTitle}>
                  {CATEGORY_LABEL[group.category] ?? group.category}
                </h3>
                {group.lines.map((line) => (
                  <ReviewItem key={line.lineKey} line={line} api={api} />
                ))}
              </section>
            ))}

            <div className={styles.divider} />

            <ReviewExtraRow
              icon={
                <img src="/assets/fast-shipping.png" alt="" aria-hidden="true" />
              }
              label={review.shipping.label}
              value={review.shipping.free ? "FREE" : formatPrice(review.shipping.price)}
              compareAt={review.shipping.free ? review.shipping.price : undefined}
              free={review.shipping.free}
            />
          </div>

          {/* Summary / checkout */}
          <div className={styles.summary}>
            <div className={styles.guarantee}>
              <img
                src={review.guaranteeBadge}
                alt="Satisfaction guarantee"
                className={styles.badge}
              />
              <div>
                <p className={styles.guaranteeTitle}>{review.guaranteeTitle}</p>
                <p className={styles.guaranteeText}>{review.guaranteeText}</p>
              </div>
            </div>

            <div className={styles.totals}>
              <span className={styles.financing}>{review.financingNote}</span>
              <div className={styles.totalRow}>
                {compareAtTotal > subtotal && (
                  <span className={styles.totalCompare}>
                    {formatPrice(compareAtTotal)}
                  </span>
                )}
                <span className={styles.totalNow}>{formatPrice(subtotal)}</span>
              </div>
            </div>

            {savings > 0 && (
              <p className={styles.savings}>
                Congrats! You&apos;re saving {formatPrice(savings)} on your security bundle!
              </p>
            )}

            <Button variant="primary" fullWidth onClick={handleCheckout}>
              {review.checkoutLabel}
            </Button>

            <button type="button" className={styles.saveLink} onClick={handleSave}>
              {justSaved ? "Saved ✓" : review.saveLabel}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
