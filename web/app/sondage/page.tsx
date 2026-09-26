"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useLang } from "@/lib/context/LangContext";
import { apiFetch } from "@/lib/api";
import { useSession } from "@/lib/context/SessionContext";
import { TunnelShell, StepBadge } from "@/components/layout/TunnelShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ChoiceList } from "@/components/ui/ChoiceList";

type Question = { id: string; text: string; textMg?: string; choices: Array<{ id: string; label: string; labelMg?: string }> };
type MiniSurvey = { questions: Question[]; progress: { answers: Array<{ questionId: string; choiceIds: string[] | null; skipped: boolean }> } };

export default function SondagePage() {
  const { t, lang } = useLang();
  const { ensureSession } = useSession();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [step, setStep] = useState(0);
  const [answerIds, setAnswerIds] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        await ensureSession(lang === "mg" ? "mg" : "fr");
        const survey = await apiFetch<MiniSurvey>("/api/survey/mini");
        if (!active) return;
        setQuestions(survey.questions);
        setAnswerIds(Object.fromEntries(survey.progress.answers.filter((answer) => !answer.skipped && answer.choiceIds).map((answer) => [answer.questionId, answer.choiceIds!] )));
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Le sondage ne peut pas être chargé.");
      } finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [ensureSession, lang]);

  const current = questions[step];
  const isLast = step === questions.length - 1;
  const selected = current ? answerIds[current.id] ?? [] : [];
  const persist = useCallback(async (skipped: boolean) => {
    if (!current) return;
    setSaving(true);
    setError("");
    try {
      await apiFetch("/api/survey/mini/answer", { method: "POST", body: JSON.stringify({ questionId: current.id, choiceIds: skipped ? undefined : selected, skipped }) });
      if (isLast) router.push("/synthese");
      else setStep((value) => value + 1);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "La réponse n'a pas été enregistrée.");
    } finally { setSaving(false); }
  }, [current, isLast, router, selected]);

  if (loading) return <div className="p-10 text-center text-ink-muted">Chargement du sondage…</div>;
  if (error && !current) return <div className="p-10 text-center text-danger">{error}</div>;
  if (!current) return <div className="p-10 text-center text-ink-muted">Aucune question disponible.</div>;

  return <TunnelShell step={step} total={questions.length} title={t.sondage.title} subtitle={t.sondage.subtitle} eyebrow={<StepBadge step={step} total={questions.length} />} actions={<>
    <Button variant="outline" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0 || saving} className="sm:w-40"><ArrowLeft size={16} aria-hidden />{t.questionnaire.back}</Button>
    <Button variant="ghost" onClick={() => void persist(true)} disabled={saving} className="sm:w-32">{t.sondage.skip}</Button>
    <Button onClick={() => void persist(false)} disabled={selected.length === 0 || saving} loading={saving} className="sm:w-52">{isLast ? t.sondage.finish : t.sondage.next}<ArrowRight size={16} aria-hidden /></Button>
  </>} footnote={<Link href="/ressources" className="link-quiet font-medium"><Sparkles size={14} aria-hidden />{t.home.crisisCta}</Link>}>
    <Card className="gap-6 p-6 sm:p-8">
      {error && <p role="alert" className="rounded-xl bg-danger-soft p-3 text-sm text-danger">{error}</p>}
      <h2 className="text-lg font-semibold leading-snug tracking-[-0.01em] text-ink">{lang === "mg" && current.textMg ? current.textMg : current.text}</h2>
      <ChoiceList options={current.choices.map((choice) => ({ label: lang === "mg" && choice.labelMg ? choice.labelMg : choice.label }))} selected={current.choices.map((choice, index) => selected.includes(choice.id) ? index : -1).filter((index) => index >= 0)} onToggle={(index) => setAnswerIds((previous) => ({ ...previous, [current.id]: [current.choices[index].id] }))} />
    </Card>
  </TunnelShell>;
}
