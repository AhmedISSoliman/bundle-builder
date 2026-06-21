import { MinusIcon, PlusIcon } from "../icons/Icons";
import styles from "./QuantityStepper.module.css";

interface QuantityStepperProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  /** Disables the minus button (e.g. required item at its minimum). */
  minusDisabled?: boolean;
  /** Disables the plus button. */
  plusDisabled?: boolean;
  size?: "sm" | "md";
  /** Accessible label describing what is being adjusted. */
  ariaLabel?: string;
}

/**
 * Reusable +/- stepper. Used in both product cards and review-panel lines so
 * the two stay in perfect sync (they edit the same underlying quantity).
 */
export function QuantityStepper({
  quantity,
  onIncrement,
  onDecrement,
  minusDisabled = false,
  plusDisabled = false,
  size = "md",
  ariaLabel = "quantity",
}: QuantityStepperProps) {
  const disableMinus = minusDisabled || quantity <= 0;

  return (
    <div className={`${styles.stepper} ${styles[size]}`} role="group" aria-label={ariaLabel}>
      <button
        type="button"
        className={styles.btn}
        onClick={onDecrement}
        disabled={disableMinus}
        aria-label="Decrease quantity"
      >
        <MinusIcon size={size === "sm" ? 13 : 15} />
      </button>
      <span className={styles.value} aria-live="polite">
        {quantity}
      </span>
      <button
        type="button"
        className={styles.btn}
        onClick={onIncrement}
        disabled={plusDisabled}
        aria-label="Increase quantity"
      >
        <PlusIcon size={size === "sm" ? 13 : 15} />
      </button>
    </div>
  );
}
