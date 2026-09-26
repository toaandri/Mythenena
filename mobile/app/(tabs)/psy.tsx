import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Text, TextInput } from '@/components/OutfitText';
import { useI18n } from '@/lib/i18n';
import { useSession } from '@/lib/session';
import { apiFetch } from '@/lib/api';
import { useSocialCopy } from '@/lib/socialCopy';
import { Avatar, Button, Chip, Heading, Page, s } from '@/components/social/ui';

type Professional = { id: string; name: string; title: string; city: string; languages: string[]; specialties: string[]; bio: string | null; isFictional: boolean; contactEnabled: boolean; fee?: string | null; schedule?: string | null };
export default function PsyTab() {
  const { t, language } = useI18n(); const c = useSocialCopy(); const { ensureSession } = useSession();
  const [items, setItems] = useState<Professional[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(false); const [revision, setRevision] = useState(0);
  const [filter, setFilter] = useState(''); const [city, setCity] = useState(''); const [specialty, setSpecialty] = useState(''); const [modality, setModality] = useState(''); const [availableOnly, setAvailableOnly] = useState(false); const [filtersOpen, setFiltersOpen] = useState(false); const [selected, setSelected] = useState<Professional | null>(null);
  const [form, setForm] = useState(false); const [message, setMessage] = useState(''); const [sending, setSending] = useState(false); const [saved, setSaved] = useState(false);
  const refresh = () => { setLoading(true); setError(false); setRevision(value => value + 1); };
  useEffect(() => { let current = true;
    apiFetch<{ items: Professional[] }>('/api/annuaire/professionals?limit=50&includeFictional=true', { auth: false }).then(data => { if (current) setItems(data.items); }).catch(() => { if (current) setError(true); }).finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [revision]);
  const contact = async () => {
    if (!selected || sending || !message.trim()) return; setSending(true); setError(false);
    try { await ensureSession(language === 'mg' ? 'mg' : 'fr'); await apiFetch(`/api/annuaire/professionals/${encodeURIComponent(selected.id)}/contact`, { method: 'POST', body: JSON.stringify({ message: message.trim() }) }); setSaved(true); setForm(false); setMessage(''); }
    catch { setError(true); } finally { setSending(false); }
  };
  const visible = items.filter(item => (!filter || item.languages.some(value => value.toLowerCase() === filter || (filter === 'fr' && value.toLowerCase().startsWith('fran')) || (filter === 'mg' && /malagasy|malgache/i.test(value)))) && (!city || item.city === city) && (!specialty || item.specialties.includes(specialty)) && (!modality || (item as Professional & { modalities?: string[] }).modalities?.includes(modality)) && (!availableOnly || item.contactEnabled));
  const cities = [...new Set(items.map(item => item.city))];
  const specialties = [...new Set(items.flatMap(item => item.specialties))].slice(0, 12);
  return <Page>{selected ? <>
    <Button label={c('back')} secondary disabled={sending} onPress={() => { setSelected(null); setForm(false); setSaved(false); setMessage(''); setError(false); }} />
    <Avatar name={selected.name} /><Heading label={selected.title} title={selected.name} />
    <View style={s.card}><Text style={s.name}>{c('about')}</Text><Text style={s.text}>{selected.bio || selected.specialties.join(' · ')}</Text>
      <Text style={s.name}>{c('specialty')}</Text><Text style={s.muted}>{selected.specialties.join(' · ')}</Text>
      <Text style={s.name}>{c('languages')}</Text><Text style={s.muted}>{selected.languages.join(' · ')}</Text>
      <Text style={s.name}>{c('location')}</Text><Text style={s.muted}>{selected.city}</Text>
      {(selected.fee || selected.schedule) && <Text style={s.muted}>{[selected.fee, selected.schedule].filter(Boolean).join(' · ')}</Text>}
    </View><View style={s.banner}><Text style={s.small}>{c('terms')}</Text></View>
    {saved ? <Text accessibilityLiveRegion="polite" style={s.name}>{c('saved')}</Text> : form ? <View style={s.card}><TextInput accessibilityLabel={c('write')} placeholder={c('write')} value={message} onChangeText={setMessage} multiline maxLength={1000} style={[s.input, s.textarea]} /><Button label={c('request')} onPress={contact} busy={sending} disabled={!message.trim()} /><Button label={c('cancel')} secondary disabled={sending} onPress={() => setForm(false)} /></View> : selected.contactEnabled && <Button label={c('contact')} onPress={() => setForm(true)} />}
  </> : <><Heading label={t('psy.title')} title={c('care')} subtitle={t('psy.subtitle')} /><Button label={`☰ ${filtersOpen ? 'Masquer les filtres' : 'Filtres'}${filter || city || specialty || modality || availableOnly ? ' · actifs' : ''}`} secondary onPress={() => setFiltersOpen(value => !value)} />{filtersOpen && <View style={[s.card, { gap: 10 }]}><Text style={s.name}>Filtrer les profils</Text><View style={s.wrap}>{[['', c('all')], ['fr', 'Français'], ['mg', 'Malagasy']].map(([value, label]) => <Chip key={value} label={label} active={filter === value} onPress={() => setFilter(value)} />)}</View><Text style={s.small}>Ville</Text><View style={s.wrap}><Chip label="Toutes" active={!city} onPress={() => setCity('')} />{cities.map(value => <Chip key={value} label={value} active={city === value} onPress={() => setCity(value)} />)}</View><Text style={s.small}>Spécialité</Text><View style={s.wrap}><Chip label="Toutes" active={!specialty} onPress={() => setSpecialty('')} />{specialties.map(value => <Chip key={value} label={value} active={specialty === value} onPress={() => setSpecialty(value)} />)}</View><Text style={s.small}>Format</Text><View style={s.wrap}><Chip label="Tous" active={!modality} onPress={() => setModality('')} /><Chip label="En ligne" active={modality === 'online'} onPress={() => setModality('online')} /><Chip label="Sur place" active={modality === 'in-person'} onPress={() => setModality('in-person')} /><Chip label="Disponible" active={availableOnly} onPress={() => setAvailableOnly(value => !value)} /></View></View>}
    {loading ? <ActivityIndicator color="#276653" /> : visible.map(item => <View key={item.id} style={s.card}><View style={s.row}><Avatar name={item.name} /><View style={s.grow}><Text style={s.name}>{item.name}</Text><Text style={s.muted}>{item.title}</Text></View></View>{item.isFictional && <View style={s.banner}><Text style={s.small}>Profil fictif de démonstration · aucun contact réel</Text></View>}<View style={s.wrap}>{item.specialties.map(value => <Text key={value} style={[s.small, { backgroundColor: '#e6ede5', borderRadius: 12, padding: 7 }]}>{value}</Text>)}</View><Text style={s.muted}>{item.city} · {item.languages.join(' / ')}</Text>{item.bio && <Text numberOfLines={3} style={s.text}>{item.bio}</Text>}<Button label={c('profile')} secondary onPress={() => setSelected(item)} /></View>)}
    {!loading && !error && !visible.length && <View style={s.card}><Text style={s.name}>{t('psy.emptyTitle')}</Text><Text style={s.muted}>{t('psy.emptySubtitle')}</Text></View>}
  </>}{error && <View style={s.banner}><Text accessibilityRole="alert" style={s.error}>{c('error')}</Text>{!selected && <Button label={c('retry')} secondary onPress={() => refresh()} />}</View>}</Page>;
}
