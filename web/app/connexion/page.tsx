"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  LogIn,
  Mail,
  Phone,
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
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const isEmail = identifier.includes("@");
  const isPhone = /^[\d\s+\-]{8,}$/.test(identifier);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!identifier.trim() || !password) {
      setError(t.connexion?.errors?.required || "Veuillez remplir tous les champs");
      return;
    }

    if (!isEmail && !isPhone) {
      setError(t.connexion?.errors?.invalidIdentifier || "Entrez un email ou un numéro de téléphone valide");
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
                  {t.connexion?.subtitle || "Connectez-vous pour accéder à votre espace personnel"}
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
                <Field label={t.connexion?.identifierLabel || "Email ou numéro de téléphone"} htmlFor="identifier">
                  <div className="relative">
                    {isEmail ? (
                      <Mail size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-subtle" />
                    ) : (
                      <Phone size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-subtle" />
                    )}
                    <Input
                      id="identifier"
                      type={isEmail ? "email" : "tel"}
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder={isEmail ? "vous@exemple.com" : "+261 3X XX XX XX"}
                      className="pl-11"
                      autoComplete="username"
                      disabled={success}
                    />
                  </div>
                </Field>

                <Field label={t.connexion?.passwordLabel || "Mot de passe"} htmlFor="password">
                  <div className="relative">
                    <Lock size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-subtle" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder={t.connexion?.passwordPlaceholder || "••••••••"}
                      className="pl-11 pr-11"
                      autoComplete="current-password"
                      disabled={success}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted transition-colors hover:text-ink"
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </Field>

                <div className="flex justify-end">
                  <Link
                    href="/aide"
                    className="rounded-lg text-[0.8125rem] font-semibold text-brand transition-colors hover:text-brand-hover"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={loading || success} loading={loading}>
                  {t.connexion?.submit || "Se connecter"}
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
