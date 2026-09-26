"use client";

import { useEffect, useState } from "react";
import { CalendarPlus, MapPin, Phone, SlidersHorizontal, Stethoscope } from "lucide-react";
import { useLang } from "@/lib/context/LangContext";
import { apiFetch } from "@/lib/api";
import { useSession } from "@/lib/context/SessionContext";
import { Container } from "@/components/layout/Container";
import { PageHeader, EmptyState } from "@/components/ui/PageHeader";
import { Badge, Dot } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/Field";

type Professional = { id: string; name: string; title: string; city: string; languages: string[]; specialties: string[]; phone: string | null; bio: string | null; acceptsNewPatients: boolean; contactEnabled: boolean; isFictional: boolean };
type Filters = { cities: string[]; specialties: string[] };
type List = { items: Professional[]; total: number };

export default function AnnuairePage() {
  const { t } = useLang();
  const { ensureSession } = useSession();
  const [city, setCity] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [filters, setFilters] = useState<Filters>({ cities: [], specialties: [] });
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selected, setSelected] = useState<Professional | null>(null);
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { void apiFetch<Filters>("/api/annuaire/filters", { auth: false }).then(setFilters).catch((cause) => setError(cause instanceof Error ? cause.message : "Annuaire indisponible.")); }, []);
  useEffect(() => {
    let active = true;
    setLoading(true);
    const params = new URLSearchParams({ limit: "50", includeFictional: "true" });
    if (city) params.set("city", city);
    if (specialty) params.set("specialty", specialty);
    if (onlyAvailable) params.set("acceptsNewPatients", "true");
    void apiFetch<List>(`/api/annuaire/professionals?${params}`, { auth: false })
      .then((result) => { if (active) { setProfessionals(result.items); setError(""); } })
      .catch((cause) => active && setError(cause instanceof Error ? cause.message : "Annuaire indisponible."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [city, specialty, onlyAvailable]);

  const contact = async () => {
    if (!selected) return;
    try {
      await ensureSession();
      const result = await apiFetch<{ notice: string }>(`/api/annuaire/professionals/${selected.id}/contact`, { method: "POST", body: JSON.stringify({ message }) });
      setNotice(result.notice);
      setSelected(null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "La demande n'a pas pu être envoyée."); }
  };
  const reset = () => { setCity(""); setSpecialty(""); setOnlyAvailable(false); };

  return <>
    <Container size="wide" className="animate-fade-rise flex flex-col gap-7 py-10 sm:py-12">
      <PageHeader title={t.annuaire.pageTitle} subtitle={t.annuaire.pageSubtitle} />
      <Card className="gap-4 p-5"><div className="flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-sm font-semibold text-ink"><SlidersHorizontal size={15} className="text-brand" />{t.annuaire.filters}</h2>{(city || specialty || onlyAvailable) && <Button variant="ghost" size="sm" onClick={reset}>{t.annuaire.reset}</Button>}</div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] lg:items-center"><Select value={city} onChange={(event) => setCity(event.target.value)}><option value="">{t.annuaire.allCities}</option>{filters.cities.map((value) => <option key={value} value={value}>{value}</option>)}</Select><Select value={specialty} onChange={(event) => setSpecialty(event.target.value)}><option value="">{t.annuaire.allTitles}</option>{filters.specialties.map((value) => <option key={value} value={value}>{value}</option>)}</Select><Checkbox checked={onlyAvailable} onChange={(event) => setOnlyAvailable(event.target.checked)} label={t.annuaire.availableOnly} className="h-11 px-1 lg:whitespace-nowrap" /></div>
      </Card>
      {notice && <p role="status" className="rounded-xl bg-brand-soft p-4 text-sm text-ink-muted">{notice}</p>}{error && <p role="alert" className="rounded-xl bg-danger-soft p-4 text-sm text-danger">{error}</p>}
      <p className="text-[0.8125rem] text-ink-muted">{t.annuaire.results.replace("{count}", String(professionals.length))}</p>
      {loading ? <p className="text-center text-ink-muted">Chargement…</p> : professionals.length === 0 ? <EmptyState icon={<Stethoscope size={22} />} title={t.annuaire.noResult} action={<Button variant="outline" onClick={reset}>{t.annuaire.reset}</Button>} /> : <ul className="grid gap-4 sm:grid-cols-2">{professionals.map((pro) => <li key={pro.id}><Card className="h-full gap-4 p-5 sm:p-6"><div className="flex items-start gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand"><Stethoscope size={20} /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-[0.9375rem] font-bold text-ink">{pro.name}</h2><Badge tone={pro.acceptsNewPatients ? "success" : "neutral"} icon={<Dot tone={pro.acceptsNewPatients ? "success" : "neutral"} />}>{pro.acceptsNewPatients ? t.annuaire.available : t.annuaire.unavailable}</Badge></div><p className="mt-0.5 text-[0.8125rem] font-medium text-brand">{pro.title}</p><p className="mt-1 flex items-center gap-1.5 text-[0.78rem] text-ink-muted"><MapPin size={12} />{pro.city}</p></div></div><p className="text-[0.8125rem] leading-relaxed text-ink-muted">{pro.bio ?? pro.specialties.join(", ")}</p><div className="flex flex-wrap gap-1.5">{pro.languages.map((language) => <Badge key={language} tone="neutral">{language}</Badge>)}</div><div className="mt-auto flex gap-2.5 border-t border-line pt-4">{pro.phone && <a href={`tel:${pro.phone}`} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full border border-line-strong text-[0.8125rem] font-semibold text-ink"><Phone size={15} />{t.annuaire.call}</a>}<Button size="sm" className="h-10 flex-1" disabled={!pro.contactEnabled} onClick={() => { setSelected(pro); setMessage(""); }}><CalendarPlus size={15} />{t.annuaire.rdv}</Button></div></Card></li>)}</ul>}
    </Container>
    <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} title={t.annuaire.rdvTitle} description={t.annuaire.rdvNote} footer={<><Button variant="outline" onClick={() => setSelected(null)}>{t.annuaire.cancel}</Button><Button onClick={() => void contact()}>{t.annuaire.send}</Button></>}>
      {selected && <div className="flex flex-col gap-4"><p className="font-semibold text-ink">{selected.name}</p><Field label={t.annuaire.rdvReason} htmlFor="contact-message"><Textarea id="contact-message" value={message} onChange={(event) => setMessage(event.target.value)} rows={4} /></Field></div>}
    </Dialog>
  </>;
}
