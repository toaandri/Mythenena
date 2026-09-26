"use client";

import { useEffect, useState } from "react";
import { Check, Sparkles, Gem, CalendarClock } from "lucide-react";
import { useLang, type Translations } from "@/lib/context/LangContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { cn } from "@/lib/utils";

type Offer = {
  id: "free" | "essential" | "intensive";
  badge: string;
  name: string;
  subtitle: string;
  stat: string;
  priceMGA: number;
  priceEUR: number;
  priceNote: string;
  features: string[];
  note?: string;
  cta: string;
  popular?: boolean;
};

const OFFERS: Offer[] = [
  {
    id: "free",
    badge: "offers.freeLabel",
    name: "offers.free.name",
    subtitle: "offers.free.subtitle",
    stat: "offers.free.stat",
    priceMGA: 0,
    priceEUR: 0,
    priceNote: "offers.free.priceNote",
    features: [
      "offers.free.feature1",
      "offers.free.feature2",
      "offers.free.feature3",
    ],
    note: "offers.free.note",
    cta: "offers.free.cta",
  },
  {
    id: "essential",
    badge: "offers.premiumLabel",
    name: "offers.essential.name",
    subtitle: "offers.essential.subtitle",
    stat: "offers.essential.stat",
    priceMGA: 115000,
    priceEUR: 25,
    priceNote: "offers.essential.priceNote",
    features: [
      "offers.essential.feature1",
      "offers.essential.feature2",
      "offers.essential.feature3",
    ],
    cta: "offers.essential.cta",
    popular: true,
  },
  {
    id: "intensive",
    badge: "offers.premiumLabel",
    name: "offers.intensive.name",
    subtitle: "offers.intensive.subtitle",
    stat: "offers.intensive.stat",
    priceMGA: 207000,
    priceEUR: 45,
    priceNote: "offers.intensive.priceNote",
    features: [
      "offers.intensive.feature1",
      "offers.intensive.feature2",
      "offers.intensive.feature3",
    ],
    cta: "offers.intensive.cta",
  },
];

function tr(t: unknown, path: string): string {
  const value = path
    .split(".")
    .reduce<unknown>(
      (acc, key) =>
        acc && typeof acc === "object"
          ? (acc as Record<string, unknown>)[key]
          : undefined,
      t
    );
  return typeof value === "string" ? value : "";
}

function formatMGA(value: number): string {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00A0");
}

export function OffersButton() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const handleSelectOffer = (offer: Offer) => {
    setSelectedOffer(offer);
    setOpen(false);
  };

  const selectedIsFree = selectedOffer?.priceMGA === 0;

  return (
    <>
      <Button
        variant="soft"
        onClick={() => setOpen(true)}
        className="h-10 shrink-0 rounded-xl px-4 hidden sm:inline-flex items-center gap-2 bg-premium-soft text-premium hover:bg-premium/20 hover:text-premium transition-all duration-200"
        aria-label={tr(t, "offers.title") || "Premium"}
      >
        <Gem size={18} aria-hidden className="text-premium" />
        <span className="text-sm font-semibold text-premium">
          {tr(t, "offers.buttonLabel") || "Premium"}
        </span>
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={tr(t, "offers.modalTitle") || "Choisir votre offre Premium"}
        description={tr(t, "offers.modalDesc")}
        className="max-w-5xl sm:max-w-5xl"
        footer={
          <p className="w-full text-center text-tiny text-ink-subtle">
            {tr(t, "offers.modalFoot")}
          </p>
        }
      >
        <div className="grid gap-4 md:grid-cols-3 md:gap-5">
          {OFFERS.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              t={t}
              onSelect={() => handleSelectOffer(offer)}
              isPopular={offer.popular}
            />
          ))}
        </div>
      </Dialog>

      {selectedOffer && (
        <Dialog
          open={!!selectedOffer}
          onClose={() => setSelectedOffer(null)}
          title={tr(t, "offers.bookingTitle")}
          description={selectedIsFree
            ? `${tr(t, selectedOffer.name)} — ${tr(t, "offers.freeText")}`
            : `${tr(t, selectedOffer.name)} — ${formatMGA(selectedOffer.priceMGA)} Ar / ${selectedOffer.priceEUR} € ${tr(t, "offers.perMonth")}`}
          className="max-w-md"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-premium-line bg-premium-softer p-5">
              <Gem size={22} aria-hidden className="text-premium" />
              {selectedIsFree ? (
                <span className="text-2xl font-extrabold tracking-tight text-ink">
                  {tr(t, "offers.freeText")}
                </span>
              ) : (
                <span className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold leading-none tracking-[-0.03em] text-ink tabular-nums">
                    {formatMGA(selectedOffer.priceMGA)}
                  </span>
                  <span className="text-base font-semibold text-premium">Ar</span>
                </span>
              )}
              <span className="text-xs font-medium text-ink-muted">
                {selectedIsFree
                  ? `≈ 0 €`
                  : `≈ ${selectedOffer.priceEUR} € · ${tr(t, "offers.perMonth")}`}
              </span>
            </div>
            <p className="text-center text-sm leading-relaxed text-ink-muted">
              {tr(t, "offers.bookingDesc")}
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setSelectedOffer(null)}
                className="flex-1"
              >
                {tr(t, "offers.back")}
              </Button>
              <Button
                onClick={() => {
                  setSelectedOffer(null);
                  window.location.href = "/annuaire";
                }}
                className="flex-1 bg-premium text-premium-on hover:bg-premium-hover"
              >
                {tr(t, "offers.bookNow")}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
}

function OfferCard({
  offer,
  t,
  onSelect,
  isPopular,
}: {
  offer: Offer;
  t: Translations;
  onSelect: () => void;
  isPopular?: boolean;
}) {
  const isFree = offer.priceMGA === 0;

  return (
    <Card
      className={cn(
        "relative flex h-full flex-col overflow-hidden p-5 transition-all duration-300 ease-out md:p-6",
        isPopular
          ? "border-premium-line bg-gradient-to-b from-premium-softer via-surface to-surface shadow-xl ring-1 ring-premium/60"
          : "hover:-translate-y-1 hover:border-premium-line hover:shadow-lg"
      )}
    >
      {isPopular && (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-14 -top-16 h-44 w-44 rounded-full bg-premium/10 blur-2xl"
        />
      )}

      <div
        aria-hidden
        className={cn(
          "absolute inset-x-0 top-0 h-1",
          isPopular
            ? "bg-gradient-to-r from-premium via-premium/50 to-premium/10"
            : "bg-gradient-to-r from-premium/35 to-transparent"
        )}
      />

      {isPopular && (
        <span className="absolute right-5 top-0 inline-flex items-center gap-1.5 rounded-b-xl bg-premium px-3 py-1.5 text-tiny font-semibold uppercase tracking-[0.08em] text-premium-on shadow-md">
          <Gem size={11} aria-hidden />
          {tr(t, "offers.popular")}
        </span>
      )}

      <div className="relative flex items-start gap-3">
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
            isFree ? "bg-surface-3 text-ink-muted" : "bg-premium-soft text-premium"
          )}
        >
          {isFree ? (
            <Sparkles size={20} aria-hidden />
          ) : (
            <Gem size={20} aria-hidden />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-tiny font-semibold uppercase tracking-[0.08em]",
              isFree ? "bg-surface-3 text-ink-muted" : "bg-premium-soft text-premium"
            )}
          >
            {tr(t, offer.badge)}
          </span>
          <h3 className="mt-2 text-xl font-bold leading-tight tracking-[-0.02em] text-ink">
            {tr(t, offer.name)}
          </h3>
          <p className="mt-1 text-sm text-ink-muted">{tr(t, offer.subtitle)}</p>
        </div>
      </div>

      <div
        className={cn(
          "relative mt-5 rounded-2xl border p-4",
          isPopular ? "border-premium-line bg-premium-softer/70" : "border-line bg-surface-2/70"
        )}
      >
        <div className="flex items-baseline gap-1.5">
          <span className="text-[2.125rem] font-extrabold leading-none tracking-[-0.03em] text-ink tabular-nums">
            {formatMGA(offer.priceMGA)}
          </span>
          <span
            className={cn(
              "text-lg font-semibold",
              isPopular ? "text-premium" : "text-ink-muted"
            )}
          >
            Ar
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs font-medium text-ink-muted">
          <span>≈ {offer.priceEUR}&nbsp;€</span>
          <span aria-hidden className="text-ink-subtle">
            &middot;
          </span>
          <span>{isFree ? tr(t, "offers.freeText") : tr(t, "offers.perMonth")}</span>
        </div>
        <p className="mt-2.5 text-tiny uppercase tracking-[0.08em] text-ink-subtle">
          {tr(t, offer.priceNote)}
        </p>
      </div>

      <p
        className={cn(
          "mt-3 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-tiny font-semibold",
          isFree ? "bg-surface-3 text-ink-muted" : "bg-premium-soft text-premium"
        )}
      >
        <CalendarClock size={12} aria-hidden />
        {tr(t, offer.stat)}
      </p>

      <div className="mt-6">
        <p className="text-tiny font-semibold uppercase tracking-[0.1em] text-ink-subtle">
          {tr(t, "offers.inLabel")}
        </p>
        <ul className="mt-3 space-y-2.5">
          {offer.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                  isFree ? "bg-surface-3 text-ink-muted" : "bg-premium-soft text-premium"
                )}
              >
                <Check size={12} strokeWidth={3} aria-hidden />
              </span>
              <span className="text-sm leading-relaxed text-ink-muted">
                {tr(t, feature)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto pt-6">
        {offer.note && (
          <p className="mb-4 flex items-start gap-2 rounded-xl border border-line bg-surface-2/70 p-3 text-tiny leading-relaxed text-ink-muted">
            <Sparkles size={13} aria-hidden className="mt-px shrink-0 text-premium" />
            <span>{tr(t, offer.note)}</span>
          </p>
        )}
        <Button
          onClick={onSelect}
          size="lg"
          variant={isPopular ? "primary" : "outline"}
          className={cn(
            "w-full",
            isPopular &&
              "bg-premium text-premium-on shadow-[0_6px_20px_rgb(var(--premium)/0.32)] hover:bg-premium-hover hover:shadow-[0_8px_26px_rgb(var(--premium)/0.4)]",
            isFree &&
              "border-line-strong text-ink hover:border-premium-line hover:bg-premium-softer hover:text-premium",
            !isFree &&
              !isPopular &&
              "border-premium-line text-premium hover:border-premium hover:bg-premium-soft hover:text-premium"
          )}
        >
          {tr(t, offer.cta)}
        </Button>
      </div>
    </Card>
  );
}
