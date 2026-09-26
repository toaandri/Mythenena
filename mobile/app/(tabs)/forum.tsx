import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '@/lib/i18n';
import { useSession } from '@/lib/session';
import { apiFetch } from '@/lib/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Category = { id: string; slug: string; labelFr: string; labelMg: string; description: string; icon?: string };
type Post = {
  id: string;
  pseudonym: string;
  content: string;
  repliesCount: number;
  reactions: Array<{ type: string; count: number; active: boolean }>;
  createdAt: string;
};

export default function ForumTab() {
  const { t, language } = useI18n();
  const { ensureSession } = useSession();
  const insets = useSafeAreaInsets();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<Category | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [sending, setSending] = useState(false);

  // Charger catégories
  useEffect(() => {
    void apiFetch<{ categories: Category[] }>('/api/forum/categories', { auth: false })
      .then(({ categories: cats }) => {
        setCategories(cats);
        setSelected(cats[0] ?? null);
      })
      .catch(() => setError('Forum temporairement indisponible.'))
      .finally(() => setLoadingCats(false));
  }, []);

  // Charger posts quand la catégorie change
  const loadPosts = useCallback(async (cat: Category | null) => {
    if (!cat) return;
    setLoadingPosts(true);
    try {
      const data = await apiFetch<{ items: Post[] }>(
        `/api/forum/posts?category=${encodeURIComponent(cat.slug)}&limit=50`,
        { auth: false }
      );
      setPosts(data.items);
    } catch {
      setError('Publications indisponibles.');
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  useEffect(() => {
    void loadPosts(selected);
  }, [selected, loadPosts]);

  const publish = async () => {
    if (!selected || !content.trim()) return;
    setSending(true);
    setError('');
    try {
      await ensureSession(language === 'mg' ? 'mg' : 'fr');
      const { post } = await apiFetch<{ post: Post }>('/api/forum/posts', {
        method: 'POST',
        body: JSON.stringify({ categoryId: selected.id, content: content.trim() }),
      });
      setPosts((prev) => [post, ...prev]);
      setContent('');
      setShowForm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Publication impossible.');
    } finally {
      setSending(false);
    }
  };

  const react = async (post: Post) => {
    try {
      await ensureSession(language === 'mg' ? 'mg' : 'fr');
      await apiFetch(`/api/forum/posts/${post.id}/react`, {
        method: 'POST',
        body: JSON.stringify({ type: 'support' }),
      });
      void loadPosts(selected);
    } catch {
      // silencieux
    }
  };

  const getCategoryLabel = (cat: Category) =>
    language === 'mg' ? cat.labelMg : cat.labelFr;

  const supportCount = (post: Post) =>
    post.reactions.find((r) => r.type === 'support')?.count ?? 0;

  const hasReacted = (post: Post) =>
    post.reactions.find((r) => r.type === 'support')?.active ?? false;

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top + 8, 18) }]}>
      <View style={styles.backgroundBlobTop} />
      <View style={styles.screenHeader}>
        <Text style={styles.headerTitle}>{t('forum.title')}</Text>
        <Text style={styles.headerSubtitle}>{t('forum.subtitle')}</Text>
      </View>

      {/* Catégories */}
      {!loadingCats && categories.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catPill, selected?.id === cat.id && styles.catPillActive]}
              onPress={() => setSelected(cat)}
              activeOpacity={0.8}
            >
              <Text style={[styles.catPillText, selected?.id === cat.id && styles.catPillTextActive]}>
                {getCategoryLabel(cat)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {error !== '' && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={16} color="#c53030" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        {/* Bouton publier */}
        <TouchableOpacity
          style={styles.createButton}
          activeOpacity={0.85}
          onPress={() => setShowForm((v) => !v)}
        >
          <Ionicons name={showForm ? 'close-circle-outline' : 'add-circle-outline'} size={18} color="#ffffff" />
          <Text style={styles.createButtonText}>
            {showForm ? 'Annuler' : t('forum.createButton')}
          </Text>
        </TouchableOpacity>

        {/* Formulaire */}
        {showForm && (
          <View style={styles.createCard}>
            <Text style={styles.createTitle}>Partager avec la communauté</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={content}
              onChangeText={setContent}
              placeholder="Exprimez-vous librement, dans le respect et la bienveillance..."
              placeholderTextColor="#95a09b"
              multiline
              textAlignVertical="top"
              maxLength={2000}
            />
            <TouchableOpacity
              style={[styles.submitButton, (sending || !content.trim()) && styles.submitButtonDisabled]}
              onPress={publish}
              activeOpacity={0.86}
              disabled={sending || !content.trim()}
            >
              {sending
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={styles.submitButtonText}>{t('forum.form.submit')}</Text>
              }
            </TouchableOpacity>
          </View>
        )}

        {/* Loading */}
        {loadingPosts && (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="small" color="#276653" />
          </View>
        )}

        {/* Posts */}
        {!loadingPosts && posts.map((post) => (
          <View key={post.id} style={styles.threadCard}>
            <View style={styles.postMeta}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{post.pseudonym.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.metaInfo}>
                <Text style={styles.pseudonym}>{post.pseudonym}</Text>
                <Text style={styles.postTime}>
                  {new Date(post.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>

            <Text style={styles.postContent}>{post.content}</Text>

            <View style={styles.postActions}>
              <TouchableOpacity
                style={[styles.actionBtn, hasReacted(post) && styles.actionBtnActive]}
                onPress={() => react(post)}
                activeOpacity={0.8}
              >
                <Ionicons name={hasReacted(post) ? 'heart' : 'heart-outline'} size={15} color={hasReacted(post) ? '#d65b5b' : '#6b7571'} />
                <Text style={[styles.actionText, hasReacted(post) && styles.actionTextActive]}>
                  {supportCount(post) > 0 ? supportCount(post).toString() : 'Soutenir'}
                </Text>
              </TouchableOpacity>

              <View style={styles.actionBtn}>
                <Ionicons name="chatbubble-ellipses-outline" size={15} color="#6b7571" />
                <Text style={styles.actionText}>{post.repliesCount > 0 ? `${post.repliesCount} réponse${post.repliesCount > 1 ? 's' : ''}` : 'Répondre'}</Text>
              </View>
            </View>
          </View>
        ))}

        {!loadingPosts && posts.length === 0 && !error && (
          <View style={styles.emptyCard}>
            <Ionicons name="chatbubbles-outline" size={28} color="#8a9490" />
            <Text style={styles.emptyTitle}>Soyez le premier à partager</Text>
            <Text style={styles.emptySubtitle}>Cette communauté vous attend. Votre témoignage peut aider quelqu'un.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8f6f0' },
  backgroundBlobTop: {
    position: 'absolute', top: -80, right: -50,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(45, 156, 134, 0.13)',
  },
  screenHeader: { paddingHorizontal: 18, marginBottom: 10 },
  headerTitle: { fontSize: 36, fontWeight: '800', color: '#18211f', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: '#6b7571', marginTop: 2, fontWeight: '500' },
  catRow: { paddingHorizontal: 18, paddingBottom: 10, gap: 8, flexDirection: 'row' },
  catPill: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999,
    backgroundColor: '#f0f5f3', borderWidth: 1, borderColor: '#dbe7e2',
  },
  catPillActive: { backgroundColor: '#276653', borderColor: '#276653' },
  catPillText: { fontSize: 13, fontWeight: '700', color: '#51695f' },
  catPillTextActive: { color: '#ffffff' },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fdecec', marginHorizontal: 18, marginBottom: 8,
    borderRadius: 12, padding: 10,
  },
  errorText: { flex: 1, fontSize: 12, color: '#c53030' },
  listContainer: { marginHorizontal: 18, marginBottom: 84, paddingVertical: 4, gap: 12 },
  createButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#276653', borderRadius: 14, paddingVertical: 13,
    shadowColor: '#276653', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18, shadowRadius: 10, elevation: 3,
  },
  createButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
  createCard: {
    backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1,
    borderColor: 'rgba(223, 230, 227, 0.95)', padding: 14, gap: 10,
  },
  createTitle: { fontSize: 15, fontWeight: '800', color: '#18211f' },
  input: {
    backgroundColor: '#f4f7f6', borderRadius: 12, borderWidth: 1,
    borderColor: '#dbe7e2', paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 13, color: '#1b2421',
  },
  textarea: { minHeight: 100 },
  submitButton: {
    borderRadius: 12, backgroundColor: '#276653',
    alignItems: 'center', justifyContent: 'center', paddingVertical: 12,
  },
  submitButtonDisabled: { opacity: 0.55 },
  submitButtonText: { color: '#ffffff', fontSize: 13, fontWeight: '800' },
  loadingCard: { alignItems: 'center', paddingVertical: 20 },
  threadCard: {
    backgroundColor: '#ffffff', borderRadius: 18, padding: 14,
    borderWidth: 1, borderColor: 'rgba(223, 230, 227, 0.95)',
    shadowColor: '#1c2b27', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 1, gap: 10,
  },
  postMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#e6f4ef', alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 15, fontWeight: '800', color: '#276653' },
  metaInfo: { flex: 1 },
  pseudonym: { fontSize: 14, fontWeight: '700', color: '#183e36' },
  postTime: { fontSize: 11, color: '#8a9490', marginTop: 1 },
  postContent: { fontSize: 14, color: '#2a3d36', lineHeight: 22 },
  postActions: { flexDirection: 'row', gap: 12, paddingTop: 4 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999,
    backgroundColor: '#f4f8f6',
  },
  actionBtnActive: { backgroundColor: '#fdecec' },
  actionText: { fontSize: 12, color: '#6b7571', fontWeight: '600' },
  actionTextActive: { color: '#d65b5b' },
  emptyCard: {
    backgroundColor: '#ffffff', borderRadius: 18, padding: 28,
    alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: 'rgba(223, 230, 227, 0.95)',
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#183e36', textAlign: 'center' },
  emptySubtitle: { fontSize: 13, color: '#6b7571', lineHeight: 20, textAlign: 'center' },
});
