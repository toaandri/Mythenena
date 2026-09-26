import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useI18n } from '@/lib/i18n';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function IndexTab() {
  const router = useRouter();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const topics = [
    [t('home.topic.depression'), 'smile-outline', t('home.seed.depression')],
    [t('home.topic.suicidal'), 'rainy-outline', t('home.seed.suicidal')],
    [t('home.topic.confidence'), 'shield-checkmark-outline', t('home.seed.confidence')],
    [t('home.topic.addiction'), 'heart-outline', t('home.seed.addiction')],
  ];

  const openAssistantWithTopic = (topic: string, seedMessage: string) => {
    router.push({
      pathname: '/(tabs)/chat',
      params: {
        topic,
        seedMessage,
        fromHome: '1',
      },
    });
  };

  return (
    <View style={styles.screen}>
      <View style={styles.backgroundBlobTop} />
      <ScrollView
        style={{ paddingTop: Math.max(insets.top + 8, 18) }}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
      <View style={styles.screenHeader}>
        <Text style={styles.headerTitle}>{t('home.title')}</Text>
        <Text style={styles.headerSubtitle}>{t('home.subtitle')}</Text>
      </View>

      <View style={styles.introCard}>
        <View style={styles.stepPill}>
          <Text style={styles.stepText}>{t('home.step')}</Text>
        </View>
        <Text style={styles.introTitle}>{t('home.question')}</Text>
        <Text style={styles.introDesc}>{t('home.desc')}</Text>
      </View>

      <View style={styles.optionList}>
        {topics.map(([label, iconName, seedMessage], i) => (
          <TouchableOpacity
            key={label}
            style={styles.optionCard}
            activeOpacity={0.7}
            onPress={() => openAssistantWithTopic(label, seedMessage)}
          >
            <View style={styles.optionNumberContainer}>
              <Text style={styles.optionNumber}>{i + 1}</Text>
            </View>
            <Ionicons name={iconName as any} size={22} color="#269f85" />
            <Text style={styles.optionLabel}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        activeOpacity={0.85}
        onPress={() =>
          openAssistantWithTopic(
            'Besoin de soutien',
            t('home.seed.generic')
          )
        }
      >
        <Text style={styles.primaryButtonText}>{t('home.next')}</Text>
        <Ionicons name="arrow-forward" size={18} color="#fff" />
      </TouchableOpacity>
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
  container: { paddingBottom: 118 },
  screenHeader: { paddingHorizontal: 18, marginBottom: 14 },
  headerTitle: { fontSize: 34, fontWeight: '800', color: '#1a2320', letterSpacing: -0.4 },
  headerSubtitle: { fontSize: 14, color: '#6f7a76', marginTop: 3, fontWeight: '500' },
  introCard: {
    backgroundColor: '#dff2ec',
    padding: 18,
    marginHorizontal: 18,
    marginBottom: 18,
    borderRadius: 20,
    shadowColor: '#22332d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 1,
  },
  stepPill: { backgroundColor: '#2d9c86', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, marginBottom: 10 },
  stepText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  introTitle: { fontSize: 31, fontWeight: '800', color: '#1a2320', marginBottom: 8, lineHeight: 36 },
  introDesc: { fontSize: 14, color: '#2f7466', lineHeight: 20, maxWidth: 280 },
  optionList: { paddingHorizontal: 18, gap: 10 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#1c2b27',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  optionNumberContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f3f6f4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionNumber: { fontSize: 13, fontWeight: '700', color: '#1a2320' },
  optionLabel: { fontSize: 16, color: '#14211d', fontWeight: '700', flex: 1 },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#2d9c86',
    marginHorizontal: 18,
    marginTop: 18,
    padding: 17,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#2d9c86',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 3,
  },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});