import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, View } from 'react-native';
import { Text, TextInput } from '@/components/OutfitText';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useI18n } from '@/lib/i18n';
import { useSocialCopy } from '@/lib/socialCopy';
import { Avatar, Button, Chip, Heading, Page, s } from '@/components/social/ui';
import { conversations, forumConversation, ThreadId } from '@/components/social/messageData';

export default function AnnuaireTab() {
  const { t } = useI18n(); const c = useSocialCopy(); const router = useRouter(); const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ thread?: string; newForum?: string }>();
  const [threads, setThreads] = useState([...conversations, forumConversation]);
  const [unread, setUnread] = useState(false); const [draft, setDraft] = useState('');
  const transcript = useRef<ScrollView>(null);
  const active = threads.find(item => item.id === params.thread);
  const open = (id: ThreadId) => { setDraft(''); setThreads(items => items.map(item => item.id === id ? { ...item, unread: 0 } : item)); router.setParams({ thread: id }); };
  const send = () => {
    if (!active || !draft.trim()) return;
    const text = draft.trim();
    setThreads(items => items.map(item => item.id === active.id ? { ...item, preview: text, time: '•', messages: [...item.messages, { author: 'Vous', text }] } : item)); setDraft('');
  };
  if (active) return <KeyboardAvoidingView style={[s.screen, { paddingTop: Math.max(insets.top + 12, 20), paddingHorizontal: 23, paddingBottom: 90 + insets.bottom }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <Button label={c('back')} secondary onPress={() => { setDraft(''); router.setParams({ thread: undefined }); }} />
    <View style={[s.row, { marginVertical: 20 }]}><Avatar name={active.name} /><View style={s.grow}><Text style={s.name}>{active.name}</Text><Text style={s.small}>{active.role}</Text></View></View>
    <Text style={s.small}>{c('demo')}</Text>
    <ScrollView ref={transcript} onContentSizeChange={() => transcript.current?.scrollToEnd({ animated: true })} contentContainerStyle={{ paddingVertical: 16, gap: 12 }} keyboardShouldPersistTaps="handled">
      {active.messages.map((message, index) => <View key={index} style={[s.card, { borderRadius: 20, padding: 16, maxWidth: '90%', alignSelf: message.author === 'Vous' ? 'flex-end' : 'flex-start', backgroundColor: message.author === 'Vous' ? '#276653' : '#fffefa' }]}>{message.author !== 'Vous' && <Text style={s.small}>{message.author}</Text>}<Text style={[s.text, message.author === 'Vous' && { color: '#fff' }]}>{message.text}</Text></View>)}
    </ScrollView>
    <View style={{ gap: 8 }}><TextInput accessibilityLabel={c('write')} placeholder={c('write')} value={draft} onChangeText={setDraft} multiline maxLength={2000} style={[s.input, { maxHeight: 120 }]} /><Button label={c('send')} onPress={send} disabled={!draft.trim()} /></View>
  </KeyboardAvoidingView>;
  const visible = threads.filter(item => (item.id !== 'forum' || params.newForum) && (!unread || item.unread > 0));
  return <Page><Heading label={t('messages.title')} title={c('messages')} /><View style={s.wrap}><Chip label={c('all')} active={!unread} onPress={() => setUnread(false)} /><Chip label={c('unread')} active={unread} onPress={() => setUnread(true)} /></View>
    <View>{visible.map(item => <TouchableOpacity key={item.id} accessibilityRole="button" onPress={() => open(item.id)} style={[s.row, s.divider]}><Avatar name={item.name} /><View style={s.grow}><View style={s.row}><Text style={[s.name, { flex: 1 }]}>{item.name}</Text><Text style={s.small}>{item.time}</Text></View><Text style={s.small}>{item.role}</Text><Text numberOfLines={1} style={s.muted}>{item.preview}</Text></View>{item.unread > 0 && <View style={{ backgroundColor: '#276653', borderRadius: 12, minWidth: 24, padding: 4, alignItems: 'center' }}><Text style={{ color: '#fff', fontSize: 11 }}>{item.unread}</Text></View>}</TouchableOpacity>)}{!visible.length && <Text style={s.muted}>{c('empty')}</Text>}</View>
    <View style={s.banner}><Text style={s.small}>{c('demo')}</Text></View>
  </Page>;
}
