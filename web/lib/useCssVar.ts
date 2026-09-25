"use client";

import { useEffect, useState } from "react";

/**
 * Lit une variable CSS du thème (format "R G B") et la renvoie en `rgb(...)`.
 * Nécessaire pour les librairies qui injectent des couleurs en attributs SVG
 * (recharts, etc.), où `var(--token)` ne peut pas être résolu.
 */
export function useCssVar(name: string, fallback = "rgb(0 0 0)") {
  const [value, setValue] = useState(fallback);

  useEffect(() => {
    const read = () => {
      const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      setValue(raw ? `rgb(${raw})` : fallback);
    };

    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [name, fallback]);

  return value;
}
