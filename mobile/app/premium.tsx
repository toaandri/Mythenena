import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useI18n } from '@/lib/i18n';

type Plan = {
  nameKey: string;
  sessionsKey: string;
  priceKey: string;
  detailKey: string;
  accent: string;
  background: string;
};

const plans: Plan[] = [
  {
    nameKey: 'premium.plan.basic.name',
    sessionsKey: 'premium.plan.basic.sessions',
    priceKey: 'premium.plan.basic.price',
    detailKey: 'premium.plan.basic.detail',
    accent: '#276653',
    background: '#e7f6f0',
  },
  {
    nameKey: 'premium.plan.pro.name',
    sessionsKey: 'premium.plan.pro.sessions',
    priceKey: 'premium.plan.pro.price',
    detailKey: 'premium.plan.pro.detail',
    accent: '#bf7a18',
    background: '#fff0d7',
  },
];

const features = [
  'premium.feature.matching',
  'premium.feature.secure',
  'premium.feature.scheduling',
];

export default function PremiumScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top + 8, 18) }]}>
      <View style={styles.backgroundGlowTop} />
      <View style={styles.backgroundGlowBottom} />

      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()} activeOpacity={0.85}>
          <Ionicons name="close" size={20} color="#23443c" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.premiumBadge}>
            <Ionicons name="diamond" size={14} color="#7a4a10" />
            <Text style={styles.premiumBadgeText}>{t('premium.trigger')}</Text>
          </View>
          <Text style={styles.title}>{t('premium.title')}</Text>
          <Text style={styles.subtitle}>{t('premium.subtitle')}</Text>

          <View style={styles.featureList}>
            {features.map((featureKey) => (
              <View key={featureKey} style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={18} color="#276653" />
                <Text style={styles.featureText}>{t(featureKey)}</Text>
              </View>
            ))}
          </View>
        </View>

        {plans.map((plan) => (
          <View key={plan.nameKey} style={[styles.planCard, { borderColor: plan.background }]}> 
            <View style={[styles.planRibbon, { backgroundColor: plan.background }]}> 
              <Text style={[styles.planRibbonText, { color: plan.accent }]}>{t(plan.nameKey)}</Text>
            </View>

            <Text style={styles.planSessions}>{t(plan.sessionsKey)}</Text>
            <Text style={[styles.planPrice, { color: plan.accent }]}>{t(plan.priceKey)}</Text>
            <Text style={styles.planDetail}>{t(plan.detailKey)}</Text>

            <TouchableOpacity style={[styles.planButton, { backgroundColor: plan.accent }]} activeOpacity={0.88}>
              <Text style={styles.planButtonText}>{t('premium.cta')}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8f6f0',
  },
  backgroundGlowTop: {
    position: 'absolute',
    top: -70,
    right: -50,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(191, 122, 24, 0.14)',
  },
  backgroundGlowBottom: {
    position: 'absolute',
    bottom: 80,
    left: -70,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(45, 156, 134, 0.12)',
  },
  headerRow: {
    paddingHorizontal: 16,
    alignItems: 'flex-end',
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffffcc',
    borderWidth: 1,
    borderColor: '#d8e3de',
  },
  content: {
    paddingHorizontal: 14,
    paddingBottom: 28,
    gap: 14,
  },
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(222, 229, 225, 0.95)',
    shadowColor: '#22332d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
  premiumBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fdeccf',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
  },
  premiumBadgeText: {
    color: '#7a4a10',
    fontSize: 11,
    fontWeight: '800',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#18211f',
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: '#61706b',
  },
  featureList: {
    marginTop: 16,
    gap: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    flex: 1,
    color: '#23443c',
    fontSize: 13,
    fontWeight: '600',
  },
  planCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    shadowColor: '#22332d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 1,
  },
  planRibbon: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
  },
  planRibbonText: {
    fontSize: 11,
    fontWeight: '800',
  },
  planSessions: {
    fontSize: 22,
    lineHeight: 29,
    fontWeight: '800',
    color: '#18211f',
  },
  planPrice: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: '800',
  },
  planDetail: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 20,
    color: '#62706b',
  },
  planButton: {
    marginTop: 16,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  planButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
});
