"use client";

import { forwardRef, useId, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const fieldBase =
  "w-full rounded-xl border border-line bg-surface px-4 text-sm text-ink placeholder:text-ink-subtle " +
  "shadow-xs transition-[border-color,box-shadow,background-color] duration-200 " +
  "hover:border-line-strong focus:border-brand focus:shadow-focus-brand focus:outline-none " +
  "disabled:cursor-not-allowed disabled:bg-surface-2 disabled:opacity-60";

type FieldWrapProps = {
  label?: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
};

export function Field({ label, hint, error, htmlFor, className, children }: FieldWrapProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={htmlFor} className="text-[0.8125rem] font-semibold text-ink">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-[0.78rem] font-medium text-danger">{error}</p>
      ) : hint ? (
        <p className="text-[0.78rem] text-ink-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(fieldBase, "h-11", className)} {...props} />;
  }
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea ref={ref} className={cn(fieldBase, "min-h-24 resize-y py-3 leading-relaxed", className)} {...props} />
    );
  }
);

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode };

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, children, ...props },
  ref
) {
  return (
    <div className={cn("relative w-full", className)}>
      <select
        ref={ref}
        className={cn(fieldBase, "h-11 cursor-pointer appearance-none pr-10")}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-subtle"
        aria-hidden
      />
    </div>
  );
});

export function Checkbox({
  label,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: React.ReactNode }) {
  const id = useId();
  return (
    <label
      htmlFor={props.id ?? id}
      className={cn("inline-flex cursor-pointer items-center gap-2.5 text-sm text-ink select-none", className)}
    >
      <input
        id={props.id ?? id}
        type="checkbox"
        className="h-4 w-4 shrink-0 cursor-pointer rounded border-line-strong accent-[rgb(var(--brand))] transition-transform duration-150 active:scale-90"
        {...props}
      />
      {label}
    </label>
  );
}
