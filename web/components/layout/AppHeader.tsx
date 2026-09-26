"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Languages, Moon, Sun } from "lucide-react";
import { useLang, type Lang } from "@/lib/context/LangContext";
import { useTheme } from "@/lib/context/ThemeContext";
import { cn } from "@/lib/utils";
import { Logo, Wordmark } from "@/components/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { OffersButton } from "@/components/OffersButton";

const NAV = [
  { href: "/forum",     key: "forum"       as const },
  { href: "/chat",      key: "chat"        as const },
  { href: "/ressources", key: "ressources" as const },
  { href: "/messages",  key: "messages"    as const },
];

const LANGS: { code: Lang; label: string }[] = [
  { code: "fr", label: "Français" },
  { code: "mg", label: "Malagasy" },
  { code: "en", label: "English" },
];

export function AppHeader() {
  const { t, lang, setLang } = useLang();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300",
        scrolled || open
          ? "border-b border-line bg-surface/85 shadow-sm backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-shell items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 rounded-lg"
          aria-label="Mythenena — accueil"
        >
          <Logo size={34} />
          <Wordmark className="text-[0.95rem]" />
        </Link>

        <nav aria-label="Navigation principale" className="ml-6 hidden flex-1 items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-full px-3.5 py-2 text-[0.875rem] font-medium transition-colors duration-200",
                  active ? "text-brand" : "text-ink-muted hover:text-ink"
                )}
              >
                {t.nav[item.key]}
                {active && (
                  <span className="absolute inset-x-3.5 -bottom-px h-0.5 rounded-full bg-brand" aria-hidden />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <LangSwitcher />
          <ThemeToggle theme={theme} onToggle={toggleTheme} />

          <ButtonLink href="/chat" size="sm" className="ml-1.5 hidden sm:inline-flex">
              {t.nav.chat}
            </ButtonLink>

          <OffersButton />

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            className="ml-1 inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-3 hover:text-ink lg:hidden"
          >
            {open ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      <div
        id="menu-mobile"
        hidden={!open}
        className="animate-fade-in border-t border-line bg-surface/95 backdrop-blur-xl lg:hidden"
      >
        <nav aria-label="Navigation mobile" className="mx-auto flex max-w-shell flex-col gap-1 px-4 py-4">
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center justify-between rounded-xl px-4 py-3 text-[0.9375rem] font-medium transition-colors",
                  active ? "bg-brand-softer text-brand" : "text-ink-muted hover:bg-surface-2 hover:text-ink"
                )}
              >
                {t.nav[item.key]}
                {active && <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />}
              </Link>
            );
          })}

          <div className="mt-3 border-t border-line pt-4 sm:hidden">
            <ButtonLink href="/chat" className="w-full">
              {t.nav.chat}
            </ButtonLink>
          </div>
        </nav>
      </div>
    </header>
  );
}

function LangSwitcher() {
  const { t, lang, setLang } = useLang();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = () => setOpen(false);
    document.addEventListener("keydown", onKey);
    window.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
    };
  }, [open]);

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t.common.language}
        className="inline-flex h-10 items-center gap-1.5 rounded-full px-2.5 text-ink-muted transition-colors hover:bg-surface-3 hover:text-ink"
      >
        <Languages size={17} />
        <span className="text-tiny font-bold uppercase tracking-[0.06em]">{lang}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-1.5 w-40 animate-scale-in overflow-hidden rounded-xl border border-line bg-surface p-1 shadow-lg"
        >
          {LANGS.map((l) => (
            <button
              key={l.code}
              role="menuitemradio"
              aria-checked={lang === l.code}
              onClick={() => {
                setLang(l.code);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[0.8125rem] transition-colors",
                lang === l.code ? "bg-brand-softer font-semibold text-brand" : "text-ink-muted hover:bg-surface-2 hover:text-ink"
              )}
            >
              {l.label}
              {lang === l.code && <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ThemeToggle({ theme, onToggle }: { theme: string; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={theme === "dark" ? "Passer en thème clair" : "Passer en thème sombre"}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-3 hover:text-ink"
    >
      {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
