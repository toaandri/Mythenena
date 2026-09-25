"use client";

import { useCallback } from "react";
import { useLang } from "@/lib/context/LangContext";

export function useTranslate() {
  const { lang } = useLang();

  const translate = useCallback(
    async (text: string, sourceLang = "fr"): Promise<string> => {
      if (!text.trim()) return text;
      if (lang === sourceLang) return text;

      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, source: sourceLang, target: lang }),
        });
        if (!res.ok) return text;
        const data = await res.json();
        return data.translated ?? text;
      } catch {
        return text;
      }
    },
    [lang]
  );

  return { translate, lang };
}
