import { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, BackHandler, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, TextInput } from '@/components/OutfitText';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useI18n } from '@/lib/i18n';
import { resourcesCopy, type ResourcesCopy } from '@/lib/resourcesCopy';
import { BodyLight, CalmOrb, Cloud, Garden, Pebble } from './visuals';
import { usePlayback, useReducedMotion } from './motion';

type Exercise = 'breath' | 'ground' | 'gratitude' | 'body' | 'thoughts';
type Props = { copy: ResourcesCopy; reduced: boolean; onDone: () => void };
const cards: { id: Exclude<Exercise, 'breath'>; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { id: 'ground', icon: 'hand-left-outline' },
  { id: 'gratitude', icon: 'leaf-outline' },
  { id: 'body', icon: 'body-outline' },
  { id: 'thoughts', icon: 'cloud-outline' },
];
function Button({ label, onPress, secondary = false, disabled = false, testID }: { label: string; onPress: () => void; secondary?: boolean; disabled?: boolean; testID?: string }) {
  return <TouchableOpacity testID={testID} accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={[secondary ? s.link : s.primary, disabled && s.disabled]}><Text style={secondary ? s.linkText : s.primaryText}>{label}</Text></TouchableOpacity>;
}
function Heading({ title, note }: { title: string; note?: string }) { return <><Text accessibilityRole="header" style={s.title}>{title}</Text>{note && <Text style={s.sub}>{note}</Text>}</>; }
function Completion({ copy, onBack }: { copy: ResourcesCopy; onBack: () => void }) {
  return <View style={s.center}><View style={s.check}><Ionicons name="checkmark" size={38} color="#276653" /></View><Text style={s.eyebrow}>{copy.moment}</Text><Heading title={copy.thanks} note={copy.doneNote} /><Button label={copy.return} onPress={onBack} /></View>;
}

function Breathing({ copy, reduced, onDone, onReturn }: Props & { onReturn: () => void }) {
  const [duration, setDuration] = useState(60);
  const clock = usePlayback(duration);
  const started = clock.running || clock.elapsed > 0;
  const inhale = clock.elapsed % 10 < 5;
  // Samples of a cosine curve give the native driver a smooth 5s/5s cycle.
  const scale = useMemo(() => {
    const samples = Array.from({ length: duration * 4 + 1 }, (_, i) => i / (duration * 4));
    return clock.progress.interpolate({ inputRange: samples, outputRange: samples.map(p => 0.9 + (1 - Math.cos(p * duration / 10 * Math.PI * 2)) * 0.17) });
  }, [clock.progress, duration]);
  if (clock.finished) return <Completion copy={copy} onBack={onReturn} />;
  const seconds = Math.max(0, Math.ceil(duration - clock.elapsed));
  return <View style={s.center}>
    <Heading title={copy.breath} note={copy.breathIntro} />
    <View style={s.breathStage} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"><View style={s.halo} /><View style={[s.halo, { width: 178, height: 178, borderRadius: 89 }]} /><Animated.View testID="breathing-orb" style={{ transform: [{ scale: reduced ? 1 : scale }] }}><CalmOrb /></Animated.View></View>
    <Text style={s.phase} accessibilityLiveRegion="polite">{clock.running ? (inhale ? copy.inhale : copy.exhale) : started ? copy.paused : copy.sit}</Text>
    <Text style={s.sub}>{copy.breathCue}</Text>
    <View style={s.durations}>{[60, 180, 300].map(value => <TouchableOpacity key={value} accessibilityRole="button" accessibilityState={{ selected: duration === value, disabled: started }} disabled={started} onPress={() => setDuration(value)} style={[s.chip, duration === value && s.chipActive]}><Text style={s.chipText}>{value / 60} min</Text></TouchableOpacity>)}</View>
    <View accessibilityRole="progressbar" accessibilityLabel={copy.breath} accessibilityValue={{ min: 0, max: duration, now: Math.floor(clock.elapsed) }} style={s.meter}><View style={[s.meterFill, { width: `${clock.elapsed / duration * 100}%` }]} /></View>
    <View style={s.meta}><Text testID="breathing-time" style={s.small}>{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</Text><Text style={s.small}>{copy.noHold}</Text></View>
    <Button label={clock.running ? copy.pause : started ? copy.resume : copy.start} onPress={clock.running ? clock.pause : clock.start} />
    <Button label={copy.stop} secondary onPress={onDone} /><Text style={s.footnote}>{copy.breathFoot}</Text>
  </View>;
}

function Grounding({ copy, reduced, onDone }: Props) {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const count = 5 - step;
  const next = () => { if (step === 4) onDone(); else { setStep(step + 1); setSelected([]); } };
  return <View style={s.center}><Text style={s.eyebrow}>5 · 4 · 3 · 2 · 1</Text><Heading title={copy.titles[0]} />
    <View style={s.steps}>{[0, 1, 2, 3, 4].map(i => <View key={i} style={[s.stepDot, i <= step && s.stepActive]} />)}</View>
    <Text style={s.phase} accessibilityLiveRegion="polite">{copy.senses[step]}</Text><Text style={s.sub}>{copy.senseNotes[step]}</Text>
    <View style={s.pond}>{Array.from({ length: count }, (_, i) => <TouchableOpacity key={`${step}-${i}`} accessibilityRole="button" accessibilityLabel={`${copy.stone} ${i + 1}`} accessibilityState={{ selected: selected.includes(i) }} onPress={() => setSelected(current => current.includes(i) ? current.filter(n => n !== i) : [...current, i])}><Pebble reduced={reduced} selected={selected.includes(i)}><Text style={s.stoneText}>{selected.includes(i) ? '✓' : i + 1}</Text></Pebble></TouchableOpacity>)}</View>
    <Text style={s.sub} accessibilityLiveRegion="polite">{selected.length} {copy.of} {count} · {copy.touch}</Text>
    <Button disabled={selected.length < count} label={step === 4 ? copy.finish : copy.nextSense} onPress={next} /><Button label={copy.skip} secondary onPress={next} /><Text style={s.footnote}>{copy.sensesFoot}</Text>
  </View>;
}

function Gratitude({ copy, reduced, onDone }: Props) {
  const [step, setStep] = useState(0);
  const [growth, setGrowth] = useState(0);
  const [text, setText] = useState('');
  const next = (grow: boolean) => { if (grow) setGrowth(current => current + 1); setText(''); setStep(current => current + 1); };
  return <View style={s.center}><Heading title={copy.gratitudeTitle} /><Garden growth={growth} reduced={reduced} />
    <View style={s.meta}><Text style={s.small}>{step < 3 ? `${copy.invitation} ${step + 1} ${copy.of} 3` : copy.journalDone}</Text><Text style={s.small}>{copy.optional}</Text></View>
    <Text style={s.prompt} accessibilityLiveRegion="polite">{step < 3 ? copy.prompts[step] : copy.keep}</Text>
    {step < 3 ? <><TextInput accessibilityLabel={copy.journalLabel} value={text} onChangeText={setText} placeholder={copy.placeholder} placeholderTextColor="#7a887e" multiline maxLength={400} style={s.journal} /><Button label={copy.plant} onPress={() => next(true)} /><Button label={copy.skipPrompt} secondary onPress={() => next(false)} /></> : <Button label={copy.finish} onPress={onDone} />}
    <Text style={s.footnote}>{copy.journalFoot}</Text>
  </View>;
}

function BodyExercise({ copy, reduced, onDone }: Props) {
  const [step, setStep] = useState(0);
  return <View style={s.center}><Heading title={copy.titles[2]} note={copy.bodyIntro} /><BodyLight step={step} reduced={reduced} />
    <Text style={s.small}>{copy.step} {step + 1} {copy.of} 4</Text><Text style={s.phase} accessibilityLiveRegion="polite">{copy.bodyParts[step]}</Text><Text style={[s.sub, s.bodyNote]}>{copy.bodyNotes[step]}</Text>
    <Button label={step === 3 ? copy.finish : copy.next} onPress={() => step === 3 ? onDone() : setStep(step + 1)} /><Button label={copy.stop} secondary onPress={onDone} /><Text style={s.footnote}>{copy.bodyFoot}</Text>
  </View>;
}

function Thoughts({ copy, reduced, onDone }: Props) {
  const clock = usePlayback(9);
  const started = clock.running || clock.elapsed > 0;
  return <View style={s.center}><Heading title={copy.titles[3]} note={copy.thoughtIntro} /><Cloud progress={clock.progress} reduced={reduced} label={copy.thought} />
    <Text style={s.phase} accessibilityLiveRegion="polite">{clock.finished ? copy.space : clock.running ? copy.drifting : started ? copy.paused : copy.observe}</Text><Text style={[s.sub, s.bodyNote]}>{clock.finished ? copy.thoughtFoot : started ? copy.driftNote : copy.thoughtNote}</Text>
    <Button label={clock.finished ? copy.again : !started ? copy.drift : clock.running ? copy.pause : copy.resume} onPress={() => { if (clock.running) clock.pause(); else { if (clock.finished) clock.reset(); clock.start(); } }} /><Button label={copy.finish} secondary onPress={onDone} /><Text style={s.footnote}>{copy.thoughtFoot}</Text>
  </View>;
}

export default function ResourcesExperience() {
  const { language } = useI18n();
  const copy = resourcesCopy[language];
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const [screen, setScreen] = useState<Exercise | 'library' | 'complete'>('library');
  const scroll = useRef<ScrollView>(null);
  const navigate = useCallback((next: typeof screen) => { setScreen(next); scroll.current?.scrollTo({ y: 0, animated: false }); }, []);
  const done = useCallback(() => navigate('complete'), [navigate]);
  useFocusEffect(useCallback(() => {
    if (Platform.OS !== 'android') return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => { if (screen === 'library') return false; navigate('library'); return true; });
    return () => subscription.remove();
  }, [screen, navigate]));
  return <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView ref={scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={[s.content, { paddingTop: insets.top + 82, paddingBottom: insets.bottom + 112 }]}>
      {screen !== 'library' && <TouchableOpacity accessibilityRole="button" accessibilityLabel={copy.return} style={s.back} onPress={() => navigate('library')}><Ionicons name="arrow-back" size={18} color="#617368" /><Text style={s.linkText}>{copy.back}</Text></TouchableOpacity>}
      {screen === 'library' && <>
        <Text style={s.eyebrow}>{copy.eyebrow}</Text><Text accessibilityRole="header" style={s.libraryTitle}>{copy.title}</Text><Text style={s.libraryIntro}>{copy.intro}</Text>
        <Text style={s.section}>{copy.others}</Text>{cards.map((card) => {
          const index = ['ground', 'gratitude', 'body', 'thoughts'].indexOf(card.id);
          const title = copy.titles[index];
          const note = copy.descriptions[index];
          return <TouchableOpacity key={card.id} accessibilityRole="button" accessibilityLabel={title} style={s.card} onPress={() => navigate(card.id)}><View style={s.cardIcon}><Ionicons name={card.icon} color="#276653" size={23} /></View><View style={s.grow}><Text style={s.cardTitle}>{title}</Text><Text style={s.cardNote}>{note}</Text></View><Ionicons name="arrow-forward" size={17} color="#276653" /></TouchableOpacity>;
        })}<Text style={s.footnote}>{copy.noStreak}</Text>
      </>}
      {screen === 'breath' && <Breathing copy={copy} reduced={reduced} onDone={done} onReturn={() => navigate('library')} />}
      {screen === 'ground' && <Grounding copy={copy} reduced={reduced} onDone={done} />}
      {screen === 'gratitude' && <Gratitude copy={copy} reduced={reduced} onDone={done} />}
      {screen === 'body' && <BodyExercise copy={copy} reduced={reduced} onDone={done} />}
      {screen === 'thoughts' && <Thoughts copy={copy} reduced={reduced} onDone={done} />}
      {screen === 'complete' && <Completion copy={copy} onBack={() => navigate('library')} />}
    </ScrollView>
  </KeyboardAvoidingView>;
}
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8f6f0' }, content: { width: '100%', maxWidth: 560, alignSelf: 'center', paddingHorizontal: 24 }, center: { width: '100%' },
  eyebrow: { fontSize: 11, letterSpacing: 1.7, textTransform: 'uppercase', color: '#617368', marginBottom: 12 },
  title: { fontSize: 33, lineHeight: 39, letterSpacing: -0.7, color: '#183e36', marginBottom: 13, textAlign: 'center' }, libraryTitle: { fontSize: 34, lineHeight: 40, letterSpacing: -0.7, color: '#183e36', marginBottom: 13 },
  sub: { fontSize: 13, lineHeight: 21, color: '#617368', textAlign: 'center', marginBottom: 18 }, libraryIntro: { fontSize: 13, lineHeight: 21, color: '#617368', maxWidth: 285 },
  primary: { width: '100%', backgroundColor: '#276653', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 12, minHeight: 50, alignItems: 'center', justifyContent: 'center' }, primaryText: { fontSize: 15, fontWeight: '600', color: '#fff', textAlign: 'center' }, disabled: { opacity: 0.45 }, link: { minHeight: 44, alignItems: 'center', justifyContent: 'center', padding: 12 }, linkText: { color: '#617368', fontSize: 12 }, back: { minHeight: 44, flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 18 },
  section: { fontSize: 14, fontWeight: '600', color: '#183e36', marginBottom: 10 }, card: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#dce5d9', borderRadius: 20, backgroundColor: '#fffefa', padding: 16, marginBottom: 12, minHeight: 86 }, cardIcon: { width: 43, height: 43, borderRadius: 15, backgroundColor: '#e6ede5', alignItems: 'center', justifyContent: 'center' }, grow: { flex: 1 }, cardTitle: { fontSize: 14, fontWeight: '600', color: '#183e36' }, cardNote: { fontSize: 12, lineHeight: 18, color: '#617368', marginTop: 4 },
  footnote: { fontSize: 11, lineHeight: 18, textAlign: 'center', color: '#617368', marginTop: 14, marginBottom: 14 }, check: { width: 95, height: 95, borderRadius: 48, backgroundColor: '#e6ede5', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: 55, marginBottom: 32 },
  breathStage: { height: 250, alignItems: 'center', justifyContent: 'center' }, halo: { position: 'absolute', width: 218, height: 218, borderRadius: 109, borderWidth: 1, borderColor: '#dce5d9' }, phase: { color: '#183e36', fontSize: 28, lineHeight: 35, textAlign: 'center', marginTop: 8, marginBottom: 10 },
  durations: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginVertical: 18 }, chip: { minHeight: 44, borderRadius: 24, borderWidth: 1, borderColor: '#dce5d9', paddingHorizontal: 18, justifyContent: 'center', backgroundColor: '#fffefa' }, chipActive: { backgroundColor: '#e6ede5', borderColor: '#276653' }, chipText: { fontSize: 12, color: '#276653' }, meter: { height: 4, borderRadius: 4, overflow: 'hidden', backgroundColor: '#e6ede5', marginTop: 12 }, meterFill: { height: 4, backgroundColor: '#276653' }, meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between', marginVertical: 15 }, small: { fontSize: 12, lineHeight: 18, color: '#617368', textAlign: 'center' },
  steps: { flexDirection: 'row', gap: 7, justifyContent: 'center', marginTop: 12, marginBottom: 25 }, stepDot: { width: 26, height: 4, borderRadius: 3, backgroundColor: '#dce5d9' }, stepActive: { backgroundColor: '#276653' }, pond: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', alignContent: 'center', gap: 16, minHeight: 230, paddingVertical: 25 }, stoneText: { fontSize: 23, color: '#276653' },
  prompt: { fontSize: 23, lineHeight: 31, textAlign: 'center', color: '#183e36', marginBottom: 18 }, journal: { width: '100%', minHeight: 90, maxHeight: 170, borderWidth: 1, borderColor: '#dce5d9', borderRadius: 17, backgroundColor: '#fffefa', padding: 14, fontSize: 16, lineHeight: 24, color: '#183e36', textAlignVertical: 'top', marginBottom: 16 }, bodyNote: { minHeight: 70, marginTop: 8, marginBottom: 25 },
});
