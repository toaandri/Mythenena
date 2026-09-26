"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  LogIn,
  User,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useLang } from "@/lib/context/LangContext";
import { useSession } from "@/lib/context/SessionContext";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

export default function ConnexionPage() {
  const router = useRouter();
  const { t, lang } = useLang();
  const { ensureSession } = useSession();
  const [pseudonym, setPseudonym] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const name = pseudonym.trim();
    if (!name || name.length < 3) {
      setError(t.connexion?.errors?.nameTooShort || "Le pseudonyme doit contenir au moins 3 caractères.");
      return;
    }

    setLoading(true);
    try {
      await ensureSession(lang === "mg" ? "mg" : "fr");
      setSuccess(true);
      setTimeout(() => router.push("/"), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connexion impossible. Vérifiez votre connexion.");
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
          <h1 className="text-base font-semibold text-ink">
            {t.connexion?.title || "Connexion"}
          </h1>
        </div>
      </header>

      <main className="py-8 pb-16">
        <Container size="narrow">
          <div className="mx-auto w-full max-w-md">
            <Card className="p-6 sm:p-8">
              <div className="mb-7 text-center">
                <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <LogIn size={22} aria-hidden />
                </span>
                <h2 className="text-h3 text-ink">{t.connexion?.title || "Connexion"}</h2>
                <p className="mt-2 text-sm text-ink-muted">
                  {t.connexion?.subtitle || "Choisissez un pseudonyme pour accéder à votre espace. Votre identité reste anonyme."}
                </p>
              </div>

              {success && (
                <div className="mb-6 flex items-center gap-3 rounded-xl bg-brand-soft p-4 text-brand">
                  <CheckCircle size={20} className="flex-shrink-0" />
                  <span className="text-sm font-medium">
                    {t.connexion?.successMessage || "Connexion réussie ! Redirection..."}
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
                <Field label={t.connexion?.pseudonymLabel || "Votre pseudonyme"} htmlFor="pseudonym">
                  <div className="relative">
                    <User size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-subtle" />
                    <Input
                      id="pseudonym"
                      type="text"
                      value={pseudonym}
                      onChange={(e) => {
                        setPseudonym(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder={t.connexion?.pseudonymPlaceholder || "Ex: Lotus, Nuage, Horizon..."}
                      className="pl-11 pr-11"
                      autoComplete="username"
                      maxLength={32}
                      disabled={success}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted transition-colors hover:text-ink"
                      aria-label={showPassword ? "Masquer" : "Afficher"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="mt-1.5 text-xs text-ink-subtle">
                    {t.connexion?.pseudonymHelper || "3 à 32 caractères. Aucune information personnelle requise."}
                  </p>
                </Field>

                <Button type="submit" size="lg" className="w-full" disabled={loading || success} loading={loading}>
                  {t.connexion?.submit || "Accéder à l'application"}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-ink-muted">
                {t.connexion?.noAccount || "Pas encore de compte ?"}{" "}
                <Link
                  href="/inscription"
                  className="font-semibold text-brand transition-colors hover:text-brand-hover"
                >
                  {t.connexion?.signupLink || "S'inscrire"}
                </Link>
              </p>
            </Card>
          </div>
        </Container>
      </main>
    </div>
  );
}
