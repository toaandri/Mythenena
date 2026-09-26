"use client";

import { useState } from "react";
import { ArrowLeft, Search, ChevronDown, ChevronUp, BookOpen, MessageCircle, Heart, Users, Shield, Smartphone, Headphones, LifeBuoy, ArrowRight } from "lucide-react";
import { useLang } from "@/lib/context/LangContext";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { cn } from "@/lib/utils";
import Link from "next/link";

const FAQ_CATEGORIES = [
  {
    id: "getting-started",
    name: "aide.categories.gettingStarted",
    icon: BookOpen,
    questions: [
      { q: "aide.faq.q1", a: "aide.faq.a1" },
      { q: "aide.faq.q2", a: "aide.faq.a2" },
      { q: "aide.faq.q3", a: "aide.faq.a3" },
      { q: "aide.faq.q4", a: "aide.faq.a4" },
    ],
  },
  {
    id: "evaluation",
    name: "aide.categories.evaluation",
    icon: Heart,
    questions: [
      { q: "aide.faq.q5", a: "aide.faq.a5" },
      { q: "aide.faq.q6", a: "aide.faq.a6" },
      { q: "aide.faq.q7", a: "aide.faq.a7" },
    ],
  },
  {
    id: "forum",
    name: "aide.categories.forum",
    icon: MessageCircle,
    questions: [
      { q: "aide.faq.q8", a: "aide.faq.a8" },
      { q: "aide.faq.q9", a: "aide.faq.a9" },
      { q: "aide.faq.q10", a: "aide.faq.a10" },
    ],
  },
  {
    id: "chat",
    name: "aide.categories.chat",
    icon: Smartphone,
    questions: [
      { q: "aide.faq.q11", a: "aide.faq.a11" },
      { q: "aide.faq.q12", a: "aide.faq.a12" },
      { q: "aide.faq.q13", a: "aide.faq.a13" },
    ],
  },
  {
    id: "premium",
    name: "aide.categories.premium",
    icon: Shield,
    questions: [
      { q: "aide.faq.q14", a: "aide.faq.a14" },
      { q: "aide.faq.q15", a: "aide.faq.a15" },
    ],
  },
  {
    id: "account",
    name: "aide.categories.account",
    icon: Users,
    questions: [
      { q: "aide.faq.q16", a: "aide.faq.a16" },
      { q: "aide.faq.q17", a: "aide.faq.a17" },
      { q: "aide.faq.q18", a: "aide.faq.a18" },
    ],
  },
];

const QUICK_LINKS = [
  { 
    label: "aide.quickLinks.evaluation", 
    href: "/sondage", 
    icon: Heart,
    desc: "aide.quickLinksDesc.evaluation"
  },
  { 
    label: "aide.quickLinks.forum", 
    href: "/forum", 
    icon: MessageCircle,
    desc: "aide.quickLinksDesc.forum"
  },
  { 
    label: "aide.quickLinks.chat", 
    href: "/chat", 
    icon: Smartphone,
    desc: "aide.quickLinksDesc.chat"
  },
  { 
    label: "aide.quickLinks.resources", 
    href: "/ressources", 
    icon: BookOpen,
    desc: "aide.quickLinksDesc.resources"
  },
  { 
    label: "aide.quickLinks.annuaire", 
    href: "/annuaire", 
    icon: Users,
    desc: "aide.quickLinksDesc.annuaire"
  },
  { 
    label: "aide.quickLinks.premium", 
    href: "/annuaire", 
    icon: Shield,
    desc: "aide.quickLinksDesc.premium"
  },
];

export default function AidePage() {
  const { t } = useLang();
  const [search, setSearch] = useState("");
  const [openCategories, setOpenCategories] = useState<string[]>(["getting-started"]);

  const filteredCategories = FAQ_CATEGORIES.map((cat) => ({
    ...cat,
    questions: cat.questions.filter((faq) =>
      (t.aide.faq[faq.q as keyof typeof t.aide.faq]?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (t.aide.faq[faq.a as keyof typeof t.aide.faq]?.toLowerCase().includes(search.toLowerCase()) ?? false)
    ),
  })).filter((cat) => cat.questions.length > 0);

  const toggleCategory = (id: string) => {
    setOpenCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-dvh bg-bg">
      <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-shell items-center gap-3 px-4">
          <button
            onClick={() => window.history.back()}
            className="flex-shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-3 hover:text-ink"
            aria-label="Retour"
          >
            <ArrowLeft size={19} />
          </button>
          <h1 className="text-base font-semibold text-ink">{t.aide?.title || "Aide à l'utilisation"}</h1>
        </div>
      </header>

      <main className="py-8 pb-16">
        <Container size="wide">
          <div className="space-y-8">
            {/* Search */}
            <Card className="p-4">
              <div className="relative">
                <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-subtle" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t.aide?.searchPlaceholder || "Rechercher une question..."}
                  className="pl-11"
                />
              </div>
            </Card>

            {/* Quick Links */}
            <section>
              <h2 className="mb-4 text-lg font-semibold text-ink">{t.aide.quickLinksTitle || "Quick Access"}</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {QUICK_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex flex-col items-start gap-2 rounded-xl border border-line bg-surface p-4 transition-all hover:border-brand-line hover:bg-brand-soft/50 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-soft text-brand">
                        <link.icon size={18} aria-hidden />
                      </span>
                      <span className="font-medium text-ink">{t.aide.quickLinks[link.label as keyof typeof t.aide.quickLinks]}</span>
                      <ArrowRight size={16} className="ml-auto text-ink-subtle" />
                    </div>
                    <p className="text-xs text-ink-muted w-full pl-12">{t.aide.quickLinksDesc[link.desc as keyof typeof t.aide.quickLinksDesc]}</p>
                  </Link>
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section>
              <h2 className="mb-4 text-lg font-semibold text-ink">{t.aide.faqTitle || "Frequently Asked Questions"}</h2>
              <div className="space-y-4">
                {filteredCategories.map((cat) => (
                  <Card key={cat.id} className="overflow-hidden">
                    <button
                      onClick={() => toggleCategory(cat.id)}
                      className="w-full flex items-center justify-between gap-4 p-4 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand">
                          <cat.icon size={18} aria-hidden />
                        </span>
                        <span className="font-medium text-ink">{t.aide.categories[cat.name as keyof typeof t.aide.categories]}</span>
                      </div>
                      {openCategories.includes(cat.id) ? (
                        <ChevronUp size={20} className="text-ink-muted" />
                      ) : (
                        <ChevronDown size={20} className="text-ink-muted" />
                      )}
                    </button>

                    {openCategories.includes(cat.id) && (
                      <div className="border-t border-line divide-y divide-line">
                        {cat.questions.map((faq, i) => (
                          <div key={i} className="p-4">
                            <h3 className="font-medium text-ink">{t.aide.faq[faq.q as keyof typeof t.aide.faq]}</h3>
                            <p className="mt-2 text-sm text-ink-muted leading-relaxed">{t.aide.faq[faq.a as keyof typeof t.aide.faq]}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}

                {filteredCategories.length === 0 && (
                  <Card className="p-6 text-center">
                    <Search size={32} className="mx-auto mb-3 text-ink-subtle" />
                    <p className="text-ink-muted">{t.aide.noResults || "No results for your search"}</p>
                  </Card>
                )}
              </div>
            </section>

            {/* Contact Support */}
            <section>
              <h2 className="mb-4 text-lg font-semibold text-ink">{t.aide.contactTitle || "Need More Help?"}</h2>
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <LifeBuoy size={22} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink">{t.aide.contactSubtitle || "Contact our support team"}</h3>
                    <p className="mt-1 text-sm text-ink-muted">{t.aide.contactDesc || "Our team is here to help. Response within 24 business hours."}</p>
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <ButtonLink href="/connexion" variant="outline">{t.aide.contactEmail || "Contact us by email"}</ButtonLink>
                      <ButtonLink href="/forum" variant="outline">{t.aide.contactForum || "Ask on the forum"}</ButtonLink>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* Emergency */}
            <section>
              <Card className="p-6 border-danger/50 bg-danger-soft/50">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-danger/10 text-danger">
                    <LifeBuoy size={22} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink">{t.aide.emergencyTitle || "Emergency Situation"}</h3>
                    <p className="mt-1 text-sm text-ink-muted leading-relaxed">
                      {t.aide.emergencyDesc || "If you are in immediate danger or someone else is, don't wait: call +261 20 22 XXX XX (Madagascar listening line) or go to the nearest emergency room. You are not alone."}
                    </p>
                    <Link
                      href="/ressources"
                      className="mt-3 inline-flex items-center gap-2 font-semibold text-danger hover:underline"
                    >
                      {t.aide.emergencyLink || "View all emergency contacts"}
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </Card>
            </section>
          </div>
        </Container>
      </main>
    </div>
  );
}