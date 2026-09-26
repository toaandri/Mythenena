import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useI18n } from '@/lib/i18n';

type Psychologist = {
  nameKey: string;
  roleKey: string;
  specialtyKey: string;
  availabilityKey: string;
  color: string;
};

const psychologists: Psychologist[] = [
  {
    nameKey: 'psy.doctor1.name',
    roleKey: 'psy.doctor1.role',
    specialtyKey: 'psy.doctor1.specialty',
    availabilityKey: 'psy.doctor1.availability',
    color: '#3f7f71',
  },
  {
    nameKey: 'psy.doctor2.name',
    roleKey: 'psy.doctor2.role',
    specialtyKey: 'psy.doctor2.specialty',
    availabilityKey: 'psy.doctor2.availability',
    color: '#476a8f',
  },
  {
    nameKey: 'psy.doctor3.name',
    roleKey: 'psy.doctor3.role',
    specialtyKey: 'psy.doctor3.specialty',
    availabilityKey: 'psy.doctor3.availability',
    color: '#806279',
  },
];

export default function PsyTab() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top + 8, 18) }]}>
      <View style={styles.backgroundBlobTop} />
      <View style={styles.screenHeader}>
        <Text style={styles.headerTitle}>{t('psy.title')}</Text>
        <Text style={styles.headerSubtitle}>{t('psy.subtitle')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        {psychologists.map((doctor, index) => (
          <TouchableOpacity key={index} style={styles.card} activeOpacity={0.86}>
            <View style={styles.cardTopRow}>
              <View style={[styles.avatar, { backgroundColor: doctor.color }]}>
                <Ionicons name="medkit" size={18} color="#fff" />
              </View>

              <View style={styles.badgesRow}>
                <View style={styles.badgePrimary}>
                  <Text style={styles.badgePrimaryText}>{t('psy.badge.recommended')}</Text>
                </View>
                <View style={styles.badgeSecondary}>
                  <Text style={styles.badgeSecondaryText}>{index === 1 ? t('psy.badge.remote') : t('psy.badge.available')}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.name}>{t(doctor.nameKey)}</Text>
            <Text style={styles.role}>{t(doctor.roleKey)}</Text>
            <Text style={styles.specialty}>{t(doctor.specialtyKey)}</Text>

            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={14} color="#6b7571" />
              <Text style={styles.infoText}>{t(doctor.availabilityKey)}</Text>
            </View>

            <View style={styles.ctaRow}>
              <Text style={styles.ctaText}>{t('psy.cta')}</Text>
              <Ionicons name="arrow-forward" size={14} color="#2d9c86" />
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
    fontSize: 34,
    fontWeight: '800',
    color: '#18211f',
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7571',
    marginTop: 3,
    fontWeight: '500',
  },
  listContainer: {
    marginHorizontal: 8,
    marginBottom: 84,
    padding: 10,
    backgroundColor: '#f9fbfa',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(220, 226, 223, 0.9)',
    gap: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(223, 230, 227, 0.95)',
    shadowColor: '#1c2b27',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 6,
  },
  badgePrimary: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: '#e7f6f0',
  },
  badgePrimaryText: {
    color: '#2d846f',
    fontSize: 10,
    fontWeight: '800',
  },
  badgeSecondary: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: '#f3f6f4',
  },
  badgeSecondaryText: {
    color: '#64706b',
    fontSize: 10,
    fontWeight: '700',
  },
  name: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1a2320',
  },
  role: {
    marginTop: 4,
    fontSize: 13,
    color: '#2d9c86',
    fontWeight: '700',
  },
  specialty: {
    marginTop: 8,
    fontSize: 13,
    color: '#5d6864',
    lineHeight: 20,
  },
  infoRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    color: '#6b7571',
    fontSize: 12,
    fontWeight: '600',
  },
  ctaRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ctaText: {
    color: '#2d9c86',
    fontSize: 13,
    fontWeight: '700',
  },
});