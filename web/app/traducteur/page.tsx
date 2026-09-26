"use client";

import { useCallback, useState } from "react";
import { ArrowRight, Copy, Languages, Settings2, Trash2, X, Check } from "lucide-react";
import { useLang } from "@/lib/context/LangContext";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select, Textarea } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "auto", label: "Détection automatique" },
  { code: "mg", label: "Malagasy" },
  { code: "fr", label: "Français" },
  { code: "en", label: "Anglais" },
  { code: "es", label: "Espagnol" },
  { code: "de", label: "Allemand" },
  { code: "it", label: "Italien" },
  { code: "pt", label: "Portugais" },
  { code: "ar", label: "Arabe" },
  { code: "zh-Hans", label: "Chinois simplifié" },
  { code: "ja", label: "Japonais" },
  { code: "ko", label: "Coréen" },
];

const TARGET_LANGUAGES = LANGUAGES.filter((l) => l.code !== "auto");

const QUICK_PAIRS = [
  { from: "fr", to: "mg" },
  { from: "mg", to: "fr" },
  { from: "fr", to: "en" },
  { from: "en", to: "mg" },
];

const MAX = 5000;

export default function TraducteurPage() {
  const { t } = useLang();

  const [source, setSource] = useState("fr");
  const [target, setTarget] = useState("mg");
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState("");
  const [detected, setDetected] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const labelOf = (code: string) => LANGUAGES.find((l) => l.code === code)?.label ?? code;

  const translate = useCallback(async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError("");
    setResult("");
    setDetected("");

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, source, target }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t.traducteur.error);
      setResult(data.translated);
      if (source === "auto" && data.detectedLang) setDetected(data.detectedLang);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.traducteur.error);
    } finally {
      setLoading(false);
    }
  }, [inputText, source, target, t.traducteur.error]);

  const swap = () => {
    if (source === "auto") return;
    setSource(target);
    setTarget(source);
    setInputText(result);
    setResult("");
    setDetected("");
  };

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clear = () => {
    setInputText("");
    setResult("");
    setDetected("");
    setError("");
  };

  const isPairActive = (from: string, to: string) => source === from && target === to;

  return (
    <Container size="wide" className="animate-fade-rise flex flex-col gap-7 py-10 sm:py-12">
      <PageHeader
        title={t.traducteur.title}
        subtitle={t.traducteur.subtitle}
        actions={<Badge tone="neutral" icon={<Languages size={12} aria-hidden />}>{t.traducteur.poweredBy}</Badge>}
      />

      {/* Paires fréquentes */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-tiny font-bold uppercase tracking-[0.08em] text-ink-subtle">
          {t.traducteur.quickPairs}
        </span>
        {QUICK_PAIRS.map(({ from, to }) => {
          const active = isPairActive(from, to);
          return (
            <button
              key={`${from}-${to}`}
              type="button"
              onClick={() => {
                setSource(from);
                setTarget(to);
                setResult("");
                setDetected("");
              }}
              aria-pressed={active}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-[0.8125rem] font-medium transition-all duration-200",
                active
                  ? "border-brand bg-brand text-brand-on shadow-brand"
                  : "border-line bg-surface text-ink-muted hover:border-brand-line hover:text-ink"
              )}
            >
              {labelOf(from)} <ArrowRight size={11} className="mx-0.5 inline" aria-hidden /> {labelOf(to)}
            </button>
          );
        })}
      </div>

      {/* Sélecteurs */}
      <div className="flex items-center gap-3">
        <Select
          value={source}
          onChange={(e) => {
            setSource(e.target.value);
            setResult("");
            setDetected("");
          }}
          aria-label={t.traducteur.source}
          className="flex-1"
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </Select>

        <button
          type="button"
          onClick={swap}
          disabled={source === "auto"}
          aria-label={t.traducteur.swap}
          title={t.traducteur.swap}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface text-brand transition-all duration-200 hover:rotate-180 hover:border-brand hover:bg-brand-softer disabled:cursor-not-allowed disabled:text-ink-subtle disabled:hover:rotate-0"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
            <path d="M7 16V4m0 0L3 8m4-4l4 4" />
            <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>

        <Select
          value={target}
          onChange={(e) => {
            setTarget(e.target.value);
            setResult("");
          }}
          aria-label={t.traducteur.result}
          className="flex-1"
        >
          {TARGET_LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </Select>
      </div>

      {/* Zone de traduction */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="flex flex-col gap-3 p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-[0.8125rem] font-semibold text-brand">
              {labelOf(source)}
              {detected && <span className="font-normal text-ink-muted">· {t.traducteur.detected.replace("{lang}", labelOf(detected))}</span>}
            </span>
            {inputText && (
              <button
                type="button"
                onClick={clear}
                className="inline-flex items-center gap-1.5 text-[0.75rem] font-medium text-ink-subtle transition-colors hover:text-danger"
              >
                <Trash2 size={12} aria-hidden />
                {t.traducteur.clear}
              </button>
            )}
          </div>

          <Textarea
            value={inputText}
            onChange={(e) => {
              if (e.target.value.length <= MAX) setInputText(e.target.value);
            }}
            placeholder={t.traducteur.placeholder}
            aria-label={t.traducteur.source}
            className="min-h-64 flex-1 resize-none"
          />

          <div className="flex items-center justify-between gap-3">
            <span
              className={cn(
                "text-[0.75rem] tabular-nums",
                inputText.length > MAX * 0.9 ? "font-semibold text-danger" : "text-ink-subtle"
              )}
            >
              {t.traducteur.maxChars.replace("{count}", String(inputText.length)).replace("{max}", String(MAX))}
            </span>
            <Button onClick={translate} disabled={loading || !inputText.trim()}>
              {loading ? t.traducteur.translating : t.traducteur.translate}
              {!loading && <ArrowRight size={15} aria-hidden />}
            </Button>
          </div>
        </Card>

        <Card className="flex flex-col gap-3 bg-surface-2 p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[0.8125rem] font-semibold text-brand">{labelOf(target)}</span>
            {result && (
              <button
                type="button"
                onClick={copy}
                className={cn(
                  "inline-flex items-center gap-1.5 text-[0.75rem] font-medium transition-colors",
                  copied ? "text-success" : "text-ink-subtle hover:text-brand"
                )}
              >
                {copied ? <Check size={12} aria-hidden /> : <Copy size={12} aria-hidden />}
                {copied ? t.traducteur.copied : t.traducteur.copy}
              </button>
            )}
          </div>

          <div
            className="min-h-64 flex-1 whitespace-pre-wrap rounded-xl border border-line bg-surface p-4 text-[0.875rem] leading-relaxed"
            aria-live="polite"
            aria-busy={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2.5 text-ink-muted">
                <span className="flex gap-1">
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      className="h-1.5 w-1.5 animate-dot-bounce rounded-full bg-brand"
                      style={{ animationDelay: `${d * 0.15}s` }}
                    />
                  ))}
                </span>
                {t.traducteur.translating}
              </span>
            ) : (
              result || <span className="text-ink-subtle">{t.traducteur.emptyResult}</span>
            )}
          </div>

          {error && (
            <p role="alert" className="rounded-xl border border-danger/25 bg-danger-soft px-4 py-2.5 text-[0.8125rem] text-danger">
              {error}
            </p>
          )}
        </Card>
      </div>

      {/* Note de configuration */}
      <div className="rounded-2xl border border-line bg-brand-softer p-5">
        <button
          type="button"
          onClick={() => setShowConfig((v) => !v)}
          aria-expanded={showConfig}
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          <span className="flex items-center gap-2.5 text-sm font-semibold text-ink">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-soft text-brand">
              <Settings2 size={15} aria-hidden />
            </span>
            {t.traducteur.configTitle}
          </span>
          <span className="text-ink-subtle">
            {showConfig ? <X size={17} /> : <ArrowRight size={17} className="-rotate-90" />}
          </span>
        </button>

        {showConfig && (
          <div className="mt-4 animate-fade-rise space-y-3 border-t border-line pt-4">
            <p className="text-[0.8125rem] leading-relaxed text-ink-muted">{t.traducteur.configDesc}</p>
            <pre className="overflow-x-auto rounded-xl border border-line bg-surface p-4 text-[0.75rem] leading-relaxed text-ink-muted">
              <code>
                AZURE_TRANSLATOR_KEY=votre_clé_ici{"\n"}AZURE_TRANSLATOR_REGION=eastus
              </code>
            </pre>
          </div>
        )}
      </div>
    </Container>
  );
}
