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
import { cn } from "@/lib/utils";

const GENDERS = ["male", "female"] as const;

export default function InscriptionPage() {
  const router = useRouter();
  const { t, lang } = useLang();
  const { ensureSession } = useSession();
  const [form, setForm] = useState({ pseudo: "", gender: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const name = form.pseudo.trim();
    if (!name || name.length < 3) {
      setError("Le pseudonyme doit contenir au moins 3 caractères.");
      return;
    }
    if (!form.gender) {
      setError("Veuillez sélectionner votre genre.");
      return;
    }

    setLoading(true);
    try {
      await ensureSession(lang === "mg" ? "mg" : "fr");
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
          <h1 className="text-base font-semibold text-ink">
            {t.inscription?.title || "Créer un compte"}
          </h1>
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
                <h2 className="text-h3 text-ink">{t.inscription?.title || "Créer un compte"}</h2>
                <p className="mt-2 text-sm text-ink-muted">
                  {t.inscription?.subtitle || "Rejoignez Mythenena pour accéder à votre espace personnel"}
                </p>
              </div>

              {success && (
                <div className="mb-6 flex items-center gap-3 rounded-xl bg-brand-soft p-4 text-brand">
                  <CheckCircle size={20} className="flex-shrink-0" />
                  <span className="text-sm font-medium">
                    {t.inscription?.successMessage || "Compte créé avec succès ! Redirection vers la connexion..."}
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
                <Field label={t.inscription?.pseudoLabel || "Pseudonyme"} htmlFor="pseudo">
                  <div className="relative">
                    <User size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-subtle" />
                    <Input
                      id="pseudo"
                      type="text"
                      value={form.pseudo}
                      onChange={(e) => handleChange("pseudo", e.target.value)}
                      placeholder="Ex: Lotus, Nuage, Horizon..."
                      className="pl-11"
                      autoComplete="username"
                      maxLength={32}
                      disabled={success}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-ink-subtle">3 à 32 caractères. Votre identité reste anonyme.</p>
                </Field>

                <Field label={t.inscription?.genderLabel || "Genre"}>
                  <div className="flex gap-3">
                    {GENDERS.map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleChange("gender", value)}
                        aria-pressed={form.gender === value}
                        className={cn(
                          "flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border-2 text-sm font-medium transition-all",
                          form.gender === value
                            ? "border-brand bg-brand-soft text-brand"
                            : "border-line text-ink-muted hover:border-brand-line"
                        )}
                      >
                        {t.inscription?.genderOptions?.[value] ||
                          (value === "male" ? "Homme" : "Femme")}
                      </button>
                    ))}
                  </div>
                </Field>

                <Button type="submit" size="lg" className="w-full" disabled={loading || success} loading={loading}>
                  Créer mon espace
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-ink-muted">
                {t.inscription?.hasAccount || "Déjà un compte ?"}{" "}
                <Link
                  href="/connexion"
                  className="font-semibold text-brand transition-colors hover:text-brand-hover"
                >
                  {t.inscription?.loginLink || "Se connecter"}
                </Link>
              </p>

              <p className="mt-4 text-center text-xs text-ink-subtle">
                {t.inscription?.termsNote || "En créant un compte, vous acceptez nos "}
                <Link href="/confidentialite" className="font-semibold text-brand hover:underline">
                  {t.inscription?.termsLink || "Conditions de confidentialité"}
                </Link>
              </p>
            </Card>
          </div>
        </Container>
      </main>
    </div>
  );
}
