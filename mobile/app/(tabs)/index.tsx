import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/OutfitText';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useI18n } from '@/lib/i18n';
import { welcomeCopy } from '@/lib/welcomeCopy';

export default function IndexTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language } = useI18n();
  const copy = welcomeCopy[language];
  const openForum = () => router.push('/(tabs)/forum');
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 96, paddingBottom: insets.bottom + 110 }]} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>{copy.eyebrow}</Text>
        <Text style={styles.title}>{copy.title}</Text>
        <View style={styles.topics}>
          {[copy.confidence, copy.emotions].map(label => (
            <TouchableOpacity key={label} accessibilityRole="button" style={styles.chip} onPress={openForum}><Text style={styles.chipText}>{label}</Text></TouchableOpacity>
          ))}
        </View>
        <View style={styles.communityCard}>
          <View style={styles.author}>
            <View style={styles.avatar}><Ionicons name="people-outline" size={21} color="#276653" /></View>
            <View style={styles.grow}><Text style={styles.cardTitle}>{copy.community}</Text><Text style={styles.caption}>{copy.communityNote}</Text></View>
          </View>
          <Text style={styles.quote}>{copy.quote}</Text>
          <TouchableOpacity accessibilityRole="button" style={styles.supportButton} onPress={openForum}>
            <Ionicons name="heart-outline" size={18} color="#276653" /><Text style={styles.supportText}>{copy.support}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity accessibilityRole="button" style={styles.primary} onPress={openForum}>
          <Text style={styles.primaryText}>{copy.join}</Text><Ionicons name="arrow-forward" size={19} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.sectionTitle}>{copy.checkin}</Text>
        <TouchableOpacity accessibilityRole="button" style={styles.row} onPress={() => router.push('/(tabs)/chat')}>
          <Ionicons name="chatbubble-ellipses-outline" size={23} color="#276653" />
          <View style={styles.grow}><Text style={styles.cardTitle}>{copy.privateTitle}</Text><Text style={styles.caption}>{copy.privateNote}</Text></View>
          <Ionicons name="arrow-up-outline" style={styles.arrow} size={19} color="#276653" />
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" style={styles.row} onPress={() => router.push('/(tabs)/ressources')}>
          <Ionicons name="leaf-outline" size={23} color="#276653" />
          <View style={styles.grow}><Text style={styles.cardTitle}>{copy.pause}</Text><Text style={styles.caption}>{copy.pauseNote}</Text></View>
          <Ionicons name="arrow-up-outline" style={styles.arrow} size={19} color="#276653" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8f6f0' },
  content: { width: '100%', maxWidth: 600, alignSelf: 'center', paddingHorizontal: 24 },
  eyebrow: { fontSize: 11, letterSpacing: 1.8, textTransform: 'uppercase', color: '#63756c', marginBottom: 12 },
  title: { fontSize: 33, lineHeight: 40, letterSpacing: -0.8, color: '#183e36' },
  topics: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 22 },
  chip: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 24, borderWidth: 1, borderColor: '#dfe6dc', backgroundColor: '#fff' },
  chipText: { color: '#183e36', fontSize: 12 },
  communityCard: { backgroundColor: '#fff', borderRadius: 24, padding: 22, borderWidth: 1, borderColor: '#dfe6dc', marginBottom: 16 },
  author: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#e6ede5', alignItems: 'center', justifyContent: 'center' },
  grow: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#183e36' },
  caption: { fontSize: 12, lineHeight: 18, color: '#63756c', marginTop: 3 },
  quote: { fontSize: 23, lineHeight: 32, color: '#183e36', marginVertical: 21 },
  supportButton: { flexDirection: 'row', gap: 8, alignSelf: 'flex-start', alignItems: 'center', backgroundColor: '#e6ede5', borderRadius: 24, paddingHorizontal: 14, paddingVertical: 12, minHeight: 44 },
  supportText: { fontSize: 12, color: '#276653', flexShrink: 1 },
  primary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#276653', padding: 17, borderRadius: 16, minHeight: 52 },
  primaryText: { fontSize: 15, fontWeight: '600', color: '#fff', flexShrink: 1 },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: '#183e36', marginTop: 28, marginBottom: 14 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center', padding: 17, marginBottom: 12, borderWidth: 1, borderColor: '#dfe6dc', backgroundColor: '#fff', borderRadius: 18 },
  arrow: { transform: [{ rotate: '45deg' }] },
});
