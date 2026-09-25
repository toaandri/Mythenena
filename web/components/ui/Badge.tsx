import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "brand" | "accent" | "success" | "warning" | "danger" | "neutral";

const tones: Record<Tone, string> = {
  brand: "bg-brand-soft text-brand border-brand-line",
  accent: "bg-accent-soft text-accent border-accent/25",
  success: "bg-success-soft text-success border-success/25",
  warning: "bg-warning-soft text-warning border-warning/25",
  danger: "bg-danger-soft text-danger border-danger/25",
  neutral: "bg-surface-3 text-ink-muted border-line",
};

export function Badge({
  children,
  tone = "brand",
  className,
  icon,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5",
        "text-tiny font-semibold uppercase tracking-[0.04em]",
        tones[tone],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}

export function Dot({ tone = "success", pulse }: { tone?: Tone; pulse?: boolean }) {
  const dotTones: Record<Tone, string> = {
    brand: "bg-brand",
    accent: "bg-accent",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    neutral: "bg-ink-subtle",
  };
  return (
    <span className="relative flex h-2 w-2">
      {pulse && (
        <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-60", dotTones[tone])} />
      )}
      <span className={cn("relative inline-flex h-2 w-2 rounded-full", dotTones[tone])} />
    </span>
  );
}
