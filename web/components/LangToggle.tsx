"use client";

import { useLang, type Lang } from "@/lib/context/LangContext";

const LANGS: Lang[] = ["fr", "mg", "en"];

export function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div style={{ display: "flex", alignItems: "center", background: "var(--primary-light)", border: "1.5px solid var(--primary-mid)", borderRadius: 999, padding: ".3rem .2rem", gap: ".15rem" }}>
      {LANGS.map(l => (
        <button key={l} onClick={() => setLang(l)} style={{
          padding: ".25rem .6rem", borderRadius: 999, border: "none",
          fontSize: ".72rem", fontWeight: 700, letterSpacing: ".03em", cursor: "pointer",
          background: lang === l ? "var(--primary)" : "transparent",
          color: lang === l ? "#fff" : "var(--text-muted)",
          transition: "all .2s",
        }}>{l.toUpperCase()}</button>
      ))}
    </div>
  );
}
