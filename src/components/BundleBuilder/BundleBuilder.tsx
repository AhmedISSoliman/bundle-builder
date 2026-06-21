import type { BundleBuilderApi } from "../../hooks/useBundleBuilder";
import { AccordionStep } from "../Accordion/AccordionStep";
import styles from "./BundleBuilder.module.css";

interface BundleBuilderProps {
  api: BundleBuilderApi;
}

/** Left column: the 4-step accordion that walks the shopper through the build. */
export function BundleBuilder({ api }: BundleBuilderProps) {
  const { steps } = api.data;

  return (
    <div className={styles.builder}>
      {steps.map((step) => (
        <AccordionStep
          key={step.id}
          step={step}
          totalSteps={steps.length}
          api={api}
          isOpen={api.activeStepId === step.id}
          onToggle={() => api.toggleStep(step.id)}
          onNext={() => api.goToNextStep(step.id)}
        />
      ))}
    </div>
  );
}
