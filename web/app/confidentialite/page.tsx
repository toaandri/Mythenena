"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Shield, Lock, FileText, Users, Heart, AlertCircle, Mail, Phone } from "lucide-react";
import { useLang } from "@/lib/context/LangContext";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function ConfidentialitePage() {
  const { t } = useLang();

  const sections = [
    {
      icon: Shield,
      title: "confidentialite.sections.dataProtection.title",
      content: "confidentialite.sections.dataProtection.content",
    },
    {
      icon: Lock,
      title: "confidentialite.sections.anonymity.title",
      content: "confidentialite.sections.anonymity.content",
    },
    {
      icon: FileText,
      title: "confidentialite.sections.dataUsage.title",
      content: "confidentialite.sections.dataUsage.content",
    },
    {
      icon: Users,
      title: "confidentialite.sections.sharing.title",
      content: "confidentialite.sections.sharing.content",
    },
    {
      icon: Heart,
      title: "confidentialite.sections.rights.title",
      content: "confidentialite.sections.rights.content",
    },
    {
      icon: AlertCircle,
      title: "confidentialite.sections.limits.title",
      content: "confidentialite.sections.limits.content",
    },
    {
      icon: Mail,
      title: "confidentialite.sections.contact.title",
      content: "confidentialite.sections.contact.content",
    },
  ];

  return (
    <div className="min-h-dvh bg-bg">
      <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-shell items-center gap-3 px-4">
          <button
            onClick={() => window.history.back()}
            className="flex-shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-3 hover:text-ink"
            aria-label="Retour"
          >
            <ArrowLeft size={19} />
          </button>
          <h1 className="text-base font-semibold text-ink">{t.confidentialite?.title || "Conditions de confidentialité"}</h1>
        </div>
      </header>

      <main className="py-8 pb-16">
        <Container size="wide">
          <div className="space-y-6">
            <Card className="p-6">
              <p className="text-ink-muted leading-relaxed">
                {t.confidentialite?.intro || "Dernière mise à jour : Septembre 2026. Mythenena s'engage à protéger votre vie privée. Cette politique explique quelles données nous collectons, comment nous les utilisons et vos droits."}
              </p>
            </Card>

            {sections.map((section, i) => {
              // Extract the key from the path (e.g., "confidentialite.sections.dataProtection.title" -> "dataProtection")
              const key = section.title.split('.')[2];
              return (
                <Card key={i} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
                      <section.icon size={18} aria-hidden />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-ink">
                        {t.confidentialite?.sections?.[key as keyof typeof t.confidentialite.sections]?.title}
                      </h2>
                      <p className="mt-2 text-sm text-ink-muted leading-relaxed">
                        {t.confidentialite?.sections?.[key as keyof typeof t.confidentialite.sections]?.content}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}

            <Card className="p-6 border-brand/50 bg-brand-soft/50">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5 text-brand" />
                <div>
                  <h2 className="text-lg font-semibold text-ink">{t.confidentialite?.importantTitle || "Point important"}</h2>
                  <p className="mt-2 text-sm text-ink-muted leading-relaxed">
                    {t.confidentialite?.importantContent || "Mythenena est un outil d'écoute et d'information, pas un service médical. En cas d'urgence, contactez les services d'urgence (+261 20 22 XXX XX) ou rendez-vous aux urgences."}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </main>
    </div>
  );
}