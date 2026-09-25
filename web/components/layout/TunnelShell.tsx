"use client";

import type { ReactNode } from "react";
import { useLang } from "@/lib/context/LangContext";
import { Container } from "@/components/layout/Container";
import { Progress } from "@/components/ui/Progress";
import { cn } from "@/lib/utils";

type TunnelShellProps = {
  step: number;
  total: number;
  title: string;
  subtitle?: string;
  eyebrow?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  footnote?: ReactNode;
};

export function TunnelShell({
  step,
  total,
  title,
  subtitle,
  eyebrow,
  children,
  actions,
  footnote,
}: TunnelShellProps) {
  return (
    <>
      <div className="sticky top-16 z-40 border-b border-line bg-surface/85 backdrop-blur-xl">
        <Container size="narrow" className="py-3">
          <Progress value={step} steps={total} label={title} />
        </Container>
      </div>

      <Container size="narrow" className="flex-1 py-10 sm:py-14">
        <div className="flex flex-col gap-8 sm:gap-10">
          <header className="flex flex-col items-center gap-3 text-center">
            {eyebrow}
            <h1 className="max-w-xl text-h2 text-ink">{title}</h1>
            {subtitle && <p className="max-w-lg text-sm leading-relaxed text-ink-muted">{subtitle}</p>}
          </header>

          {children}

          {actions && <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">{actions}</div>}

          {footnote && <div className="text-center text-[0.8125rem] text-ink-muted">{footnote}</div>}
        </div>
      </Container>
    </>
  );
}

/** Pastille « Question 2 sur 5 » réutilisée par les deux tunnels. */
export function StepBadge({ step, total, text }: { step: number; total: number; text?: string }) {
  const { t } = useLang();
  const label =
    text ??
    t.sondage.stepOf.replace("{current}", String(step + 1)).replace("{total}", String(total));

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-brand-line bg-brand-soft",
        "px-3.5 py-1.5 text-tiny font-bold uppercase tracking-[0.05em] text-brand"
      )}
    >
      <span
        className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[0.65rem] text-brand-on"
        aria-hidden
      >
        {step + 1}
      </span>
      {label}
    </span>
  );
}
