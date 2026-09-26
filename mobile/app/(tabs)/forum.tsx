import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useI18n } from '@/lib/i18n';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ForumTab() {
  const router = useRouter();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [subjectBio, setSubjectBio] = useState('');
  const [subjectType, setSubjectType] = useState<'share' | 'students' | 'motivation'>('motivation');
  const [customPosts, setCustomPosts] = useState<Array<{ id: string; title: string; excerpt: string; people: string; updates: string; tag: string }>>([]);

  const posts = [
    {
      id: 'default-1',
      title: t('forum.post1.title'),
      excerpt: t('forum.post1.excerpt'),
      people: t('forum.people.12'),
      updates: t('forum.updates.4'),
      tag: t('forum.tag.share'),
    },
    {
      id: 'default-2',
      title: t('forum.post2.title'),
      excerpt: t('forum.post2.excerpt'),
      people: t('forum.people.8'),
      updates: t('forum.updates.2'),
      tag: t('forum.tag.students'),
    },
    {
      id: 'default-3',
      title: t('forum.post3.title'),
      excerpt: t('forum.post3.excerpt'),
      people: t('forum.people.15'),
      updates: t('forum.updates.6'),
      tag: t('forum.tag.motivation'),
    },
  ];

  const typeOptions = useMemo(
    () => [
      { value: 'share' as const, label: t('forum.tag.share') },
      { value: 'students' as const, label: t('forum.tag.students') },
      { value: 'motivation' as const, label: t('forum.tag.motivation') },
    ],
    [t]
  );

  const allPosts = [...customPosts, ...posts];

  const createSubject = () => {
    const title = subjectName.trim();
    const bio = subjectBio.trim();

    if (!title || !bio) {
      return;
    }

    const optionLabel = typeOptions.find((option) => option.value === subjectType)?.label ?? t('forum.tag.motivation');

    setCustomPosts((current) => [
      {
        id: `custom-${Date.now()}`,
        title,
        excerpt: bio,
        people: t('forum.people.1'),
        updates: t('forum.updates.0'),
        tag: optionLabel,
      },
      ...current,
    ]);

    setSubjectName('');
    setSubjectBio('');
    setSubjectType('motivation');
    setShowCreateForm(false);
  };

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top + 8, 18) }]}>
      <View style={styles.backgroundBlobTop} />
      <View style={styles.screenHeader}>
        <Text style={styles.headerTitle}>{t('forum.title')}</Text>
        <Text style={styles.headerSubtitle}>{t('forum.subtitle')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={styles.createButton}
          activeOpacity={0.85}
          onPress={() => setShowCreateForm((current) => !current)}
        >
          <Ionicons name="add-circle-outline" size={18} color="#ffffff" />
          <Text style={styles.createButtonText}>{t('forum.createButton')}</Text>
        </TouchableOpacity>

        {showCreateForm && (
          <View style={styles.createCard}>
            <Text style={styles.createTitle}>{t('forum.form.title')}</Text>

            <Text style={styles.inputLabel}>{t('forum.form.name')}</Text>
            <TextInput
              style={styles.input}
              value={subjectName}
              onChangeText={setSubjectName}
              placeholder={t('forum.form.namePlaceholder')}
              placeholderTextColor="#95a09b"
            />

            <Text style={styles.inputLabel}>{t('forum.form.type')}</Text>
            <View style={styles.typeRow}>
              {typeOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.typePill, subjectType === option.value && styles.typePillActive]}
                  onPress={() => setSubjectType(option.value)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.typePillText, subjectType === option.value && styles.typePillTextActive]}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>{t('forum.form.bio')}</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={subjectBio}
              onChangeText={setSubjectBio}
              placeholder={t('forum.form.bioPlaceholder')}
              placeholderTextColor="#95a09b"
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity style={styles.submitButton} onPress={createSubject} activeOpacity={0.86}>
              <Text style={styles.submitButtonText}>{t('forum.form.submit')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {allPosts.map((post) => (
          <TouchableOpacity
            key={post.id}
            style={styles.threadButton}
            activeOpacity={0.8}
            onPress={() => router.push('/annuaire?newForum=1')}
          >
            <View style={styles.previewTopRow}>
              <View style={styles.tagBadge}>
                <Text style={styles.tagText}>{post.tag}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#97a19d" />
            </View>
            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postExcerpt}>{post.excerpt}</Text>
            <View style={styles.previewBottomRow}>
              <View style={styles.previewMetaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="people-outline" size={13} color="#6c7672" />
                  <Text style={styles.metaText}>{post.people}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="chatbubble-ellipses-outline" size={13} color="#6c7672" />
                  <Text style={styles.metaText}>{post.updates}</Text>
                </View>
              </View>
              <View style={styles.openPill}>
                <Text style={styles.openPillText}>{t('forum.open')}</Text>
              </View>
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
  screenHeader: { paddingHorizontal: 18, marginBottom: 12 },
  headerTitle: { fontSize: 36, fontWeight: '800', color: '#18211f', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: '#6b7571', marginTop: 2, fontWeight: '500' },
  listContainer: {
    marginHorizontal: 18,
    marginBottom: 84,
    paddingVertical: 4,
    gap: 12,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2d9c86',
    borderRadius: 14,
    paddingVertical: 12,
    shadowColor: '#2d9c86',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 2,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  createCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(223, 230, 227, 0.95)',
    padding: 14,
    gap: 8,
  },
  createTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#18211f',
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#55635f',
  },
  input: {
    backgroundColor: '#f4f7f6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dbe7e2',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1b2421',
  },
  textarea: {
    minHeight: 84,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  typePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#eff5f2',
    borderWidth: 1,
    borderColor: '#dbe7e2',
  },
  typePillActive: {
    backgroundColor: '#dff2ec',
    borderColor: '#8ecfbe',
  },
  typePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#60706b',
  },
  typePillTextActive: {
    color: '#1f7f6a',
  },
  submitButton: {
    marginTop: 4,
    borderRadius: 12,
    backgroundColor: '#2d9c86',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  threadButton: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(223, 230, 227, 0.95)',
    shadowColor: '#1c2b27',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
    gap: 8,
  },
  previewTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tagBadge: { backgroundColor: '#ecf7f2', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  tagText: { color: '#2a7567', fontSize: 10, fontWeight: '700' },
  postTitle: { fontSize: 17, fontWeight: '700', color: '#1b2421', lineHeight: 24 },
  postExcerpt: { fontSize: 13, color: '#64706b', lineHeight: 19 },
  previewBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  previewMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#6c7672', fontWeight: '600' },
  openPill: {
    backgroundColor: '#ecf7f2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  openPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2a7567',
  },
});