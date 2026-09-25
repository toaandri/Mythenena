import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  align?: "left" | "center";
  className?: string;
};

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  align = "left",
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-5",
        align === "center" ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className={cn("max-w-prose", align === "center" && "mx-auto")}>
        {eyebrow && <div className="mb-3">{eyebrow}</div>}
        <h1 className="text-h1 text-ink">{title}</h1>
        {subtitle && <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div>}
    </header>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line-strong bg-surface-2/60 px-6 py-16 text-center">
      {icon && (
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-3 text-ink-subtle">
          {icon}
        </span>
      )}
      <p className="text-[0.9375rem] font-semibold text-ink">{title}</p>
      {description && <p className="max-w-sm text-sm leading-relaxed text-ink-muted">{description}</p>}
      {action && <div className="mt-1.5">{action}</div>}
    </div>
  );
}
