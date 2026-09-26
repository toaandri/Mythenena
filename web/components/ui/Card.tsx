import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-line bg-surface shadow-sm",
        "transition-[box-shadow,border-color,transform] duration-300 ease-out",
        className
      )}
      {...props}
    />
  );
}

type FeatureCardProps = {
  icon: ReactNode;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  tone?: "brand" | "accent" | "neutral";
  interactive?: boolean;
};

const toneMap = {
  brand: "bg-brand-soft text-brand",
  accent: "bg-accent-soft text-accent",
  neutral: "bg-surface-3 text-ink-muted",
} as const;

export function FeatureCard({
  icon,
  title,
  description,
  children,
  className,
  tone = "brand",
  interactive = true,
}: FeatureCardProps) {
  return (
    <Card
      className={cn(
        "group flex flex-col gap-4 p-6",
        interactive &&
          "hover:-translate-y-1 hover:border-brand-line hover:shadow-lg focus-within:border-brand-line",
        className
      )}
    >
      <span
        className={cn(
          "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 ease-out group-hover:scale-105",
          toneMap[tone]
        )}
      >
        {icon}
      </span>
      <div className="flex flex-1 flex-col gap-1.5">
        <h3 className="text-h3 text-ink">{title}</h3>
        {description && <p className="text-sm leading-relaxed text-ink-muted">{description}</p>}
      </div>
      {children}
    </Card>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <h2 className="text-h3 text-ink">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
