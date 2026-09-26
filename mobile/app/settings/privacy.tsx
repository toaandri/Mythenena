import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/OutfitText';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const privacySections = [
  {
    title: 'Données collectées',
    body: 'Nous utilisons uniquement les informations nécessaires au bon fonctionnement de l’application, à la personnalisation du parcours et à la sécurité.',
  },
  {
    title: 'Utilisation des données',
    body: 'Les informations sont utilisées pour proposer des recommandations, sécuriser l’accès, et améliorer la qualité de l’expérience utilisateur.',
  },
  {
    title: 'Partage',
    body: 'Aucune donnée personnelle sensible n’est vendue ou partagée avec des tiers sans votre consentement explicite.',
  },
  {
    title: 'Droits',
    body: 'Vous pouvez demander la consultation, la modification ou la suppression de vos données depuis votre profil ou en contactant le support.',
  },
];

export default function PrivacySettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={styles.backgroundBlobTop} />
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top + 8, 18) }]}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()} activeOpacity={0.85}>
          <Ionicons name="close" size={20} color="#23443c" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Confidentialité</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {privacySections.map((item) => (
            <View key={item.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{item.title}</Text>
              <Text style={styles.sectionBody}>{item.body}</Text>
            </View>
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
    borderRadius: 20,
    padding: 18,
    shadowColor: '#22332d',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  section: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#183e36',
    marginBottom: 6,
  },
  sectionBody: {
    color: '#53615d',
    fontSize: 13,
    lineHeight: 20,
  },
});
