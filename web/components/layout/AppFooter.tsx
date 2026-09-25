"use client";

import Link from "next/link";
import { HeartHandshake, Phone } from "lucide-react";
import { useLang } from "@/lib/context/LangContext";
import { Logo } from "@/components/Logo";

const EXPLORE = [
  { href: "/sondage", key: "evaluation" as const },
  { href: "/questionnaire", key: "synthese" as const },
  { href: "/ressources", key: "ressources" as const },
  { href: "/forum", key: "forum" as const },
];

const SUPPORT = [
  { href: "/chat", key: "chat" as const },
  { href: "/annuaire", key: "psychologues" as const },
];

const TOOLS = [
  { href: "/traducteur", key: "traducteur" as const },
  { href: "/ressources", key: "breathing" as const },
];

export function AppFooter() {
  const { t } = useLang();

  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="mx-auto max-w-shell px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
              <Logo size={34} />
              <span className="text-[0.95rem] font-bold tracking-[-0.02em] text-ink">Mythenena</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">{t.footer.tagline}</p>

            <a
              href="tel:+26120220000"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-danger/25 bg-danger-soft px-3.5 py-2 text-[0.8125rem] font-semibold text-danger transition-colors hover:brightness-95"
            >
              <Phone size={14} aria-hidden />
              {t.footer.crisis} · +261 20 22 XXX XX
            </a>
          </div>

          <FooterColumn title={t.footer.explore} items={EXPLORE.map((i) => ({ href: i.href, label: t.nav[i.key] }))} />
          <FooterColumn title={t.footer.support} items={SUPPORT.map((i) => ({ href: i.href, label: t.nav[i.key] }))} />
          <FooterColumn
            title={t.footer.tools}
            items={TOOLS.map((i) => ({
              href: i.href,
              label: i.key === "breathing" ? t.ressources.breathing : t.nav[i.key],
            }))}
          />
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-line pt-7 text-[0.8125rem] text-ink-subtle sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2 leading-relaxed">
            <HeartHandshake size={15} className="mt-0.5 shrink-0 text-brand" aria-hidden />
            <span>{t.footer.disclaimer}</span>
          </p>
          <p className="shrink-0">
            © {new Date().getFullYear()} Mythenena · {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, items }: { title: string; items: { href: string; label: string }[] }) {
  return (
    <nav aria-label={title}>
      <h2 className="text-tiny font-bold uppercase tracking-[0.08em] text-ink-subtle">{title}</h2>
      <ul className="mt-4 flex flex-col gap-2.5">
        {items.map((item) => (
          <li key={`${item.href}-${item.label}`}>
            <Link
              href={item.href}
              className="text-sm text-ink-muted transition-colors duration-200 hover:text-brand"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
