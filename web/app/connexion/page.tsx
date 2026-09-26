"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Leaf, AlertCircle, CheckCircle } from "lucide-react";
import { useLang } from "@/lib/context/LangContext";
import { useSession } from "@/lib/context/SessionContext";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function ConnexionPage() {
  const router = useRouter();
  const { t, lang } = useLang();
  const { ensureSession } = useSession();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setSuccess(false);

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
                  <Leaf size={22} aria-hidden />
                </span>
                <h2 className="text-h3 text-ink">{t.connexion?.title || "Connexion"}</h2>
                <p className="mt-2 text-sm text-ink-muted">{t.connexion.anonymousNote}</p>
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

              <Button onClick={() => void handleSubmit()} size="lg" className="w-full" disabled={loading || success} loading={loading}>
                {t.connexion.submit}
              </Button>

              <p className="mt-6 text-center text-sm text-ink-muted">
                {t.connexion.noAccount}{" "}
                <Link
                  href="/inscription"
                  className="font-semibold text-brand transition-colors hover:text-brand-hover"
                >
                  {t.connexion.signupLink}
                </Link>
              </p>
            </Card>
          </div>
        </Container>
      </main>
    </div>
  );
}
