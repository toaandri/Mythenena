import React, { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { Text, TextInput } from '@/components/OutfitText';
import { useI18n } from '@/lib/i18n';
import { useSession } from '@/lib/session';
import { apiFetch } from '@/lib/api';
import { useSocialCopy } from '@/lib/socialCopy';
import { Avatar, Button, Chip, Heading, Page, s } from '@/components/social/ui';

type Category = { id: string; slug: string; labelFr: string; labelMg: string };
type Post = { id: string; pseudonym: string; content: string; createdAt: string; repliesCount: number; reactions: { type: string; count: number; active: boolean }[] };
type Detail = { post: Post; replies: Post[] };
export default function ForumTab() {
  const { t, language } = useI18n(); const c = useSocialCopy(); const { ensureSession } = useSession();
  const [categories, setCategories] = useState<Category[]>([]); const [category, setCategory] = useState(''); const [sort, setSort] = useState<'recent' | 'discussed' | 'oldest'>('recent'); const [postCategory, setPostCategory] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]); const [postId, setPostId] = useState<string | null>(null); const [detail, setDetail] = useState<Detail | null>(null);
  const [screen, setScreen] = useState<'feed' | 'compose' | 'rules' | 'report'>('feed');
  const [content, setContent] = useState(''); const [reply, setReply] = useState(''); const [report, setReport] = useState(''); const [reportId, setReportId] = useState('');
  const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false); const [error, setError] = useState(false); const [notice, setNotice] = useState(false); const [revision, setRevision] = useState(0);
  const refresh = () => { setLoading(true); setError(false); setRevision(value => value + 1); };
  useFocusEffect(useCallback(() => {
    setLoading(true);
    setError(false);
    setRevision(value => value + 1);
  }, []));
  useEffect(() => { let current = true;
    const query = `${category ? `&category=${encodeURIComponent(category)}` : ''}&sort=${sort}`;
    Promise.all([apiFetch<{ categories: Category[] }>('/api/forum/categories'), postId ? apiFetch<Detail>(`/api/forum/posts/${encodeURIComponent(postId)}`) : apiFetch<{ items: Post[] }>(`/api/forum/posts?limit=50${query}`)])
      .then(([cats, data]) => { if (!current) return; setCategories(cats.categories); if ('post' in data) setDetail(data); else setPosts(data.items); })
      .catch(() => { if (current) setError(true); }).finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [category, postId, revision, sort]);
  const mutate = async (action: () => Promise<void>) => { if (busy) return; setBusy(true); setError(false); try { await ensureSession(language === 'mg' ? 'mg' : 'fr'); await action(); } catch { setError(true); } finally { setBusy(false); } };
  const publish = () => mutate(async () => { if (!content.trim() || !postCategory) return; await apiFetch('/api/forum/posts', { method: 'POST', body: JSON.stringify({ categoryId: postCategory, content: content.trim() }) }); setContent(''); setScreen('feed'); setCategory(categories.find(item => item.id === postCategory)?.slug || ''); refresh(); });
  const respond = () => mutate(async () => { if (!postId || !reply.trim()) return; const data = await apiFetch<Detail>(`/api/forum/posts/${encodeURIComponent(postId)}/reply`, { method: 'POST', body: JSON.stringify({ content: reply.trim() }) }); setDetail(data); setReply(''); });
  const react = (post: Post) => mutate(async () => { await apiFetch(`/api/forum/posts/${encodeURIComponent(post.id)}/react`, { method: 'POST', body: JSON.stringify({ type: 'support' }) }); refresh(); });
  const sendReport = () => mutate(async () => { await apiFetch('/api/forum/report', { method: 'POST', body: JSON.stringify({ targetId: reportId, targetType: 'post', reason: 'other', details: report.trim() }) }); setReport(''); setScreen('feed'); setNotice(true); });
  const label = (cat: Category) => language === 'mg' ? cat.labelMg : cat.labelFr;
  const back = () => { if (postId) setLoading(true); setScreen('feed'); setPostId(null); setDetail(null); setReply(''); setError(false); setNotice(false); };
  const card = (post: Post, full = false) => {
    const reaction = post.reactions.find(item => item.type === 'support');
    return <View key={post.id} style={s.card}><View style={s.row}><Avatar name={post.pseudonym} /><View style={s.grow}><Text style={s.name}>{post.pseudonym}</Text><Text style={s.small}>{new Date(post.createdAt).toLocaleDateString(language === 'en' ? 'en-GB' : 'fr-FR', { day: 'numeric', month: 'short' })}</Text></View></View><Text style={s.text}>{post.content}</Text><View style={s.wrap}><Button label={`${reaction?.active ? '♥' : '♡'} ${c('support')} · ${reaction?.count || 0}`} secondary={!reaction?.active} disabled={busy} onPress={() => react(post)} />{!full && <Button label={`${c('replies')} · ${post.repliesCount}`} secondary disabled={busy} onPress={() => { setLoading(true); setError(false); setDetail(null); setPostId(post.id); setReply(''); setNotice(false); }} />}</View><Button label={c('report')} secondary disabled={busy} onPress={() => { setReportId(post.id); setReport(''); setScreen('report'); setNotice(false); }} /></View>;
  };
  return <Page>{(screen !== 'feed' || postId) && <Button label={c('back')} secondary disabled={busy} onPress={back} />}
    <Heading label={t('forum.title')} title={screen === 'rules' ? c('rules') : screen === 'compose' ? c('share') : screen === 'report' ? c('report') : postId ? c('replies') : c('forum')} subtitle={screen === 'feed' && !postId ? c('together') : undefined} />
    {error && <View style={s.banner}><Text accessibilityRole="alert" style={s.error}>{c('error')}</Text><Button label={c('retry')} secondary disabled={busy} onPress={() => refresh()} /></View>}
    {notice && <Text accessibilityLiveRegion="polite" style={s.muted}>{c('reported')}</Text>}
    {screen === 'rules' ? <View style={s.card}><Text style={s.text}>{c('respect')}</Text></View> : screen === 'report' ? <View style={s.card}><TextInput accessibilityLabel={c('reason')} value={report} onChangeText={setReport} placeholder={c('reason')} multiline maxLength={1000} style={[s.input, s.textarea]} /><Button label={c('report')} busy={busy} disabled={!report.trim()} onPress={sendReport} /></View> : screen === 'compose' ? <View style={s.card}><View style={s.wrap}>{categories.map(cat => <Chip key={cat.id} label={label(cat)} active={postCategory === cat.id} onPress={() => { if (!busy) setPostCategory(cat.id); }} />)}</View><TextInput accessibilityLabel={c('share')} placeholder={c('share')} value={content} onChangeText={setContent} editable={!busy} multiline maxLength={2000} style={[s.input, s.textarea]} /><Button label={c('publish')} busy={busy} disabled={!content.trim() || !postCategory} onPress={publish} /></View> : <>
      {!postId && <><View style={s.row}><Button label={`＋ ${c('share')}`} disabled={busy || !categories.length} onPress={() => { setPostCategory(categories.find(cat => cat.slug === category)?.id || categories[0]?.id || ''); setScreen('compose'); setNotice(false); }} /><View style={s.grow}><Button label={filtersOpen ? 'Masquer les filtres' : `☰ Filtres${category || sort !== 'recent' ? ' · actifs' : ''}`} secondary onPress={() => setFiltersOpen(value => !value)} /></View></View>{filtersOpen && <View style={[s.card, { gap: 10 }]}><Text style={s.name}>Explorer les discussions</Text><Text style={s.small}>Thématique</Text><View style={s.wrap}><Chip label={c('all')} active={!category} onPress={() => { if (!busy && category) { setLoading(true); setError(false); setCategory(''); } }} />{categories.map(cat => <Chip key={cat.id} label={label(cat)} active={category === cat.slug} onPress={() => { if (!busy && category !== cat.slug) { setLoading(true); setError(false); setCategory(cat.slug); } }} />)}</View><Text style={s.small}>Trier par</Text><View style={s.wrap}><Chip label="Récentes" active={sort === 'recent'} onPress={() => setSort('recent')} /><Chip label="Plus discutées" active={sort === 'discussed'} onPress={() => setSort('discussed')} /><Chip label="Plus anciennes" active={sort === 'oldest'} onPress={() => setSort('oldest')} /></View></View>}</>}
      {loading ? <ActivityIndicator color="#276653" /> : postId ? detail && <>{card(detail.post, true)}{detail.replies.map(item => <View key={item.id} style={s.card}><Text style={s.name}>{item.pseudonym}</Text><Text style={s.text}>{item.content}</Text></View>)}<View style={s.card}><TextInput accessibilityLabel={c('reply')} placeholder={c('write')} value={reply} onChangeText={setReply} editable={!busy} multiline maxLength={2000} style={[s.input, s.textarea]} /><Button label={c('reply')} busy={busy} disabled={!reply.trim()} onPress={respond} /></View></> : <>{posts.map(post => card(post))}{!posts.length && !error && <View style={s.card}><Text style={s.muted}>{c('empty')}</Text></View>}<Button label={c('rules')} secondary onPress={() => setScreen('rules')} /></>}
    </>}
  </Page>;
}
