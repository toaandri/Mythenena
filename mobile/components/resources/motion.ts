import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, AppState, Easing } from 'react-native';
import { useFocusEffect } from 'expo-router';

export function useReducedMotion() {
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    let alive = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (alive) setReduced(value); }).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => { alive = false; subscription.remove(); };
  }, []);
  return reduced;
}

export function useGentleValue(target: number, reduced: boolean, duration = 1800) {
  const [value] = useState(() => new Animated.Value(target));
  useEffect(() => {
    const animation = Animated.timing(value, { toValue: target, duration: reduced ? 0 : duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false });
    animation.start();
    return () => animation.stop();
  }, [target, reduced, duration, value]);
  return value;
}

// A monotonic clock owns the elapsed time; the native driver owns visual frames.
// Losing focus pauses the exercise and requires an explicit resume.
export function usePlayback(duration: number) {
  const [progress] = useState(() => new Animated.Value(0));
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const offset = useRef(0);
  const pause = useCallback(() => setRunning(false), []);
  useFocusEffect(useCallback(() => pause, [pause]));
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => { if (state !== 'active') pause(); });
    return () => subscription.remove();
  }, [pause]);
  useEffect(() => {
    if (!running) return;
    const base = offset.current;
    const start = performance.now();
    const now = () => Math.min(duration, base + (performance.now() - start) / 1000);
    const animation = Animated.timing(progress, { toValue: 1, duration: Math.max(0, duration - base) * 1000, easing: Easing.linear, useNativeDriver: true, isInteraction: false });
    animation.start();
    const interval = setInterval(() => {
      const current = now();
      setElapsed(current);
      if (current >= duration) setRunning(false);
    }, 100);
    return () => { clearInterval(interval); offset.current = now(); animation.stop(); };
  }, [running, duration, progress]);
  const reset = () => { offset.current = 0; progress.setValue(0); setElapsed(0); };
  return { progress, running, elapsed, finished: elapsed >= duration, pause, start: () => setRunning(true), reset };
}
