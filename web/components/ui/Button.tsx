"use client";

import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "soft" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap " +
  "rounded-full font-semibold tracking-[-0.01em] transition-all duration-200 ease-out " +
  "disabled:pointer-events-none disabled:opacity-45 active:scale-[.985]";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand text-brand-on shadow-brand hover:bg-brand-hover hover:shadow-lg " +
    "focus-visible:shadow-focus-brand",
  outline:
    "border border-line-strong bg-surface text-ink hover:border-brand hover:bg-brand-softer hover:text-brand",
  ghost: "text-ink-muted hover:bg-surface-3 hover:text-ink",
  soft: "bg-brand-soft text-brand hover:bg-brand-line",
  danger: "bg-danger text-white shadow-sm hover:brightness-95",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[0.8125rem]",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-[0.9375rem]",
};

function useClasses(variant: Variant, size: Size, className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, className, children, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={useClasses(variant, size, className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" aria-hidden />}
      {children}
    </button>
  );
});

type ButtonLinkProps = {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
  onClick?: () => void;
};

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link href={href} className={useClasses(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}
