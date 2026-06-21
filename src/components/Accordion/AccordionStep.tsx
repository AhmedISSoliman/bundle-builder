import type { Step } from "../../types/bundle";
import type { BundleBuilderApi } from "../../hooks/useBundleBuilder";
import { ProductCard } from "../ProductCard/ProductCard";
import { Button } from "../Button/Button";
import { ChevronDown, ChevronUp, StepIcon } from "../icons/Icons";
import styles from "./AccordionStep.module.css";

interface AccordionStepProps {
  step: Step;
  totalSteps: number;
  api: BundleBuilderApi;
  isOpen: boolean;
  onToggle: () => void;
  onNext: () => void;
}

export function AccordionStep({
  step,
  totalSteps,
  api,
  isOpen,
  onToggle,
  onNext,
}: AccordionStepProps) {
  const selectedCount = api.selectedCountByStep(step.id);
  const products = step.productIds
    .map((id) => api.data.products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const panelId = `step-panel-${step.id}`;
  const headerId = `step-header-${step.id}`;

  return (
    <section className={isOpen ? styles.open : undefined}>
      <h2 className={styles.headerHeading}>
        <button
          id={headerId}
          type="button"
          className={styles.header}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span className={styles.stepIndex}>
            STEP {step.stepNumber} OF {totalSteps}
          </span>

          <span className={styles.headerMain}>
            <span className={styles.icon}>
              <StepIcon icon={step.icon} size={22} />
            </span>
            <span className={styles.title}>{step.title}</span>

            <span className={styles.state}>
              {isOpen ? (
                <>
                  {selectedCount > 0 && (
                    <span className={styles.count}>{selectedCount} selected</span>
                  )}
                  <ChevronUp className={styles.chevron} />
                </>
              ) : (
                <>
                  {selectedCount > 0 && (
                    <span className={styles.countMuted}>{selectedCount} selected</span>
                  )}
                  <ChevronDown className={styles.chevron} />
                </>
              )}
            </span>
          </span>
        </button>
      </h2>

      {isOpen && (
        <div id={panelId} role="region" aria-labelledby={headerId} className={styles.panel}>
          <div className={styles.grid}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} api={api} />
            ))}
          </div>

          {step.nextLabel && (
            <div className={styles.nextRow}>
              <Button variant="primary" onClick={onNext}>
                {step.nextLabel}
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
