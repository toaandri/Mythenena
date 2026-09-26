import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, Keyboard } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams } from 'expo-router';
import { useI18n } from '@/lib/i18n';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChatTab() {
  const params = useLocalSearchParams<{ topic?: string | string[]; seedMessage?: string | string[] }>();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [audioMode, setAudioMode] = useState<'idle' | 'calling' | 'listening'>('idle');
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const selectedTopic = useMemo(
    () => (typeof params.topic === 'string' ? params.topic : ''),
    [params.topic]
  );
  const seededUserMessage = useMemo(() => {
    if (typeof params.seedMessage === 'string' && params.seedMessage.trim().length > 0) {
      return params.seedMessage;
    }
    return t('chat.defaultUser');
  }, [params.seedMessage, t]);

  const sendMessage = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    setMessages((current) => [...current, trimmed]);
    setMessage('');
  };

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardOpen(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardOpen(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const composerBottomGap = isKeyboardOpen ? Math.max(insets.bottom - 6, 2) : 76;

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: Math.max(insets.top + 8, 16) }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={styles.backgroundBlobTop} />
      <BlurView intensity={60} tint="light" style={styles.discussionToolbar}>
        <View style={styles.discussionPerson}>
          <View style={styles.profileAvatar}>
            <Ionicons name="sparkles" size={20} color="#fff" />
          </View>
          <View>
            <Text style={styles.personName}>Assistant IA</Text>
            <View style={styles.statusRow}>
              <View style={styles.onlineDot} />
                <Text style={styles.statusText}>{t('chat.available')}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.audioAction, audioMode === 'calling' && styles.activeAudio]}
          onPress={() => setAudioMode(audioMode === 'calling' ? 'idle' : 'calling')}
        >
          <Feather name="phone" size={18} color={audioMode === 'calling' ? '#fff' : '#269f85'} />
        </TouchableOpacity>
      </BlurView>

      {audioMode !== 'idle' && (
        <View style={styles.audioStatus}>
          <Text style={styles.audioStatusText}>
            {audioMode === 'calling' ? t('chat.calling') : t('chat.listening')}
          </Text>
          <TouchableOpacity onPress={() => setAudioMode('idle')}>
            <Text style={styles.stopButtonText}>{t('chat.stop')}</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.chatTranscript}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.bubble, styles.assistantBubble]}>
          <Text style={styles.assistantBubbleText}>
            {t('chat.greeting')}
          </Text>
        </View>
        {selectedTopic.length > 0 && (
          <View style={styles.topicHint}>
            <Text style={styles.topicHintText}>{t('chat.topicLabel')} {selectedTopic}</Text>
          </View>
        )}
        <View style={[styles.bubble, styles.userBubble]}>
          <Text style={styles.userBubbleText}>{seededUserMessage}</Text>
        </View>
        {messages.map((item, index) => (
          <View key={index} style={[styles.bubble, styles.userBubble]}>
            <Text style={styles.userBubbleText}>{item}</Text>
          </View>
        ))}
      </ScrollView>

      <BlurView intensity={70} tint="light" style={[styles.composer, { marginBottom: composerBottomGap }]}>
        <TouchableOpacity
          style={[styles.audioAction, audioMode === 'listening' && styles.activeAudio]}
          onPress={() => setAudioMode(audioMode === 'listening' ? 'idle' : 'listening')}
        >
          <Feather name="mic" size={18} color={audioMode === 'listening' ? '#fff' : '#269f85'} />
        </TouchableOpacity>
        <TextInput
          style={styles.composerInput}
          value={message}
          onChangeText={setMessage}
          placeholder={t('chat.placeholder')}
          placeholderTextColor="#89938f"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Ionicons name="send" size={16} color="#fff" />
        </TouchableOpacity>
      </BlurView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#eef2ef',
  },
  backgroundBlobTop: {
    position: 'absolute',
    top: -80,
    right: -50,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(45, 156, 134, 0.13)',
  },
  discussionToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingBottom: 10,
    paddingTop: 6,
    marginHorizontal: 10,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(216, 224, 220, 0.9)',
    backgroundColor: Platform.OS === 'android' ? '#ffffffd9' : 'transparent',
  },
  discussionPerson: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  profileAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#2d9c86', alignItems: 'center', justifyContent: 'center' },
  personName: { fontSize: 16, fontWeight: '700', color: '#1b2421' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#2d9c86' },
  statusText: { fontSize: 11, color: '#6b7571', fontWeight: '600' },
  audioAction: {
    padding: 9,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    shadowColor: '#1c2b27',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  activeAudio: { backgroundColor: '#2d9c86' },
  audioStatus: {
    backgroundColor: '#e2f3ed',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 10,
    marginTop: 8,
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  audioStatusText: { fontSize: 12, color: '#2b6f61', fontWeight: '700' },
  stopButtonText: { fontSize: 13, color: '#c53030', fontWeight: '700' },
  chatTranscript: { flex: 1, paddingHorizontal: 10, marginTop: 8 },
  chatContent: {
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
    backgroundColor: '#f6f8f7',
    marginBottom: 10,
    borderRadius: 18,
    minHeight: 240,
  },
  bubble: { padding: 13, borderRadius: 16, maxWidth: '84%' },
  assistantBubble: {
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 8,
    shadowColor: '#1c2b27',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  assistantBubbleText: { color: '#1a2320', fontSize: 14, lineHeight: 21 },
  topicHint: {
    alignSelf: 'center',
    backgroundColor: '#ecf7f2',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  topicHintText: {
    color: '#2a7567',
    fontSize: 11,
    fontWeight: '700',
  },
  userBubble: { backgroundColor: '#2d9c86', alignSelf: 'flex-end', borderBottomRightRadius: 8 },
  userBubbleText: { color: '#FFFFFF', fontSize: 14, lineHeight: 21, fontWeight: '700' },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(216, 224, 220, 0.9)',
    backgroundColor: Platform.OS === 'android' ? '#ffffffd9' : 'transparent',
    gap: 8,
    borderRadius: 18,
    marginHorizontal: 10,
  },
  composerInput: {
    flex: 1,
    backgroundColor: '#f3f6f4',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#1a2320',
  },
  sendButton: { backgroundColor: '#2d9c86', width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
});