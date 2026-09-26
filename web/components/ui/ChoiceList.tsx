"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = { label: string; description?: string };

type ChoiceListProps = {
  options: Option[];
  selected: number[];
  onToggle: (index: number) => void;
  multiple?: boolean;
  className?: string;
};

export function ChoiceList({ options, selected, onToggle, multiple = false, className }: ChoiceListProps) {
  return (
    <div role={multiple ? "group" : "radiogroup"} className={cn("flex flex-col gap-2.5", className)}>
      {options.map((option, i) => {
        const isSelected = selected.includes(i);
        return (
          <button
            key={i}
            type="button"
            role={multiple ? "checkbox" : "radio"}
            aria-checked={isSelected}
            onClick={() => onToggle(i)}
            className={cn(
              "group flex w-full items-center gap-3.5 rounded-xl border p-3.5 text-left",
              "transition-all duration-200 ease-out active:scale-[.995]",
              isSelected
                ? "border-brand bg-brand-softer shadow-xs"
                : "border-line bg-surface hover:border-brand-line hover:bg-brand-softer/60"
            )}
          >
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center border-2 transition-all duration-200",
                multiple ? "rounded-md" : "rounded-full",
                isSelected
                  ? "border-brand bg-brand text-brand-on"
                  : "border-line-strong group-hover:border-brand-line"
              )}
            >
              {isSelected &&
                (multiple ? (
                  <Check size={12} strokeWidth={3.5} />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-on" />
                ))}
            </span>

            <span className="min-w-0 flex-1">
              <span
                className={cn(
                  "block text-sm transition-colors duration-200",
                  isSelected ? "font-semibold text-ink" : "text-ink-muted group-hover:text-ink"
                )}
              >
                {option.label}
              </span>
              {option.description && (
                <span className="mt-0.5 block text-[0.8rem] text-ink-subtle">{option.description}</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
