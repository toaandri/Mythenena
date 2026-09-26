"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useLang } from "@/lib/context/LangContext";
import { TunnelShell, StepBadge } from "@/components/layout/TunnelShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ChoiceList } from "@/components/ui/ChoiceList";

export default function SondagePage() {
  const { t } = useLang();
  const router = useRouter();
  const questions = t.sondage.questions;
  const total = questions.length;

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(total).fill(null));

  const current = questions[step];
  const isLast = step === total - 1;
  const hasAnswer = answers[step] !== null;

  const select = useCallback((i: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[step] = i;
      return next;
    });
  }, [step]);

  const next = useCallback(() => {
    if (isLast) router.push("/synthese");
    else setStep((s) => s + 1);
  }, [isLast, router]);

  const back = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  // Navigation clavier : 1-4 pour choisir, Entrée pour valider.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;

      const index = Number(e.key) - 1;
      if (Number.isInteger(index) && index >= 0 && index < current.choices.length) {
        e.preventDefault();
        select(index);
        return;
      }
      if (e.key === "Enter" && hasAnswer) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current.choices.length, hasAnswer, next, select]);

  return (
    <TunnelShell
      step={step}
      total={total}
      title={t.sondage.title}
      subtitle={t.sondage.subtitle}
      eyebrow={<StepBadge step={step} total={total} />}
      actions={
        <>
          <Button variant="outline" onClick={back} disabled={step === 0} className="sm:w-40">
            <ArrowLeft size={16} aria-hidden />
            {t.questionnaire.back}
          </Button>
          <Button variant="ghost" onClick={next} className="sm:w-32">
            {t.sondage.skip}
          </Button>
          <Button onClick={next} disabled={!hasAnswer} className="sm:w-52">
            {isLast ? t.sondage.finish : t.sondage.next}
            <ArrowRight size={16} aria-hidden />
          </Button>
        </>
      }
      footnote={
        <Link href="/ressources" className="link-quiet font-medium">
          <Sparkles size={14} aria-hidden />
          {t.home.crisisCta}
        </Link>
      }
    >
      <Card className="gap-6 p-6 sm:p-8">
        <h2 className="text-lg font-semibold leading-snug tracking-[-0.01em] text-ink">
          {current.q}
        </h2>

        <ChoiceList
          options={current.choices.map((label) => ({ label }))}
          selected={answers[step] === null ? [] : [answers[step] as number]}
          onToggle={select}
        />

        <p className="text-center text-[0.75rem] text-ink-subtle">
          Touches <kbd className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-sans text-[0.7rem]">1</kbd>–
          <kbd className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-sans text-[0.7rem]">4</kbd> pour
          choisir
        </p>
      </Card>
    </TunnelShell>
  );
}
