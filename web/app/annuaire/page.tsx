"use client";

import { useMemo, useState } from "react";
import { CalendarPlus, MapPin, Phone, SlidersHorizontal, Stethoscope } from "lucide-react";
import { useLang } from "@/lib/context/LangContext";
import { Container } from "@/components/layout/Container";
import { PageHeader, EmptyState } from "@/components/ui/PageHeader";
import { Badge, Dot } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

type Pro = {
  id: number;
  name: string;
  title: string;
  city: string;
  lang: string[];
  years: number;
  available: boolean;
  bioKey: string;
  phone: string;
};

const PROFESSIONALS: Pro[] = [
  { id: 1, name: "Dr. Hanta Rakoto", title: "Psychiatre", city: "Antananarivo", lang: ["Français", "Malagasy"], years: 15, available: true, bioKey: "bio1", phone: "+26120220001" },
  { id: 2, name: "Dr. Jean Dubois", title: "Psychologue clinicien", city: "Antananarivo", lang: ["Français"], years: 12, available: true, bioKey: "bio2", phone: "+26120220002" },
  { id: 3, name: "Mme. Voahangy Andria", title: "Psychologue", city: "Toamasina", lang: ["Français", "Malagasy"], years: 8, available: false, bioKey: "bio3", phone: "+26120530003" },
  { id: 4, name: "Dr. Fidy Rasolofo", title: "Psychiatre", city: "Fianarantsoa", lang: ["Malagasy"], years: 10, available: true, bioKey: "bio4", phone: "+26120750004" },
  { id: 5, name: "Mme. Claire Martin", title: "Psychologue clinicien", city: "Mahajanga", lang: ["Français"], years: 6, available: false, bioKey: "bio5", phone: "+26120620005" },
  { id: 6, name: "Dr. Nivo Rabemanana", title: "Psychiatre", city: "Antananarivo", lang: ["Français", "Malagasy"], years: 20, available: true, bioKey: "bio6", phone: "+26120220006" },
];

const CITIES = ["Antananarivo", "Toamasina", "Fianarantsoa", "Mahajanga"];
const TITLES = ["Psychiatre", "Psychologue clinicien", "Psychologue"];

export default function AnnuairePage() {
  const { t } = useLang();
  const [city, setCity] = useState("");
  const [speciality, setSpeciality] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [selected, setSelected] = useState<Pro | null>(null);
  const [request, setRequest] = useState({ slot: "", reason: "" });

  const filtered = useMemo(
    () =>
      PROFESSIONALS.filter(
        (p) =>
          (!city || p.city === city) &&
          (!speciality || p.title === speciality) &&
          (!onlyAvailable || p.available)
      ),
    [city, speciality, onlyAvailable]
  );

  const isFiltered = Boolean(city || speciality || onlyAvailable);

  const reset = () => {
    setCity("");
    setSpeciality("");
    setOnlyAvailable(false);
  };

  return (
    <>
      <Container size="wide" className="animate-fade-rise flex flex-col gap-7 py-10 sm:py-12">
        <PageHeader title={t.annuaire.pageTitle} subtitle={t.annuaire.pageSubtitle} />

        {/* Filtres */}
        <Card className="gap-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
              <SlidersHorizontal size={15} className="text-brand" aria-hidden />
              {t.annuaire.filters}
            </h2>
            {isFiltered && (
              <Button variant="ghost" size="sm" onClick={reset}>
                {t.annuaire.reset}
              </Button>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] lg:items-center">
            <Select value={city} onChange={(e) => setCity(e.target.value)} aria-label={t.annuaire.allCities}>
              <option value="">{t.annuaire.allCities}</option>
              {CITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>

            <Select
              value={speciality}
              onChange={(e) => setSpeciality(e.target.value)}
              aria-label={t.annuaire.allTitles}
            >
              <option value="">{t.annuaire.allTitles}</option>
              {TITLES.map((tk) => (
                <option key={tk}>{tk}</option>
              ))}
            </Select>

            <Checkbox
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              label={t.annuaire.availableOnly}
              className="h-11 px-1 lg:whitespace-nowrap"
            />
          </div>
        </Card>

        <p className="text-[0.8125rem] text-ink-muted">
          {t.annuaire.results.replace("{count}", String(filtered.length))}
        </p>

        {/* Cartes */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Stethoscope size={22} aria-hidden />}
            title={t.annuaire.noResult}
            action={
              <Button variant="outline" onClick={reset}>
                {t.annuaire.reset}
              </Button>
            }
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {filtered.map((pro) => (
              <li key={pro.id}>
                <Card className="h-full gap-4 p-5 transition-shadow duration-300 hover:shadow-md sm:p-6">
                  <div className="flex items-start gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                      <Stethoscope size={20} aria-hidden />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-[0.9375rem] font-bold tracking-[-0.01em] text-ink">{pro.name}</h2>
                        <Badge tone={pro.available ? "success" : "neutral"} icon={<Dot tone={pro.available ? "success" : "neutral"} />}>
                          {pro.available ? t.annuaire.available : t.annuaire.unavailable}
                        </Badge>
                      </div>

                      <p className="mt-0.5 text-[0.8125rem] font-medium text-brand">{pro.title}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-[0.78rem] text-ink-muted">
                        <MapPin size={12} aria-hidden />
                        {pro.city} · {pro.years} {t.annuaire.years}
                      </p>
                    </div>
                  </div>

                  <p className="text-[0.8125rem] leading-relaxed text-ink-muted">
                    {t.annuaire[pro.bioKey as keyof typeof t.annuaire]}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {pro.lang.map((l) => (
                      <Badge key={l} tone="neutral">
                        {l}
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-auto flex gap-2.5 border-t border-line pt-4">
                    <a
                      href={`tel:${pro.phone}`}
                      className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full border border-line-strong text-[0.8125rem] font-semibold text-ink transition-colors hover:border-brand hover:bg-brand-softer hover:text-brand"
                    >
                      <Phone size={15} aria-hidden />
                      {t.annuaire.call}
                    </a>
                    <Button
                      size="sm"
                      className="h-10 flex-1"
                      onClick={() => {
                        setSelected(pro);
                        setRequest({ slot: "", reason: "" });
                      }}
                    >
                      <CalendarPlus size={15} aria-hidden />
                      {t.annuaire.rdv}
                    </Button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </Container>

      <Dialog
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={t.annuaire.rdvTitle}
        description={t.annuaire.rdvNote}
        footer={
          <>
            <Button variant="outline" onClick={() => setSelected(null)} className="sm:min-w-32">
              {t.annuaire.cancel}
            </Button>
            <Button
              className="sm:min-w-40"
              disabled={!request.slot.trim()}
              onClick={() => setSelected(null)}
            >
              {t.annuaire.send}
            </Button>
          </>
        }
      >
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 rounded-xl border border-brand-line bg-brand-softer p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-brand-on">
                <Stethoscope size={17} aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{selected.name}</p>
                <p className="text-[0.78rem] text-ink-muted">
                  {selected.title} · {selected.city}
                </p>
              </div>
            </div>

            <Field label={t.annuaire.rdvAvailability} htmlFor="rdv-slot">
              <Input
                id="rdv-slot"
                value={request.slot}
                onChange={(e) => setRequest((r) => ({ ...r, slot: e.target.value }))}
                placeholder="ex: lundi matin"
              />
            </Field>

            <Field label={t.annuaire.rdvReason} htmlFor="rdv-reason">
              <Textarea
                id="rdv-reason"
                value={request.reason}
                onChange={(e) => setRequest((r) => ({ ...r, reason: e.target.value }))}
                placeholder={t.annuaire.rdvReason}
                rows={3}
              />
            </Field>
          </div>
        )}
      </Dialog>
    </>
  );
}
