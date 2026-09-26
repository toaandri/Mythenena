import { useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/OutfitText';
import { Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSession } from '@/lib/session';
import { useI18n } from '@/lib/i18n';
import { welcomeCopy } from '@/lib/welcomeCopy';

export default function OnboardingScreen() {
  const { session, loading, onboardingComplete, finishOnboarding } = useSession();
  const { language } = useI18n();
  const copy = welcomeCopy[language];
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([null, null, null, null, null]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const lock = useRef(false);
  const scroll = useRef<ScrollView>(null);
  if (loading || (session && onboardingComplete === null)) return <View style={styles.loading}><ActivityIndicator color="#276653" /></View>;
  if (!session) return <Redirect href="/login" />;
  if (onboardingComplete) return <Redirect href="/(tabs)" />;
  const question = copy.questions[step];
  const finish = async (values: (number | null)[]) => {
    if (lock.current) return;
    lock.current = true;
    setSaving(true);
    setError(false);
    try { await finishOnboarding(values); }
    catch { setError(true); }
    finally { setSaving(false); lock.current = false; }
  };
  const advance = (skip = false) => {
    const values = answers.map((value, index) => index === step && skip ? null : value);
    setAnswers(values);
    if (step === 4) void finish(values);
    else { setStep(step + 1); scroll.current?.scrollTo({ y: 0, animated: false }); }
  };
  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView ref={scroll} contentContainerStyle={styles.content}>
        <View style={styles.top}>
          <Text style={styles.brand}>MYTHENENA</Text>
          <TouchableOpacity accessibilityRole="button" disabled={saving} onPress={() => void finish([null, null, null, null, null])} style={styles.textButton}><Text style={styles.link}>{copy.skipAll}</Text></TouchableOpacity>
        </View>
        <Text style={styles.welcome}>{copy.welcome}</Text>
        <Text style={styles.intro}>{copy.intro}</Text>
        <View style={styles.progress} accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: 5, now: step + 1 }}>
          {copy.questions.map((_, index) => <View key={index} style={[styles.segment, index <= step && styles.segmentActive]} />)}
        </View>
        <Text style={styles.count}>{copy.question} {step + 1} {copy.of} 5</Text>
        <Text accessibilityRole="header" accessibilityLiveRegion="polite" style={styles.title}>{question.title}</Text>
        <View accessibilityRole="radiogroup">
          {question.options.map((option, index) => (
            <TouchableOpacity key={`${step}-${index}`} disabled={saving} accessibilityRole="radio" accessibilityState={{ checked: answers[step] === index }} style={[styles.option, answers[step] === index && styles.selected]} onPress={() => setAnswers(current => current.map((value, i) => i === step ? index : value))}>
              <Text style={[styles.optionText, answers[step] === index && styles.selectedText]}>{option}</Text>
              <Ionicons name={answers[step] === index ? 'checkmark-circle' : 'ellipse-outline'} size={23} color={answers[step] === index ? '#fff' : '#63756c'} />
            </TouchableOpacity>
          ))}
        </View>
        {error && <Text accessibilityRole="alert" style={styles.error}>{copy.error}</Text>}
        <TouchableOpacity accessibilityRole="button" disabled={saving || answers[step] === null} style={[styles.primary, (saving || answers[step] === null) && styles.disabled]} onPress={() => advance()}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>{step === 4 ? copy.finish : copy.next}</Text>}
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" disabled={saving} style={styles.textButton} onPress={() => advance(true)}><Text style={styles.link}>{copy.skip}</Text></TouchableOpacity>
        {step > 0 && <TouchableOpacity accessibilityRole="button" disabled={saving} style={styles.textButton} onPress={() => setStep(step - 1)}><Text style={styles.link}>{copy.back}</Text></TouchableOpacity>}
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8f6f0' },
  loading: { flex: 1, justifyContent: 'center', backgroundColor: '#f8f6f0' },
  content: { padding: 24, maxWidth: 560, width: '100%', alignSelf: 'center' },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 24 },
  brand: { color: '#276653', fontSize: 14, fontWeight: '700', letterSpacing: 1 },
  welcome: { fontSize: 29, fontWeight: '600', color: '#183e36', marginBottom: 10 },
  intro: { color: '#63756c', fontSize: 14, lineHeight: 21 },
  progress: { flexDirection: 'row', gap: 7, marginTop: 28, marginBottom: 18 },
  segment: { flex: 1, height: 5, borderRadius: 3, backgroundColor: '#dfe6dc' },
  segmentActive: { backgroundColor: '#276653' },
  count: { color: '#63756c', fontSize: 12, marginBottom: 10 },
  title: { color: '#183e36', fontSize: 25, lineHeight: 33, marginBottom: 24 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 18, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: '#dfe6dc', marginBottom: 12, minHeight: 60 },
  selected: { backgroundColor: '#276653', borderColor: '#276653' },
  optionText: { flex: 1, color: '#183e36', fontSize: 15 },
  selectedText: { color: '#fff' },
  primary: { backgroundColor: '#276653', padding: 17, borderRadius: 16, alignItems: 'center', marginTop: 14, minHeight: 54 },
  primaryText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  disabled: { opacity: 0.5 },
  textButton: { minHeight: 44, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
  link: { color: '#276653', fontSize: 13 },
  error: { color: '#b02b2b', marginVertical: 10 },
});
