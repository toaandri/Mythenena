"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  UserPlus,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useLang } from "@/lib/context/LangContext";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

const GENDERS = ["male", "female"] as const;

export default function InscriptionPage() {
  const router = useRouter();
  const { t } = useLang();
  const [form, setForm] = useState({
    pseudo: "",
    gender: "",
    identifier: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const isEmail = form.identifier.includes("@");
  const isPhone = /^[\d\s+\-]{8,}$/.test(form.identifier);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!form.pseudo.trim() || !form.gender || !form.identifier.trim() || !form.password || !form.confirmPassword) {
      setError(t.inscription?.errors?.required || "Veuillez remplir tous les champs");
      return;
    }

    if (form.pseudo.trim().length < 2) {
      setError(t.inscription?.errors?.nameTooShort || "Le pseudo doit contenir au moins 2 caractères");
      return;
    }

    if (!isEmail && !isPhone) {
      setError(t.inscription?.errors?.invalidIdentifier || "Entrez un email ou un numéro de téléphone valide");
      return;
    }

    if (form.password.length < 6) {
      setError(t.inscription?.errors?.passwordTooShort || "Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError(t.inscription?.errors?.passwordMismatch || "Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSuccess(true);
    setLoading(false);
    setTimeout(() => router.push("/connexion"), 2000);
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
                      placeholder={t.inscription?.pseudoPlaceholder || "Votre pseudo"}
                      className="pl-11"
                      autoComplete="username"
                      disabled={success}
                    />
                  </div>
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

                <Field label={t.inscription?.identifierLabel || "Email ou numéro de téléphone"} htmlFor="identifier">
                  <div className="relative">
                    {isEmail ? (
                      <Mail size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-subtle" />
                    ) : (
                      <Phone size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-subtle" />
                    )}
                    <Input
                      id="identifier"
                      type={isEmail ? "email" : "tel"}
                      value={form.identifier}
                      onChange={(e) => handleChange("identifier", e.target.value)}
                      placeholder={isEmail ? "vous@exemple.com" : "+261 3X XX XX XX"}
                      className="pl-11"
                      autoComplete="email"
                      disabled={success}
                    />
                  </div>
                </Field>

                <Field label={t.inscription?.passwordLabel || "Mot de passe"} htmlFor="password">
                  <div className="relative">
                    <Lock size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-subtle" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      placeholder={t.inscription?.passwordPlaceholder || "Au moins 6 caractères"}
                      className="pl-11 pr-11"
                      autoComplete="new-password"
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

                <Field
                  label={t.inscription?.confirmPasswordLabel || "Confirmer le mot de passe"}
                  htmlFor="confirmPassword"
                >
                  <div className="relative">
                    <ShieldCheck size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-subtle" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={(e) => handleChange("confirmPassword", e.target.value)}
                      placeholder={t.inscription?.confirmPasswordPlaceholder || "Répétez le mot de passe"}
                      className="pl-11 pr-11"
                      autoComplete="new-password"
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

                <Button type="submit" size="lg" className="w-full" disabled={loading || success} loading={loading}>
                  {t.inscription?.submit || "Créer mon compte"}
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

              <p className="mt-4 text-center text-xs text-ink-subtle">
                {t.inscription?.demoNote || "Mode démo : l'inscription est simulée"}
              </p>
            </Card>
          </div>
        </Container>
      </main>
    </div>
  );
}
