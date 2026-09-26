import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/OutfitText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function Page({ children }: React.PropsWithChildren) {
  const insets = useSafeAreaInsets();
  return <ScrollView style={s.screen} contentContainerStyle={[s.page, { paddingTop: insets.top + 86, paddingBottom: 100 + insets.bottom }]} keyboardShouldPersistTaps="handled">{children}</ScrollView>;
}
export function Heading({ label, title, subtitle }: { label: string; title: string; subtitle?: string }) {
  return <View style={s.heading}><Text style={s.eyebrow}>{label.toUpperCase()}</Text><Text accessibilityRole="header" style={s.title}>{title}</Text>{subtitle && <Text style={s.muted}>{subtitle}</Text>}</View>;
}
export function Button({ label, onPress, disabled, secondary, busy }: { label: string; onPress: () => void; disabled?: boolean; secondary?: boolean; busy?: boolean }) {
  return <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled: !!disabled || !!busy }} disabled={disabled || busy} onPress={onPress} style={[s.button, secondary && s.secondary, (disabled || busy) && { opacity: 0.5 }]}>{busy ? <ActivityIndicator color="#276653" /> : <Text style={[s.buttonText, secondary && { color: '#276653' }]}>{label}</Text>}</TouchableOpacity>;
}
export function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected: active }} onPress={onPress} style={[s.chip, active && s.active]}><Text style={[s.small, active && { color: '#fff' }]}>{label}</Text></TouchableOpacity>;
}
export function Avatar({ name }: { name: string }) { return <View style={s.avatar}><Text style={s.initials}>{name.split(' ').slice(0, 2).map(n => n[0]).join('')}</Text></View>; }
export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8f6f0' },
  page: { paddingHorizontal: 23, gap: 16, width: '100%', maxWidth: 640, alignSelf: 'center' },
  heading: { gap: 12, marginBottom: 6 },
  eyebrow: { fontSize: 11, letterSpacing: 1.7, color: '#64766a' },
  title: { fontSize: 34, lineHeight: 39, letterSpacing: -0.7, color: '#183e36' },
  name: { fontSize: 16, fontWeight: '600', color: '#183e36' },
  text: { fontSize: 14, lineHeight: 23, color: '#183e36' },
  muted: { fontSize: 13, lineHeight: 22, color: '#64766a' },
  small: { fontSize: 12, lineHeight: 18, color: '#64766a' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  grow: { flex: 1, minWidth: 0, gap: 4 },
  card: { borderRadius: 24, backgroundColor: '#fffefa', borderColor: '#dce5d9', borderWidth: 1, padding: 20, gap: 16 },
  banner: { backgroundColor: '#e6ede5', borderRadius: 20, padding: 18, gap: 8 },
  button: { backgroundColor: '#276653', minHeight: 49, borderRadius: 16, padding: 14, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  secondary: { backgroundColor: '#fffefa', borderColor: '#dce5d9', borderWidth: 1 },
  chip: { minHeight: 44, borderRadius: 24, paddingHorizontal: 15, paddingVertical: 12, borderWidth: 1, borderColor: '#dce5d9', backgroundColor: '#fffefa' },
  active: { backgroundColor: '#276653', borderColor: '#276653' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#e6ede5', alignItems: 'center', justifyContent: 'center' },
  initials: { fontSize: 20, color: '#276653' },
  input: { borderWidth: 1, borderColor: '#dce5d9', borderRadius: 16, padding: 15, backgroundColor: '#fffefa', color: '#183e36', fontSize: 14, minHeight: 52 },
  textarea: { minHeight: 120, textAlignVertical: 'top' },
  error: { color: '#9c3838', fontSize: 13, lineHeight: 21 },
  divider: { borderBottomWidth: 1, borderBottomColor: '#dce5d9', paddingVertical: 19 },
});
