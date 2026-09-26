import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, Keyboard, ActivityIndicator } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams } from 'expo-router';
import { useI18n } from '@/lib/i18n';
import { useSession } from '@/lib/session';
import { apiFetch } from '@/lib/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ChatMsg = { id: string; role: 'user' | 'assistant'; content: string; timestamp: string };

export default function ChatTab() {
  const params = useLocalSearchParams<{ topic?: string | string[]; seedMessage?: string | string[] }>();
  const { t, language } = useI18n();
  const { ensureSession } = useSession();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [safetyAlert, setSafetyAlert] = useState<string | null>(null);

  const selectedTopic = useMemo(
    () => (typeof params.topic === 'string' ? params.topic : ''),
    [params.topic]
  );

  const seededUserMessage = useMemo(() => {
    if (typeof params.seedMessage === 'string' && params.seedMessage.trim().length > 0) {
      return params.seedMessage;
    }
    return '';
  }, [params.seedMessage]);

  // Charger historique + envoyer seed au démarrage
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const session = await ensureSession(language === 'mg' ? 'mg' : 'fr');
        const data = await apiFetch<{ messages: ChatMsg[] }>(`/api/chat/${session.id}`);
        setMessages(data.messages);

        // Si un message seed est passé depuis l'accueil et que l'historique est vide
        if (seededUserMessage && data.messages.length === 0) {
          await sendToApi(session.id, seededUserMessage);
        }
      } catch {
        // Session créée automatiquement au premier envoi
      } finally {
        setLoading(false);
      }
    };
    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardOpen(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardOpen(false));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const sendToApi = async (sessionId: string, text: string) => {
    const userMsg: ChatMsg = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);
    setSafetyAlert(null);

    try {
      const resp = await apiFetch<{ message: ChatMsg | null; safetyAlert?: string }>('/api/chat/message', {
        method: 'POST',
        body: JSON.stringify({ message: text, language: language === 'mg' ? 'mg' : 'fr' }),
      });

      if (resp.safetyAlert) {
        setSafetyAlert(resp.safetyAlert);
      }
      if (resp.message) {
        setMessages((prev) => [...prev, resp.message!]);
      }
    } catch (e) {
      const errMsg: ChatMsg = {
        id: Date.now().toString() + '-err',
        role: 'assistant',
        content: e instanceof Error ? e.message : 'Service temporairement indisponible.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setTyping(false);
    }
  };

  const sendMessage = async () => {
    const trimmed = message.trim();
    if (!trimmed || typing) return;
    setMessage('');

    try {
      const session = await ensureSession(language === 'mg' ? 'mg' : 'fr');
      await sendToApi(session.id, trimmed);
    } catch (e) {
      const errMsg: ChatMsg = {
        id: Date.now().toString() + '-err',
        role: 'assistant',
        content: e instanceof Error ? e.message : 'Impossible de créer la session.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    }
  };

  const composerBottomGap = isKeyboardOpen ? Math.max(insets.bottom - 6, 2) : 76;

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: Math.max(insets.top + 8, 16) }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={styles.backgroundBlobTop} />

      {/* Toolbar */}
      <BlurView intensity={60} tint="light" style={styles.discussionToolbar}>
        <View style={styles.discussionPerson}>
          <View style={styles.profileAvatar}>
            <Ionicons name="sparkles" size={20} color="#fff" />
          </View>
          <View>
            <Text style={styles.personName}>Assistant IA</Text>
            <View style={styles.statusRow}>
              <View style={[styles.onlineDot, typing && styles.onlineDotTyping]} />
              <Text style={styles.statusText}>{typing ? 'En train d\'écrire...' : t('chat.available')}</Text>
            </View>
          </View>
        </View>
      </BlurView>

      {/* Alerte de sécurité */}
      {safetyAlert && (
        <View style={styles.safetyBanner}>
          <Ionicons name="heart-circle-outline" size={18} color="#c53030" />
          <Text style={styles.safetyText}>{safetyAlert}</Text>
          <TouchableOpacity onPress={() => setSafetyAlert(null)}>
            <Ionicons name="close" size={16} color="#c53030" />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        ref={scrollRef}
        style={styles.chatTranscript}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#276653" />
          </View>
        )}

        {messages.length === 0 && !loading && (
          <View style={[styles.bubble, styles.assistantBubble]}>
            <Text style={styles.assistantBubbleText}>{t('chat.greeting')}</Text>
          </View>
        )}

        {selectedTopic.length > 0 && messages.length === 0 && (
          <View style={styles.topicHint}>
            <Text style={styles.topicHintText}>{t('chat.topicLabel')} {selectedTopic}</Text>
          </View>
        )}

        {messages.map((msg) => (
          <View key={msg.id} style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
            <Text style={msg.role === 'user' ? styles.userBubbleText : styles.assistantBubbleText}>
              {msg.content}
            </Text>
          </View>
        ))}

        {typing && (
          <View style={[styles.bubble, styles.assistantBubble]}>
            <View style={styles.typingDots}>
              <View style={[styles.dot, styles.dot1]} />
              <View style={[styles.dot, styles.dot2]} />
              <View style={[styles.dot, styles.dot3]} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Composer */}
      <BlurView intensity={70} tint="light" style={[styles.composer, { marginBottom: composerBottomGap }]}>
        <TouchableOpacity style={styles.audioAction}>
          <Feather name="mic" size={18} color="#276653" />
        </TouchableOpacity>
        <TextInput
          style={styles.composerInput}
          value={message}
          onChangeText={setMessage}
          placeholder={t('chat.placeholder')}
          placeholderTextColor="#89938f"
          multiline
          maxLength={4000}
          onSubmitEditing={sendMessage}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!message.trim() || typing) && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!message.trim() || typing}
        >
          <Ionicons name="send" size={16} color="#fff" />
        </TouchableOpacity>
      </BlurView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8f6f0' },
  backgroundBlobTop: {
    position: 'absolute', top: -80, right: -50,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(45, 156, 134, 0.13)',
  },
  discussionToolbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingBottom: 10, paddingTop: 6,
    marginHorizontal: 10, borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(216, 224, 220, 0.9)',
    backgroundColor: Platform.OS === 'android' ? '#ffffffd9' : 'transparent',
  },
  discussionPerson: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  profileAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#276653', alignItems: 'center', justifyContent: 'center' },
  personName: { fontSize: 16, fontWeight: '700', color: '#1b2421' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#276653' },
  onlineDotTyping: { backgroundColor: '#e6a020' },
  statusText: { fontSize: 11, color: '#6b7571', fontWeight: '600' },
  audioAction: {
    padding: 9, borderRadius: 14, backgroundColor: '#ffffff',
    shadowColor: '#1c2b27', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 1,
  },
  safetyBanner: {
    backgroundColor: '#fdecec', marginHorizontal: 10, marginTop: 8,
    borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  safetyText: { flex: 1, fontSize: 12, color: '#c53030', lineHeight: 18 },
  chatTranscript: { flex: 1, paddingHorizontal: 10, marginTop: 8 },
  chatContent: { gap: 12, paddingVertical: 14, paddingHorizontal: 10, paddingBottom: 20 },
  loadingRow: { alignItems: 'center', paddingVertical: 12 },
  bubble: { padding: 13, borderRadius: 16, maxWidth: '84%' },
  assistantBubble: {
    backgroundColor: '#ffffff', alignSelf: 'flex-start', borderBottomLeftRadius: 8,
    shadowColor: '#1c2b27', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 1,
  },
  assistantBubbleText: { color: '#183e36', fontSize: 14, lineHeight: 21 },
  topicHint: {
    alignSelf: 'center', backgroundColor: '#ecf7f2',
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5,
  },
  topicHintText: { color: '#2a7567', fontSize: 11, fontWeight: '700' },
  userBubble: { backgroundColor: '#276653', alignSelf: 'flex-end', borderBottomRightRadius: 8 },
  userBubbleText: { color: '#FFFFFF', fontSize: 14, lineHeight: 21, fontWeight: '700' },
  typingDots: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 4, paddingVertical: 2 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#276653', opacity: 0.4 },
  dot1: { opacity: 0.8 },
  dot2: { opacity: 0.5 },
  dot3: { opacity: 0.3 },
  composer: {
    flexDirection: 'row', alignItems: 'flex-end', padding: 10, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(216, 224, 220, 0.9)',
    backgroundColor: Platform.OS === 'android' ? '#ffffffd9' : 'transparent',
    gap: 8, borderRadius: 18, marginHorizontal: 10,
  },
  composerInput: {
    flex: 1, backgroundColor: '#f2f2e9', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: '#183e36',
    maxHeight: 100,
  },
  sendButton: { backgroundColor: '#276653', width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  sendButtonDisabled: { backgroundColor: '#a0b8b0' },
});
