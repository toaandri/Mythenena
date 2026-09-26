"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  UserPlus,
  User,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useLang } from "@/lib/context/LangContext";
import { useSession } from "@/lib/context/SessionContext";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

export default function InscriptionPage() {
  const router = useRouter();
  const { t, lang } = useLang();
  const { ensureSession } = useSession();
  const [pseudo, setPseudo] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (value: string) => {
    setPseudo(value);
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const name = pseudo.trim();
    if (name.length < 3) {
      setError(t.inscription.errors.nameTooShort);
      return;
    }

    setLoading(true);
    try {
      await ensureSession(lang === "mg" ? "mg" : "fr", name);
      setSuccess(true);
      setTimeout(() => router.push("/"), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Inscription impossible. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-bg">
      <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-shell items-center gap-3 px-4">
          <button
            onClick={() => router.back()}
            className="flex-shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-3 hover:text-ink"
            aria-label="Retour"
          >
            <ArrowLeft size={19} />
          </button>
          <h1 className="text-base font-semibold text-ink">{t.inscription.title}</h1>
        </div>
      </header>

      <main className="py-8 pb-16">
        <Container size="narrow">
          <div className="mx-auto w-full max-w-md">
            <Card className="p-6 sm:p-8">
              <div className="mb-7 text-center">
                <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <UserPlus size={22} aria-hidden />
                </span>
                <h2 className="text-h3 text-ink">{t.inscription.title}</h2>
                <p className="mt-2 text-sm text-ink-muted">
                  {t.inscription.subtitle}
                </p>
              </div>

              {success && (
                <div className="mb-6 flex items-center gap-3 rounded-xl bg-brand-soft p-4 text-brand">
                  <CheckCircle size={20} className="flex-shrink-0" />
                  <span className="text-sm font-medium">
                    {t.inscription.successMessage}
                  </span>
                </div>
              )}

              {error && (
                <div className="mb-6 flex items-center gap-3 rounded-xl bg-danger-soft p-4 text-danger">
                  <AlertCircle size={20} className="flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <Field label={t.inscription.pseudoLabel} htmlFor="pseudo">
                  <div className="relative">
                    <User size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-subtle" />
                    <Input
                      id="pseudo"
                      type="text"
                      value={pseudo}
                      onChange={(e) => handleChange(e.target.value)}
                      placeholder={t.inscription.pseudoPlaceholder}
                      className="pl-11"
                      autoComplete="username"
                      maxLength={32}
                      disabled={success}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-ink-subtle">{t.inscription.anonymousNote}</p>
                </Field>

                <Button type="submit" size="lg" className="w-full" disabled={loading || success} loading={loading}>
                  {t.inscription.submit}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-ink-muted">
                {t.inscription.hasAccount}{" "}
                <Link
                  href="/connexion"
                  className="font-semibold text-brand transition-colors hover:text-brand-hover"
                >
                  {t.inscription.loginLink}
                </Link>
              </p>

              <p className="mt-4 text-center text-xs text-ink-subtle">
                {t.inscription.termsNote}{" "}
                <Link href="/confidentialite" className="font-semibold text-brand hover:underline">
                  {t.inscription.termsLink}
                </Link>
              </p>
            </Card>
          </div>
        </Container>
      </main>
    </div>
  );
}
