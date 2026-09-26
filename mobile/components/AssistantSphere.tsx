import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, AppState, Easing, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Concentric, offset layers keep the sphere's soft lighting on native and web.
const lighting = Array.from({ length: 48 }, (_, index) => {
  const ratio = index / 47;
  const size = 112 * (1 - ratio * 0.94);
  const rgb = [155, 189, 161].map((channel, i) => Math.round(channel + ([243, 247, 235][i] - channel) * ratio));
  return { width: size, height: size, borderRadius: size / 2, left: 56 - ratio * 21 - size / 2, top: 56 - ratio * 24 - size / 2, backgroundColor: `rgb(${rgb.join(',')})` };
});

export default function AssistantSphere({ active, busy, focused }: { active: boolean; busy: boolean; focused: boolean }) {
  const [pulse] = useState(() => new Animated.Value(0));
  const [reduceMotion, setReduceMotion] = useState(true);
  const [foreground, setForeground] = useState(AppState.currentState === 'active');
  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (mounted) setReduceMotion(value); }).catch(() => {});
    const motion = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    const app = AppState.addEventListener('change', value => setForeground(value === 'active'));
    return () => { mounted = false; motion.remove(); app.remove(); };
  }, []);
  useEffect(() => {
    pulse.setValue(0);
    if (reduceMotion || !focused || !foreground || (!active && !busy)) return;
    const duration = active ? 140 : 850;
    const step = (toValue: number, time: number) => Animated.timing(pulse, { toValue, duration: time, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false });
    const animation = Animated.loop(Animated.sequence([step(1, duration), step(0.15, duration * 0.8), step(0.65, duration * 0.7), step(0, duration)]));
    animation.start();
    return () => { animation.stop(); pulse.setValue(0); };
  }, [active, busy, focused, foreground, reduceMotion, pulse]);
  return (
    <View style={styles.stage} pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Animated.View style={[styles.halo, { opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.65] }), transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) }] }]} />
      <Animated.View testID="assistant-sphere" style={[styles.orb, { transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, active ? 1.08 : 1.035] }) }, { translateY: pulse.interpolate({ inputRange: [0, 1], outputRange: [0, active ? -2 : 0] }) }] }]}>
        {lighting.map((layer, index) => <View key={index} style={[styles.light, layer]} />)}
        <Ionicons name="leaf-outline" size={30} color="#276653" />
      </Animated.View>
    </View>
  );
}
const styles = StyleSheet.create({
  stage: { height: 150, alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', width: 132, height: 132, borderRadius: 66, backgroundColor: '#c6dacb' },
  orb: { width: 112, height: 112, borderRadius: 56, overflow: 'hidden', backgroundColor: '#a7c5ae', alignItems: 'center', justifyContent: 'center', shadowColor: '#276653', shadowOpacity: 0.18, shadowRadius: 15, shadowOffset: { width: 0, height: 7 } },
  light: { position: 'absolute' },
});
