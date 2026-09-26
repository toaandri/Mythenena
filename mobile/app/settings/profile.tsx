import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [pseudo, setPseudo] = useState('Mon pseudo');

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
            <Text style={styles.title}>Profil</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Pseudonyme</Text>
          <TextInput
            value={pseudo}
            onChangeText={setPseudo}
            placeholder="Saisissez votre pseudonyme"
            placeholderTextColor="#7a8a85"
            style={styles.input}
          />
          <Text style={styles.helperText}>
            Vous pouvez ajouter ou modifier votre pseudonyme ici.
          </Text>

          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.85}>
            <Text style={styles.primaryButtonText}>Enregistrer</Text>
          </TouchableOpacity>
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
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2d9c86',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: '#f4f8f6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dfe9e5',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1a2320',
    fontWeight: '600',
  },
  helperText: {
    marginTop: 12,
    color: '#5f726d',
    fontSize: 12,
    lineHeight: 18,
  },
  primaryButton: {
    marginTop: 18,
    backgroundColor: '#2d9c86',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});
