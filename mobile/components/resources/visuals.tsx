import { memo } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGentleValue } from './motion';

const lighting = Array.from({ length: 40 }, (_, i) => {
  const r = i / 39;
  const size = 138 * (1 - r * 0.94);
  const rgb = [149, 187, 162].map((channel, c) => Math.round(channel + ([244, 248, 233][c] - channel) * r));
  return { width: size, height: size, borderRadius: size / 2, left: 69 - r * 25 - size / 2, top: 69 - r * 29 - size / 2, backgroundColor: `rgb(${rgb.join(',')})` };
});
export const CalmOrb = memo(function CalmOrb() {
  return <View style={s.orb} accessible={false}>{lighting.map((layer, i) => <View key={i} style={[s.absolute, layer]} />)}<Ionicons name="leaf-outline" size={29} color="#276653" /></View>;
});

export function Pebble({ selected, reduced, children }: { selected: boolean; reduced: boolean; children: React.ReactNode }) {
  const lift = useGentleValue(selected ? -6 : 0, reduced, 1200);
  return <Animated.View style={[s.pebble, selected && s.pebbleSelected, { transform: [{ translateY: lift }] }]}>{children}</Animated.View>;
}
function Leaf({ grown, left, top, reduced }: { grown: boolean; left?: boolean; top: number; reduced: boolean }) {
  const scale = useGentleValue(grown ? 1 : 0, reduced);
  return <Animated.View style={[s.leaf, { bottom: top, left: left ? 16 : 69, borderTopLeftRadius: left ? 0 : 50, borderTopRightRadius: left ? 50 : 0, borderBottomLeftRadius: left ? 50 : 0, borderBottomRightRadius: left ? 0 : 50, transform: [{ scale }, { rotate: left ? '25deg' : '-25deg' }] }]} />;
}
export function Garden({ growth, reduced }: { growth: number; reduced: boolean }) {
  const stretch = useGentleValue(0.3 + growth * 0.23, reduced);
  return <View style={s.garden} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
    <View style={s.gardenGlow} /><View style={s.soil} />
    <View style={s.plant}><Animated.View testID="gratitude-stem" style={[s.stem, { transform: [{ translateY: stretch.interpolate({ inputRange: [0, 1], outputRange: [75, 0] }) }, { scaleY: stretch }] }]} />
      <Leaf grown={growth >= 1} reduced={reduced} top={45} /><Leaf grown={growth >= 2} reduced={reduced} left top={81} /><Leaf grown={growth >= 3} reduced={reduced} top={119} />
    </View>
  </View>;
}
export function BodyLight({ step, reduced }: { step: number; reduced: boolean }) {
  const position = useGentleValue([0, 57, 120, 203][step], reduced, 2800);
  return <View style={s.bodyStage} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"><View style={s.body}>
    <View style={s.head} /><View style={s.torso} /><View style={s.arm} /><View style={[s.arm, { left: 114, transform: [{ rotate: '-12deg' }] }]} /><View style={s.leg} /><View style={[s.leg, { left: 82 }]} />
    <Animated.View testID="body-light" style={[s.light, { transform: [{ translateY: position }] }]}>{Array.from({ length: 16 }, (_, i) => <View key={i} style={{ position: 'absolute', width: 168 - i * 7, height: 88 - i * 4, borderRadius: 90, backgroundColor: `rgba(204,225,205,${0.015 + i * 0.003})` }} />)}</Animated.View>
  </View></View>;
}
export function Cloud({ progress, reduced, label }: { progress: Animated.Value; reduced: boolean; label: string }) {
  return <View style={s.sky} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"><Animated.View testID="thought-cloud" style={[s.cloud, { transform: [{ translateX: reduced ? 0 : progress.interpolate({ inputRange: [0, 1], outputRange: [-18, 330] }) }] }]}>
    <View style={s.cloudLobe} /><View style={[s.cloudLobe, { width: 61, height: 61, left: 80, top: -20 }]} />
    <Animated.Text style={s.cloudText}>{label}</Animated.Text>
  </Animated.View><View style={s.horizon} /></View>;
}
const s = StyleSheet.create({
  absolute: { position: 'absolute' }, orb: { width: 138, height: 138, borderRadius: 69, backgroundColor: '#95bba2', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  pebble: { width: 70, height: 65, borderRadius: 30, borderTopLeftRadius: 34, backgroundColor: '#fffefa', borderWidth: 1, borderColor: '#dce5d9', alignItems: 'center', justifyContent: 'center' },
  pebbleSelected: { backgroundColor: '#e6ede5', borderColor: '#276653' },
  garden: { height: 240, alignItems: 'center', justifyContent: 'center', marginBottom: 18 }, gardenGlow: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: '#e6ede580', top: 12 }, soil: { position: 'absolute', bottom: 16, width: 145, height: 17, borderRadius: 80, backgroundColor: '#e6ede5' },
  plant: { width: 140, height: 240 }, stem: { position: 'absolute', bottom: 24, left: 69, height: 150, width: 3, borderRadius: 3, backgroundColor: '#276653' }, leaf: { position: 'absolute', width: 53, height: 29, backgroundColor: '#95bba2' },
  bodyStage: { height: 276, alignItems: 'center', marginVertical: 14 }, body: { width: 150, height: 260 }, head: { position: 'absolute', width: 42, height: 47, left: 54, top: 8, borderRadius: 24, backgroundColor: '#c1d7c7' }, torso: { position: 'absolute', width: 73, height: 105, left: 39, top: 62, borderRadius: 32, backgroundColor: '#cddfcf' },
  arm: { position: 'absolute', width: 20, height: 105, left: 17, top: 69, borderRadius: 18, backgroundColor: '#cddfcf', transform: [{ rotate: '12deg' }] }, leg: { position: 'absolute', width: 28, height: 95, left: 40, top: 156, borderRadius: 15, backgroundColor: '#cddfcf' }, light: { position: 'absolute', left: -9, top: -15, width: 168, height: 88, alignItems: 'center', justifyContent: 'center' },
  sky: { height: 264, borderRadius: 100, backgroundColor: '#e6ede5', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginVertical: 22 }, cloud: { width: 162, minHeight: 69, borderRadius: 55, backgroundColor: '#fffefa', alignItems: 'center', justifyContent: 'center', padding: 15 }, cloudLobe: { position: 'absolute', width: 75, height: 75, borderRadius: 50, backgroundColor: '#fffefa', top: -28, left: 22 }, cloudText: { color: '#617368', fontStyle: 'italic', fontSize: 17 }, horizon: { position: 'absolute', bottom: -30, width: '140%', height: 80, borderRadius: 180, backgroundColor: '#95bba230' },
});
