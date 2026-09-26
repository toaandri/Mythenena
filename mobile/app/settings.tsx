import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/OutfitText';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const settingsItems = [
  { label: 'Profil', icon: 'person-circle-outline', color: '#276653', route: '/settings/profile' },
  { label: 'Règle de confidentialité', icon: 'shield-checkmark-outline', color: '#3b5bda', route: '/settings/privacy' },
  { label: 'Déconnexion', icon: 'log-out-outline', color: '#d65b5b', route: '/settings/security' },
  { label: 'Sécurité', icon: 'lock-closed-outline', color: '#bf7a18', route: '/settings/security' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={styles.backgroundBlobTop} />
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top + 8, 18) }]}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()} activeOpacity={0.85}>
          <Ionicons name="close" size={20} color="#23443c" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Paramètres</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {settingsItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.row}
              activeOpacity={0.8}
              onPress={() => router.push(item.route as any)}
            >
              <View style={[styles.iconWrap, { backgroundColor: `${item.color}18` }]}>
                <Ionicons name={item.icon as any} size={18} color={item.color} />
              </View>
              <Text style={styles.label}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color="#6b7a76" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8f6f0',
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
  content: {
    paddingHorizontal: 18,
    paddingBottom: 32,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingBottom: 10,
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
  topBarTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#183e36',
    letterSpacing: -0.4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#dfe9e5',
    shadowColor: '#22332d',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f6f0',
    backgroundColor: '#ffffff',
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  label: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#183e36',
  },
});
