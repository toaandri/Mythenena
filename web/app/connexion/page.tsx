"use client";

import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, Mail, Phone, Lock, User, AlertCircle, CheckCircle } from "lucide-react";
import { useLang } from "@/lib/context/LangContext";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function ConnexionPage() {
  const { t } = useLang();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const isEmail = identifier.includes("@");
  const isPhone = /^[\d\s\+\-]{8,}$/.test(identifier);

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

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Demo: any non-empty credentials work
    if (identifier.trim() && password) {
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } else {
      setError(t.connexion?.errors?.invalidCredentials || "Identifiants incorrects");
    }
    setLoading(false);
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
              <h1 className="text-h3 text-ink">{t.connexion?.title || "Connexion"}</h1>
              <p className="mt-2 text-sm text-ink-muted">
                {t.connexion?.subtitle || "Connectez-vous pour accéder à votre espace personnel"}
              </p>
            </div>

            {success && (
              <div className="mb-6 flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-700">
                <CheckCircle size={20} />
                <span className="text-sm font-medium">{t.connexion?.successMessage || "Connexion réussie ! Redirection..."}</span>
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
                <label htmlFor="identifier" className="block text-sm font-medium text-ink mb-2">
                  {t.connexion?.identifierLabel || "Email ou numéro de téléphone"}
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-subtle">
                    {isEmail ? <Mail size={18} /> : <Phone size={18} />}
                  </div>
                  <Input
                    id="identifier"
                    type={isEmail ? "email" : "tel"}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={isEmail ? "vous@exemple.com" : "+261 3X XX XX XX"}
                    className="pl-11"
                    autoComplete="username"
                    disabled={success}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-ink mb-2">
                  {t.connexion?.passwordLabel || "Mot de passe"}
                </label>
                <div className="relative">
                  <Lock size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-subtle" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.connexion?.passwordPlaceholder || "••••••••"}
                    className="pl-11 pr-11"
                    autoComplete="current-password"
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
                {t.connexion?.submit || "Se connecter"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-ink-muted">
                {t.connexion?.noAccount || "Pas encore de compte ?"}{" "}
                <Link
                  href="/inscription"
                  className="font-semibold text-brand hover:text-brand-hover transition-colors"
                >
                  {t.connexion?.signupLink || "S'inscrire"}
                </Link>
              </p>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-ink-subtle">
                {t.connexion?.demoNote || "Mode démo : tout identifiant/mot de passe fonctionne"}
              </p>
            </div>
          </Card>
        </div>
      </Container>
    </div>
  );
}