import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
      <ScrollView
        style={{ paddingTop: Math.max(insets.top + 8, 18) }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.glassHeader}>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()} activeOpacity={0.85}>
            <Ionicons name="close" size={20} color="#23443c" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Confidentialité</Text>
          </View>
        </View>

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
  content: {
    paddingBottom: 118,
  },
  glassHeader: {
    marginHorizontal: 18,
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
    shadowColor: '#1b2e2a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 3,
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
  headerContent: {
    width: '100%',
    marginTop: 10,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#1a2320',
    letterSpacing: -0.4,
  },
  card: {
    marginHorizontal: 18,
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
    color: '#1a2320',
    marginBottom: 6,
  },
  sectionBody: {
    color: '#53615d',
    fontSize: 13,
    lineHeight: 20,
  },
});
