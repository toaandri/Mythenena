"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ListChecks } from "lucide-react";
import { useLang } from "@/lib/context/LangContext";
import { TunnelShell, StepBadge } from "@/components/layout/TunnelShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ChoiceList } from "@/components/ui/ChoiceList";

type Question = { q: string; choices: string[]; multiple?: boolean };

const ADAPTIVE_QUESTIONS: Question[] = [
  { q: "Depuis combien de temps ressentez-vous ces difficultés ?", choices: ["Quelques jours", "Quelques semaines", "Plusieurs mois", "Plus d'un an"] },
  { q: "Ces difficultés affectent-elles votre travail ou vos études ?", choices: ["Non, pas vraiment", "Un peu", "Beaucoup", "Je ne peux plus travailler"] },
  { q: "Avez-vous quelqu'un à qui parler de ce que vous ressentez ?", choices: ["Oui, facilement", "Parfois", "Rarement", "Non, personne"] },
  { q: "Comment évaluez-vous votre énergie au quotidien ?", choices: ["Bonne", "Variable", "Souvent faible", "Épuisé(e) en permanence"] },
  { q: "Avez-vous des pensées négatives récurrentes sur vous-même ?", choices: ["Rarement", "Parfois", "Souvent", "Presque tout le temps"] },
  { q: "Quels domaines vous semblent les plus difficiles en ce moment ?", choices: ["Travail / études", "Relations familiales", "Relations amoureuses", "Finances", "Santé physique"], multiple: true },
  { q: "Avez-vous déjà consulté un professionnel de santé mentale ?", choices: ["Non, jamais", "Oui, dans le passé", "Oui, actuellement", "J'aimerais le faire"] },
];

export default function QuestionnairePage() {
  const { t } = useLang();
  const router = useRouter();
  const total = ADAPTIVE_QUESTIONS.length;

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(number[] | null)[]>(Array(total).fill(null));

  const stepText = t.questionnaire.stepOf
    .replace("{current}", String(step + 1))
    .replace("{total}", String(total));

  const current = ADAPTIVE_QUESTIONS[step];
  const isLast = step === total - 1;
  const selected = answers[step] ?? [];

  const toggle = useCallback(
    (i: number) => {
      setAnswers((prev) => {
        const updated = [...prev];
        if (current.multiple) {
          const prevSel = prev[step] ?? [];
          const next = prevSel.includes(i) ? prevSel.filter((x) => x !== i) : [...prevSel, i];
          updated[step] = next.length ? next : null;
        } else {
          updated[step] = [i];
        }
        return updated;
      });
    },
    [current.multiple, step]
  );

  const next = useCallback(() => {
    if (isLast) router.push("/synthese");
    else setStep((s) => s + 1);
  }, [isLast, router]);

  const back = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  return (
    <TunnelShell
      step={step}
      total={total}
      title={t.questionnaire.title}
      subtitle={t.questionnaire.subtitle}
      eyebrow={
        <div className="flex flex-wrap items-center justify-center gap-2">
          <StepBadge step={step} total={total} text={stepText} />
          {current.multiple && (
            <Badge tone="accent" icon={<ListChecks size={12} aria-hidden />}>
              {t.questionnaire.multipleAllowed}
            </Badge>
          )}
        </div>
      }
      actions={
        <>
          <Button variant="outline" onClick={back} disabled={step === 0} className="sm:w-40">
            <ArrowLeft size={16} aria-hidden />
            {t.questionnaire.back}
          </Button>
          <Button variant="ghost" onClick={next} className="sm:w-40">
            {t.questionnaire.skip}
          </Button>
          <Button onClick={next} disabled={selected.length === 0} className="sm:w-52">
            {isLast ? t.questionnaire.finish : t.questionnaire.next}
            <ArrowRight size={16} aria-hidden />
          </Button>
        </>
      }
    >
      <Card className="gap-6 p-6 sm:p-8">
        <h2 className="text-lg font-semibold leading-snug tracking-[-0.01em] text-ink">
          {current.q}
        </h2>

        <ChoiceList
          options={current.choices.map((label) => ({ label }))}
          selected={selected}
          onToggle={toggle}
          multiple={current.multiple}
        />

        {!current.multiple && (
          <button
            type="button"
            onClick={next}
            className="rounded-xl border border-dashed border-line-strong px-4 py-3.5 text-left text-sm text-ink-subtle transition-colors hover:border-brand-line hover:bg-brand-softer/50 hover:text-ink-muted"
          >
            {t.questionnaire.other}
          </button>
        )}
      </Card>
    </TunnelShell>
  );
}
