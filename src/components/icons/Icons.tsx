import { useState } from "react";
import type { StepIconId } from "../../types/bundle";

interface IconProps {
  size?: number;
  className?: string;
}

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function ChevronDown({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...stroke}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function ChevronUp({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...stroke}>
      <polyline points="6 15 12 9 18 15" />
    </svg>
  );
}

export function PlusIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...stroke}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function MinusIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...stroke}>
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function CameraIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...stroke}>
      <rect x="4" y="6" width="16" height="13" rx="3" />
      <circle cx="12" cy="11.5" r="3.1" />
      <circle cx="12" cy="11.5" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="16.4" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PlanIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...stroke}>
      <path d="M12 3l7 3v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6z" />
    </svg>
  );
}

export function SensorIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...stroke}>
      <circle cx="12" cy="12" r="2.2" />
      <path d="M7.5 7.5a6.5 6.5 0 0 0 0 9M16.5 7.5a6.5 6.5 0 0 1 0 9M5 5a10 10 0 0 0 0 14M19 5a10 10 0 0 1 0 14" />
    </svg>
  );
}

export function ShieldIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...stroke}>
      <path d="M12 3l7 3v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6z" />
      <path d="M12 8v5M9.5 10.5h5" />
    </svg>
  );
}

export function GridIcon({ size = 20, className }: IconProps) {
  const cells: JSX.Element[] = [];
  for (const y of [4, 10, 16]) {
    for (const x of [4, 10, 16]) {
      cells.push(<rect key={x + "-" + y} x={x} y={y} width="4" height="4" rx="1.2" />);
    }
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...stroke}>
      {cells}
    </svg>
  );
}

const STEP_ICONS: Record<StepIconId, (props: IconProps) => JSX.Element> = {
  camera: CameraIcon,
  plan: PlanIcon,
  sensor: SensorIcon,
  shield: ShieldIcon,
  grid: GridIcon,
};

/**
 * Renders the design-provided icon file from /assets/icons/<icon>.png when it
 * exists; otherwise falls back to the matching inline SVG. Drop a file named
 * camera.png / plan.png / sensor.png / grid.png into public/assets/icons to
 * override the SVG for that step.
 */
export function StepIcon({ icon, size = 22, className }: { icon: StepIconId } & IconProps) {
  const [useSvg, setUseSvg] = useState(false);
  const Cmp = STEP_ICONS[icon] ?? CameraIcon;
  if (useSvg) return <Cmp size={size} className={className} />;
  return (
    <img
      src={`/assets/icons/${icon}.png`}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      className={className}
      onError={() => setUseSvg(true)}
      style={{ objectFit: "contain", display: "block" }}
    />
  );
}
