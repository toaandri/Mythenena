"use client";

import { useState } from "react";
import { Plus, MessageCircle, Users, Heart, ArrowRight } from "lucide-react";
import { useLang } from "@/lib/context/LangContext";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button, ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Topic = {
  id: string;
  name: string;
  participants: number;
  icon: "depression" | "esteem" | "sobriety";
  href: string;
};

const TOPICS: Topic[] = [
  {
    id: "depression",
    name: "forum.topics.depression",
    participants: 15,
    icon: "depression",
    href: "/forum/depression",
  },
  {
    id: "esteem",
    name: "forum.topics.esteem",
    participants: 15,
    icon: "esteem",
    href: "/forum/esteem",
  },
  {
    id: "sobriety",
    name: "forum.topics.sobriety",
    participants: 15,
    icon: "sobriety",
    href: "/forum/sobriety",
  },
];

function TopicIcon({ type, className }: { type: Topic["icon"]; className?: string }) {
  const icons = {
    depression: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M17 18a5 5 0 0 0-10 0" />
        <path d="M12 2a10 10 0 1 0 10 10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    esteem: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        <path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66" />
        <path d="m18 15-2-2" />
        <path d="m15 18-2-2" />
      </svg>
    ),
    sobriety: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 2a10 10 0 1 0 10 10" />
        <path d="M12 6v6l4 2" />
        <path d="M14 14a4 4 0 1 1-8 0" />
        <path d="M12 14v4" />
        <path d="M10 18h4" />
      </svg>
    ),
  };

  return (
    <span className={cn("inline-flex h-10 w-10 items-center justify-center rounded-xl text-emerald-600 bg-emerald-50", className)}>
      {icons[type]}
    </span>
  );
}

export default function ForumPage() {
  const { t } = useLang();

  return (
    <Container size="wide" className="animate-fade-rise flex flex-col gap-8 py-10 sm:py-12">
      <PageHeader
        title={t.forum.pageTitle}
        subtitle={t.forum.pageSubtitle}
        actions={
          <Button variant="ghost" size="sm" className="text-ink-muted hover:text-ink">
            <Plus size={16} aria-hidden />
            {t.forum.newTopic}
          </Button>
        }
      />

      <section aria-labelledby="topics-heading" className="flex flex-col gap-6">
        <h2 id="topics-heading" className="sr-only">
          {t.forum.topicsTitle}
        </h2>

        <ul className="flex flex-col gap-4" role="list">
          {TOPICS.map((topic) => (
            <li key={topic.id}>
              <a
                href={topic.href}
                className={cn(
                  "group flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 transition-all duration-200",
                  "hover:border-emerald-200 hover:bg-emerald-50/50 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                )}
              >
                <TopicIcon type={topic.icon} className="flex-shrink-0 group-hover:scale-105 transition-transform duration-200" />
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-ink group-hover:text-emerald-700 transition-colors">
                    {t.forum.topics[topic.name as keyof typeof t.forum.topics]}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-sm text-ink-muted">
                    <Users size={14} aria-hidden />
                    <span>{topic.participants} {t.forum.participants}</span>
                  </div>
                </div>
                <ArrowRight
                  size={20}
                  className="flex-shrink-0 text-ink-subtle group-hover:text-emerald-600 transition-colors"
                  aria-hidden
                />
              </a>
            </li>
          ))}
        </ul>

        <div className="pt-4">
          <ButtonLink
            href="/forum/nouveau"
            className={cn(
              "w-full sm:w-auto gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_4px_14px_rgb(16,185,129)/0.3]",
              "h-12 px-6 text-base font-semibold"
            )}
          >
            <Plus size={18} aria-hidden />
            {t.forum.createTopic}
          </ButtonLink>
        </div>
      </section>
    </Container>
  );
}