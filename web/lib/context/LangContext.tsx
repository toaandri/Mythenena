"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import fr from "@/locales/fr.json";
import mg from "@/locales/mg.json";
import en from "@/locales/en.json";

export type Lang = "fr" | "mg" | "en";
export type Translations = typeof fr;

const translations: Record<Lang, Translations> = { fr, mg, en };
const LANGS: Lang[] = ["fr", "mg", "en"];
const STORAGE_KEY = "mythenena.lang";

interface LangContextType {
  lang: Lang;
  t: Translations;
  setLang: (l: Lang) => void;
  toggle: () => void;
}

const LangContext = createContext<LangContextType>({
  lang: "fr",
  t: fr,
  setLang: () => {},
  toggle: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (stored && LANGS.includes(stored)) setLangState(stored);
  }, []);

  const setLang = (l: Lang) => {
    window.localStorage.setItem(STORAGE_KEY, l);
    document.documentElement.lang = l;
    setLangState(l);
  };

  const toggle = () => setLangState((l) => {
    const next = LANGS[(LANGS.indexOf(l) + 1) % LANGS.length];
    window.localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next;
    return next;
  });

  return (
    <LangContext.Provider value={{ lang, t: translations[lang], setLang, toggle }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
