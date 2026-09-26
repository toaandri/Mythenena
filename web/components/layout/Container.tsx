import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const widths = {
  full: "max-w-none",
  wide: "max-w-6xl",
  default: "max-w-shell",
  narrow: "max-w-3xl",
} as const;

export function Container({
  children,
  size = "default",
  className,
}: {
  children: ReactNode;
  size?: keyof typeof widths;
  className?: string;
}) {
  return <div className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", widths[size], className)}>{children}</div>;
}

/** Bloc de section pleine largeur, avec largeur de contenu gérée par le parent. */
export function Section({
  children,
  className,
  id,
  tone = "default",
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  tone?: "default" | "raised" | "brand";
}) {
  const tones = {
    default: "",
    raised: "border-y border-line bg-surface",
    brand: "border-y border-line bg-brand-softer",
  } as const;

  return (
    <section id={id} className={cn("py-16 sm:py-20 lg:py-24", tones[tone], className)}>
      {children}
    </section>
  );
}

/** Contenu de page standard, avec espacement vertical cohérent. */
export function PageBody({
  children,
  size = "default",
  className,
}: {
  children: ReactNode;
  size?: keyof typeof widths;
  className?: string;
}) {
  return (
    <Container size={size} className={cn("animate-fade-rise py-10 sm:py-14", className)}>
      {children}
    </Container>
  );
}
