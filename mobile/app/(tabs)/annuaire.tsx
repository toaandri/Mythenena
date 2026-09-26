import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Platform, KeyboardAvoidingView, Keyboard, LayoutAnimation, UIManager, Animated, Easing } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useI18n } from '@/lib/i18n';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ThreadId = 'marie' | 'thomas' | 'sophie' | 'forum';

type Thread = {
  id: ThreadId;
  name: string;
  role: string;
  preview: string;
  time: string;
  unread: number;
  color: string;
  participants: string[];
  messages: Array<{ author: string; text: string }>;
};

const conversations: Thread[] = [
  {
    id: 'marie',
    name: 'Marie D.',
    role: 'Thérapeute référente',
    preview: 'Continuons sur cette lancée la semaine prochaine.',
    time: '10:42',
    unread: 2,
    color: '#44665d',
    participants: ['Marie', 'Vous'],
    messages: [
      { author: 'Marie D.', text: 'Bonjour, comment vous sentez-vous aujourd’hui ?' },
      { author: 'Vous', text: 'Un peu fatigué mais plus calme.' },
      { author: 'Marie D.', text: 'Continuons sur cette lancée la semaine prochaine.' },
    ],
  },
  {
    id: 'thomas',
    name: 'Thomas R.',
    role: 'Groupe confiance en soi',
    preview: 'Merci pour votre écoute.',
    time: 'Hier',
    unread: 0,
    color: '#2f506b',
    participants: ['Thomas', 'Vous', 'Aina'],
    messages: [
      { author: 'Thomas R.', text: 'On essaie tous d’avancer un pas à la fois.' },
      { author: 'Vous', text: 'Merci pour votre écoute.' },
    ],
  },
  {
    id: 'sophie',
    name: 'Sophie L.',
    role: 'Intervenante',
    preview: 'Votre rendez-vous est confirmé.',
    time: 'Lun.',
    unread: 1,
    color: '#806279',
    participants: ['Sophie', 'Vous'],
    messages: [
      { author: 'Sophie L.', text: 'Votre rendez-vous est confirmé.' },
      { author: 'Vous', text: 'Parfait, merci.' },
    ],
  },
];

const forumConversation: Thread = {
  id: 'forum',
  name: 'Forum groupe',
  role: 'Nouvelle discussion',
  preview: 'Une nouvelle discussion a été ajoutée depuis le forum.',
  time: 'À l’instant',
  unread: 1,
  color: '#2d9c86',
  participants: ['Aina', 'Thomas', 'Lova', 'Vous'],
  messages: [
    { author: 'Aina', text: 'Bienvenue dans le groupe. On partage nos idées ici.' },
    { author: 'Thomas', text: 'J’ai commencé à noter ce qui m’apaise le soir.' },
    { author: 'Vous', text: 'Je rejoins la discussion.' },
  ],
};

export default function AnnuaireTab() {
  const router = useRouter();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ newForum?: string | string[]; thread?: string | string[] }>();
  const [draft, setDraft] = useState('');
  const [audioMode, setAudioMode] = useState<'idle' | 'calling' | 'listening'>('idle');
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError, setListError] = useState(false);
  const [longPressedThreadId, setLongPressedThreadId] = useState<ThreadId | null>(null);
  const [threads, setThreads] = useState<Record<ThreadId, Thread>>(() => ({
    marie: conversations[0],
    thomas: conversations[1],
    sophie: conversations[2],
    forum: forumConversation,
  }));

  const joinedFromForum = typeof params.newForum === 'string' && params.newForum.length > 0;
  const activeThreadId = (typeof params.thread === 'string' ? params.thread : '') as ThreadId | '';
  const activeThread = activeThreadId ? threads[activeThreadId] : null;
  const visibleConversations = joinedFromForum ? [forumConversation, ...conversations] : conversations;

  const threadList = useMemo(() => visibleConversations, [visibleConversations]);
  const loadingPulse = useMemo(() => new Animated.Value(0), []);

  const openThread = (threadId: ThreadId) => {
    setAudioMode('idle');
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    router.setParams({ thread: threadId, newForum: joinedFromForum ? '1' : undefined });
  };

  const sendMessage = () => {
    const content = draft.trim();
    if (!content || !activeThreadId) return;

    setThreads((current) => ({
      ...current,
      [activeThreadId]: {
        ...current[activeThreadId],
        messages: [...current[activeThreadId].messages, { author: 'Vous', text: content }],
      },
    }));
    setDraft('');
  };

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    const showSub = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardOpen(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardOpen(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoadingList(false);
      setListError(false);
    }, 420);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(loadingPulse, {
          toValue: 1,
          duration: 520,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(loadingPulse, {
          toValue: 0,
          duration: 520,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();
    return () => pulse.stop();
  }, [loadingPulse]);

  const composerBottomGap = isKeyboardOpen ? Math.max(insets.bottom - 6, 2) : 76;
  const loadingOpacity = loadingPulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] });

  if (activeThread) {
    return (
      <KeyboardAvoidingView
        style={[styles.screen, { paddingTop: Math.max(insets.top + 8, 18) }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={styles.backgroundBlobTop} />
        <BlurView intensity={60} tint="light" style={styles.discussionToolbar}>
          <TouchableOpacity
            style={styles.audioAction}
            activeOpacity={0.85}
            onPress={() => {
              setAudioMode('idle');
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              router.setParams({ thread: undefined, newForum: joinedFromForum ? '1' : undefined });
            }}
          >
            <Feather name="corner-up-left" size={18} color="#2d9c86" />
          </TouchableOpacity>

          <View style={[styles.discussionPerson, styles.discussionPersonGrow]}>
            <View style={[styles.profileAvatar, { backgroundColor: activeThread.color }]}>
              <Ionicons name="people" size={18} color="#fff" />
            </View>
            <View>
              <Text style={styles.personName}>{activeThread.name}</Text>
              <View style={styles.statusRow}>
                <View style={styles.onlineDot} />
                <Text style={styles.statusText}>{activeThread.participants.length} participants</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.audioAction, audioMode === 'calling' && styles.activeAudio]}
            activeOpacity={0.85}
            onPress={() => setAudioMode(audioMode === 'calling' ? 'idle' : 'calling')}
          >
            <Feather name="phone" size={18} color={audioMode === 'calling' ? '#fff' : '#2d9c86'} />
          </TouchableOpacity>
        </BlurView>

        {audioMode !== 'idle' && (
          <View style={styles.audioStatus}>
            <Text style={styles.audioStatusText}>
              {audioMode === 'calling' ? 'Appel vocal en cours...' : 'Micro activé — parlez librement'}
            </Text>
            <TouchableOpacity onPress={() => setAudioMode('idle')}>
              <Text style={styles.stopButtonText}>Arrêter</Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView style={styles.chatTranscript} contentContainerStyle={styles.chatContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {activeThread.messages.map((message, index) => {
            const isMe = message.author === 'Vous';
            return (
              <View key={`${message.author}-${index}`} style={[styles.bubble, isMe ? styles.userBubble : styles.assistantBubble]}>
                {!isMe && <Text style={styles.author}>{message.author}</Text>}
                <View>
                  <Text style={[styles.messageText, isMe && styles.userBubbleText]}>{message.text}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <BlurView intensity={70} tint="light" style={[styles.composer, { marginBottom: composerBottomGap }]}>
          <TouchableOpacity
            style={[styles.audioAction, audioMode === 'listening' && styles.activeAudio]}
            activeOpacity={0.85}
            onPress={() => setAudioMode(audioMode === 'listening' ? 'idle' : 'listening')}
          >
            <Feather name="mic" size={18} color={audioMode === 'listening' ? '#fff' : '#2d9c86'} />
          </TouchableOpacity>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            style={styles.composerInput}
            placeholder="Écrivez votre message..."
            placeholderTextColor="#89938f"
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton} activeOpacity={0.85}>
            <Ionicons name="send" size={16} color="#fff" />
          </TouchableOpacity>
        </BlurView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top + 8, 18) }]}>
      <View style={styles.backgroundBlobTop} />
      <View style={styles.screenHeader}>
        <Text style={styles.headerTitle}>{t('messages.title')}</Text>
        <View style={styles.subtitleRow}>
          <Ionicons name="lock-closed-outline" size={12} color="#8a9490" />
          <Text style={styles.headerSubtitle}>{t('messages.subtitle')}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      >
        {isLoadingList && (
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>{t('common.loading')}</Text>
            {[0, 1].map((idx) => (
              <Animated.View key={idx} style={[styles.skeletonCard, { opacity: loadingOpacity }]}>
                <View style={styles.skeletonAvatar} />
                <View style={styles.skeletonTextWrap}>
                  <View style={styles.skeletonLine} />
                  <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
                </View>
              </Animated.View>
            ))}
          </View>
        )}

        {!isLoadingList && listError && (
          <View style={styles.stateCard}>
            <Ionicons name="cloud-offline-outline" size={20} color="#c53030" />
            <Text style={styles.stateTitle}>{t('common.networkError')}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setListError(false);
                setIsLoadingList(true);
                setTimeout(() => setIsLoadingList(false), 450);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isLoadingList && !listError && threadList.length === 0 && (
          <View style={styles.stateCard}>
            <Ionicons name="chatbox-ellipses-outline" size={20} color="#5f6966" />
            <Text style={styles.stateTitle}>{t('messages.emptyTitle')}</Text>
            <Text style={styles.stateSubtitle}>{t('messages.emptySubtitle')}</Text>
          </View>
        )}

        {!isLoadingList && !listError && threadList.map((conv) => (
          <TouchableOpacity
            key={conv.id}
            style={[styles.conversationCard, longPressedThreadId === conv.id && styles.conversationCardLongPressed]}
            activeOpacity={0.7}
            onLongPress={() => {
              setLongPressedThreadId(conv.id);
              setTimeout(() => setLongPressedThreadId((current) => (current === conv.id ? null : current)), 280);
            }}
            onPress={() => openThread(conv.id)}
          >
            <View style={[styles.convAvatar, { backgroundColor: conv.color }]}>
              <Ionicons name="person" size={22} color="#fff" />
            </View>
            <View style={styles.convCopy}>
              <Text style={styles.convName}>{conv.name}</Text>
              <Text style={styles.convRole}>{conv.role}</Text>
              <Text numberOfLines={1} style={styles.convMsg}>{conv.preview}</Text>
            </View>
            <View style={styles.convMeta}>
              <Text style={styles.convTime}>{conv.time}</Text>
              {conv.unread > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{conv.unread}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
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
  screenHeader: {
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#18211f',
    letterSpacing: -0.5,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#7a8480',
    fontWeight: '500',
  },
  listContainer: {
    marginHorizontal: 8,
    marginBottom: 84,
    padding: 10,
    borderRadius: 18,
    backgroundColor: '#f9fbfa',
    borderWidth: 1,
    borderColor: 'rgba(220, 226, 223, 0.9)',
    gap: 12,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 16,
    gap: 14,
    shadowColor: '#1c2b27',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  conversationCardLongPressed: {
    transform: [{ scale: 0.985 }],
    borderWidth: 1,
    borderColor: '#2d9c86',
  },
  convAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  convCopy: {
    flex: 1,
    gap: 3,
  },
  convName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a2320',
  },
  convRole: {
    fontSize: 12,
    color: '#2d8a76',
    fontWeight: '700',
  },
  convMsg: {
    fontSize: 13,
    color: '#6f7a76',
  },
  convMeta: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
  },
  convTime: {
    fontSize: 11,
    color: '#8a9490',
  },
  badge: {
    backgroundColor: '#2d9c86',
    borderRadius: 10,
    width: 21,
    height: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  stateCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(220, 226, 223, 0.9)',
    padding: 14,
    alignItems: 'center',
    gap: 8,
  },
  skeletonCard: {
    width: '100%',
    backgroundColor: '#f7fbf9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5ece9',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  skeletonAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#e5ece9',
  },
  skeletonTextWrap: {
    flex: 1,
    gap: 8,
  },
  stateTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a2320',
  },
  stateSubtitle: {
    fontSize: 12,
    color: '#6f7a76',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 2,
    borderRadius: 10,
    backgroundColor: '#2d9c86',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  skeletonLine: {
    width: '100%',
    height: 9,
    borderRadius: 999,
    backgroundColor: '#e7ecea',
  },
  skeletonLineShort: {
    width: '76%',
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
  discussionPersonGrow: { flex: 1, marginHorizontal: 10 },
  profileAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
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
    marginHorizontal: 10,
    marginTop: 8,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  audioStatusText: {
    color: '#2b6f61',
    fontSize: 12,
    fontWeight: '700',
  },
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
  userBubble: {
    backgroundColor: '#2d9c86',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 8,
  },
  author: {
    fontSize: 11,
    color: '#85938e',
    marginBottom: 4,
    fontWeight: '600',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#1a2320',
  },
  userBubbleText: {
    color: '#ffffff',
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
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
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2d9c86',
  },
});