"use client";

import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, Mail, Phone, Lock, User, AlertCircle, CheckCircle, UserPlus } from "lucide-react";
import { useLang } from "@/lib/context/LangContext";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function InscriptionPage() {
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
  const isPhone = /^[\d\s\+\-]{8,}$/.test(form.identifier);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

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

    // Demo: always succeeds
    setSuccess(true);
    setLoading(false);
    setTimeout(() => {
      window.location.href = "/connexion";
    }, 2000);
  };

  return (
    <div className="min-h-dvh bg-bg flex items-center justify-center px-4 py-12">
      <Container size="narrow">
        <div className="w-full max-w-md">
          <button
            onClick={() => window.history.back()}
            className="mb-6 inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-3 hover:text-ink"
            aria-label="Retour"
          >
            <ArrowLeft size={19} />
          </button>

          <Card className="p-6 sm:p-8">
            <div className="text-center mb-8">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-4">
                <UserPlus size={24} />
              </div>
              <h1 className="text-h3 text-ink">{t.inscription?.title || "Créer un compte"}</h1>
              <p className="mt-2 text-sm text-ink-muted">
                {t.inscription?.subtitle || "Rejoignez Mythenena pour accéder à votre espace personnel"}
              </p>
            </div>

            {success && (
              <div className="mb-6 flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-700">
                <CheckCircle size={20} />
                <span className="text-sm font-medium">{t.inscription?.successMessage || "Compte créé avec succès ! Redirection vers la connexion..."}</span>
              </div>
            )}

            {error && (
              <div className="mb-6 flex items-center gap-3 rounded-xl bg-danger-soft p-4 text-danger">
                <AlertCircle size={20} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="pseudo" className="block text-sm font-medium text-ink mb-2">
                  {t.inscription?.pseudoLabel || "Pseudonyme"}
                </label>
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
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-ink mb-2">
                  {t.inscription?.genderLabel || "Genre"}
                </label>
                <div className="flex gap-3">
                  {["male", "female"].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => handleChange("gender", g)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border-2 text-sm font-medium transition-all",
                        form.gender === g
                          ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                          : "border-line text-ink-muted hover:border-brand-line"
                      )}
                    >
                      {g === "male" ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                          <circle cx="12" cy="5" r="3" />
                          <path d="M12 8v10M5 14h14" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                          <circle cx="12" cy="5" r="3" />
                          <path d="M12 8v10M5 14h14" />
                          <circle cx="12" cy="18" r="3" />
                        </svg>
                      )}
                      {t.inscription?.genderOptions?.[g as keyof typeof t.inscription.genderOptions] || (g === "male" ? "Homme" : "Femme")}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-ink mb-2">
                  {t.inscription?.identifierLabel || "Email ou numéro de téléphone"}
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-subtle">
                    {isEmail ? <Mail size={18} /> : <Phone size={18} />}
                  </div>
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
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-ink mb-2">
                  {t.inscription?.passwordLabel || "Mot de passe"}
                </label>
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
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink mb-2">
                  {t.inscription?.confirmPasswordLabel || "Confirmer le mot de passe"}
                </label>
                <div className="relative">
                  <Lock size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-subtle" />
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
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12"
                disabled={loading || success}
                loading={loading}
              >
                {t.inscription?.submit || "Créer mon compte"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-ink-muted">
                {t.inscription?.hasAccount || "Déjà un compte ?"}{" "}
                <Link
                  href="/connexion"
                  className="font-semibold text-brand hover:text-brand-hover transition-colors"
                >
                  {t.inscription?.loginLink || "Se connecter"}
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-ink-subtle">
                {t.inscription?.termsNote || "En créant un compte, vous acceptez nos "}
                <Link href="/confidentialite" className="text-brand hover:underline">
                  {t.inscription?.termsLink || "Conditions de confidentialité"}
                </Link>
              </p>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-ink-subtle">
                {t.inscription?.demoNote || "Mode démo : l'inscription est simulée"}
              </p>
            </div>
          </Card>
        </div>
      </Container>
    </div>
  );
}