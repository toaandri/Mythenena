import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Language, useI18n } from '@/lib/i18n';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const languages: Language[] = ['fr', 'en', 'mg'];

type LanguageSwitcherProps = {
  showPremiumTrigger?: boolean;
  topOffset?: number;
};

export default function LanguageSwitcher({ showPremiumTrigger = false, topOffset = 8 }: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useI18n();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <View style={[styles.container, { top: insets.top + topOffset }]}>
      <View style={styles.actionsRow}>
        {showPremiumTrigger && (
          <TouchableOpacity
            style={styles.premiumTrigger}
            onPress={() => router.push('/premium')}
            activeOpacity={0.85}
          >
            <Ionicons name="diamond-outline" size={15} color="#7a4a10" />
            <Text style={styles.premiumTriggerText}>{t('premium.trigger')}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.trigger} onPress={() => setOpen((current) => !current)} activeOpacity={0.85}>
          <Ionicons name="language-outline" size={16} color="#1f5e52" />
          <Text style={styles.triggerText}>{language.toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      {open && (
        <View style={styles.menu}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang}
              style={[styles.item, language === lang && styles.itemActive]}
              onPress={() => {
                setLanguage(lang);
                setOpen(false);
              }}
              activeOpacity={0.85}
            >
              <Text style={[styles.itemText, language === lang && styles.itemTextActive]}>{t(`lang.${lang}`)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 12,
    zIndex: 999,
    alignItems: 'flex-end',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  premiumTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fdeccf',
    borderWidth: 1,
    borderColor: '#f0d6a3',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  premiumTriggerText: {
    color: '#7a4a10',
    fontSize: 11,
    fontWeight: '800',
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ecf7f2',
    borderWidth: 1,
    borderColor: '#d5e8e2',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  triggerText: {
    color: '#1f5e52',
    fontSize: 11,
    fontWeight: '800',
  },
  menu: {
    marginTop: 6,
    minWidth: 130,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d5e8e2',
    paddingVertical: 4,
    shadowColor: '#1c2b27',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  item: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  itemActive: {
    backgroundColor: '#ecf7f2',
  },
  itemText: {
    fontSize: 12,
    color: '#2d3d38',
    fontWeight: '600',
  },
  itemTextActive: {
    color: '#1f5e52',
    fontWeight: '800',
  },
});
