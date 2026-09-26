"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function Progress({
  value,
  steps,
  className,
  label,
}: {
  /** 0 → steps-1 */
  value: number;
  steps: number;
  className?: string;
  label?: string;
}) {
  const pct = steps > 1 ? (value / (steps - 1)) * 100 : 100;
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setWidth(pct));
    return () => cancelAnimationFrame(id);
  }, [pct]);

  return (
    <div className={cn("w-full", className)}>
      <div
        className="relative h-1.5 w-full overflow-hidden rounded-full bg-surface-3"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={steps}
        aria-valuenow={value + 1}
        aria-label={label}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-brand transition-[width] duration-500 ease-out"
          style={{ width: `${width}%` }}
        />
      </div>

      <div className="mt-2.5 flex justify-between px-0.5" aria-hidden>
        {Array.from({ length: steps }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 w-1.5 rounded-full transition-all duration-300",
              i <= value ? "bg-brand" : "bg-line-strong",
              i === value && "scale-125"
            )}
          />
        ))}
      </div>
    </div>
  );
}
