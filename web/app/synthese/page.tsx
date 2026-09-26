"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Info,
  MessagesSquare,
  RotateCcw,
  Stethoscope,
  Wind,
} from "lucide-react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useLang } from "@/lib/context/LangContext";
import { useCssVar } from "@/lib/useCssVar";
import { PageBody } from "@/components/layout/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

// Scores de démonstration — branchés sur les réponses réelles via l'API.
const SCORES = [72, 45, 38, 60, 50];

type LevelTone = "brand";

const LEVELS: { min: number; tone: LevelTone; label: "low" | "medium" | "high" }[] = [
  { min: 65, tone: "brand", label: "low" },
  { min: 40, tone: "brand", label: "medium" },
  { min: 0, tone: "brand", label: "high" },
];

/* Classes écrites en toutes lettres : Tailwind ne peut pas détecter `text-${tone}`. */
const TONE = {
  brand: { text: "text-brand", bg: "bg-brand", stroke: "stroke-brand" },
} satisfies Record<LevelTone, { text: string; bg: string; stroke: string }>;

const levelOf = (value: number) => LEVELS.find((l) => value >= l.min) ?? LEVELS[LEVELS.length - 1];

export default function SynthesePage() {
  const { t } = useLang();
  const dims = t.synthese.dimensions;

  const brand = useCssVar("--brand");
  const line = useCssVar("--line");
  const muted = useCssVar("--ink-muted");
  const surface = useCssVar("--surface");

  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setRevealed(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const radarData = dims.map((subject, i) => ({ subject, value: SCORES[i] }));
  const avg = Math.round(SCORES.reduce((a, b) => a + b, 0) / SCORES.length);
  const avgLevel = levelOf(avg);

  const RADIUS = 52;
  const CIRC = 2 * Math.PI * RADIUS;

  return (
    <PageBody size="narrow" className="flex flex-col gap-6">
      <PageHeader
        align="center"
        title={t.synthese.title}
        subtitle={t.synthese.subtitle}
        eyebrow={<Badge tone={avgLevel.tone}>{`${t.synthese[avgLevel.label]} · ${avg}/100`}</Badge>}
      />

      {/* ───── Score global ───── */}
      <Card className="items-center gap-5 p-8 text-center">
        <div className="relative h-32 w-32">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r={RADIUS} fill="none" strokeWidth="9" className="stroke-surface-3" />
            <circle
              cx="60"
              cy="60"
              r={RADIUS}
              fill="none"
              strokeWidth="9"
              strokeLinecap="round"
              className={cn(TONE[avgLevel.tone].stroke, "transition-[stroke-dashoffset] duration-1000 ease-out")}
              strokeDasharray={CIRC}
              strokeDashoffset={revealed ? CIRC - (avg / 100) * CIRC : CIRC}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-4xl font-bold tracking-tight", TONE[avgLevel.tone].text)}>{avg}</span>
            <span className="text-tiny font-semibold uppercase tracking-[0.08em] text-ink-subtle">/ 100</span>
          </div>
        </div>
        <p className="text-[0.9375rem] font-semibold text-ink">{t.synthese.wellbeing}</p>
      </Card>

      {/* ───── Radar ───── */}
      <Card className="gap-4 p-6">
        <CardHeader title={t.synthese.overallChart} />
        <div className="-mx-2 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} outerRadius="72%">
              <PolarGrid stroke={line} />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: muted }} />
              <Radar dataKey="value" stroke={brand} fill={brand} fillOpacity={0.22} strokeWidth={2} />
              <Tooltip
                cursor={false}
                contentStyle={{
                  background: surface,
                  border: `1px solid ${line}`,
                  borderRadius: 12,
                  fontSize: 13,
                  color: muted,
                }}
                formatter={(v: number) => [`${v} / 100`]}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* ───── Barres par dimension ───── */}
      <Card className="gap-6 p-6">
        <CardHeader title={t.synthese.byDimension} />
        <ul className="flex flex-col gap-5">
          {dims.map((dim, i) => {
            const value = SCORES[i];
            const level = levelOf(value);
            return (
              <li key={dim} className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium text-ink">{dim}</span>
                  <span className="flex items-baseline gap-2">
                    <span className="text-tiny font-semibold uppercase tracking-[0.05em] text-ink-subtle">
                      {t.synthese[level.label]}
                    </span>
                    <span className={cn("text-sm font-bold tabular-nums", TONE[level.tone].text)}>{value}%</span>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-3">
                  <div
                    className={cn(
                      "h-full rounded-full transition-[width] duration-1000 ease-out [animation-delay:200ms]",
                      TONE[level.tone].bg
                    )}
                    style={{ width: revealed ? `${value}%` : "0%" }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      {/* ───── Et maintenant ? ───── */}
      <Card className="gap-4 bg-surface-2 p-6">
        <CardHeader title={t.synthese.whatNext} />
        <Link
          href="/ressources"
          className="group flex items-start gap-4 rounded-xl border border-line bg-surface p-4 transition-all duration-200 hover:border-brand-line hover:shadow-sm"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
            <Wind size={18} aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-ink">{t.ressources.breathing}</span>
            <span className="mt-0.5 block text-[0.8125rem] leading-relaxed text-ink-muted">
              {t.synthese.resourceHint}
            </span>
          </span>
          <ArrowRight
            size={16}
            className="mt-1 shrink-0 text-ink-subtle transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-brand"
            aria-hidden
          />
        </Link>

        <div className="grid gap-2.5 sm:grid-cols-3">
          <ButtonLink href="/annuaire" size="sm" className="w-full">
            <Stethoscope size={15} aria-hidden />
            {t.synthese.seeProf}
          </ButtonLink>
          <ButtonLink href="/chat" variant="outline" size="sm" className="w-full">
            <MessagesSquare size={15} aria-hidden />
            {t.synthese.chat}
          </ButtonLink>
          <ButtonLink href="/sondage" variant="outline" size="sm" className="w-full">
            <RotateCcw size={15} aria-hidden />
            {t.synthese.retry}
          </ButtonLink>
        </div>
      </Card>

      {/* ───── Avertissement ───── */}
      <div className="flex items-start gap-3 rounded-2xl border border-brand/25 bg-brand-soft p-5">
        <Info size={17} className="mt-0.5 shrink-0 text-brand" aria-hidden />
        <p className="text-[0.8125rem] leading-relaxed text-ink-muted">{t.synthese.disclaimer}</p>
      </div>
    </PageBody>
  );
}
