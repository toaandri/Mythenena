import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '@/lib/i18n';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Resource = {
  id: 'breathing' | 'rumination' | 'gratitude';
  titleKey: string;
  categoryKey: string;
  detailKey: string;
  icon: string;
  steps: string[];
  durationSec?: number;
  checklist?: string[];
  prompts?: string[];
};

type BreathingGuide = {
  phaseIndex: number;
  remaining: number;
  cycles: number;
};

const breathingPattern = [
  {
    id: 'inhale',
    labelKey: 'resources.breath.inhale',
    seconds: 4,
    cueKey: 'resources.breath.cue.inhale',
    color: '#37b59a',
    targetScale: 1.12,
  },
  {
    id: 'hold',
    labelKey: 'resources.breath.hold',
    seconds: 7,
    cueKey: 'resources.breath.cue.hold',
    color: '#2f8d79',
    targetScale: 1.1,
  },
  {
    id: 'exhale',
    labelKey: 'resources.breath.exhale',
    seconds: 8,
    cueKey: 'resources.breath.cue.exhale',
    color: '#1f7262',
    targetScale: 0.92,
  },
] as const;

const resources: Resource[] = [
  {
    id: 'breathing',
    titleKey: 'resources.breath.title',
    categoryKey: 'resources.breath.category',
    detailKey: 'resources.breath.detail',
    icon: 'leaf-outline',
    durationSec: 180,
    steps: [
      'resources.breath.step1',
      'resources.breath.step2',
      'resources.breath.step3',
      'resources.breath.step4',
      'resources.breath.step5',
    ],
  },
  {
    id: 'rumination',
    titleKey: 'resources.rumination.title',
    categoryKey: 'resources.rumination.category',
    detailKey: 'resources.rumination.detail',
    icon: 'moon-outline',
    steps: [
      'resources.rumination.step1',
      'resources.rumination.step2',
      'resources.rumination.step3',
      'resources.rumination.step4',
    ],
    checklist: [
      'resources.rumination.check1',
      'resources.rumination.check2',
      'resources.rumination.check3',
      'resources.rumination.check4',
    ],
  },
  {
    id: 'gratitude',
    titleKey: 'resources.gratitude.title',
    categoryKey: 'resources.gratitude.category',
    detailKey: 'resources.gratitude.detail',
    icon: 'sunny-outline',
    steps: [
      'resources.gratitude.step1',
      'resources.gratitude.step2',
      'resources.gratitude.step3',
    ],
    prompts: [
      'resources.gratitude.prompt1',
      'resources.gratitude.prompt2',
      'resources.gratitude.prompt3',
    ],
  },
];

export default function RessourcesTab() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [selectedResourceId, setSelectedResourceId] = useState<Resource['id'] | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [isLoadingResources, setIsLoadingResources] = useState(true);
  const [resourceError, setResourceError] = useState(false);
  const [longPressedResourceId, setLongPressedResourceId] = useState<Resource['id'] | null>(null);
  const [timerSec, setTimerSec] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [progressTrackWidth, setProgressTrackWidth] = useState(0);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [checklistState, setChecklistState] = useState<Record<string, boolean[]>>({});
  const [journalAnswers, setJournalAnswers] = useState<Record<string, string[]>>({});
  const [breathingGuide, setBreathingGuide] = useState<BreathingGuide>({
    phaseIndex: 0,
    remaining: breathingPattern[0].seconds,
    cycles: 0,
  });

  const screenFade = useRef(new Animated.Value(0)).current;
  const screenLift = useRef(new Animated.Value(18)).current;
  const detailAnim = useRef(new Animated.Value(0)).current;
  const breathingLevel = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef(resources.map(() => new Animated.Value(0))).current;
  const cardScales = useRef(resources.map(() => new Animated.Value(1))).current;
  const loadingPulse = useRef(new Animated.Value(0)).current;

  const selectedResource = useMemo(
    () => resources.find((item) => item.id === selectedResourceId) ?? null,
    [selectedResourceId]
  );

  const selectedSteps = useMemo(() => (selectedResource ? selectedResource.steps.map((key) => t(key)) : []), [selectedResource, t]);
  const selectedChecklist = useMemo(() => (selectedResource?.checklist ?? []).map((key) => t(key)), [selectedResource, t]);
  const selectedPrompts = useMemo(() => (selectedResource?.prompts ?? []).map((key) => t(key)), [selectedResource, t]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(screenFade, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(screenLift, {
        toValue: 0,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.stagger(
      90,
      cardAnims.map((anim) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 420,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        })
      )
    ).start();
  }, [cardAnims, screenFade, screenLift]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoadingResources(false);
      setResourceError(false);
    }, 420);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(loadingPulse, {
          toValue: 1,
          duration: 520,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(loadingPulse, {
          toValue: 0,
          duration: 520,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();
    return () => pulse.stop();
  }, [loadingPulse]);

  const loadingOpacity = loadingPulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] });

  useEffect(() => {
    Animated.timing(detailAnim, {
      toValue: selectedResource ? 1 : 0,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [detailAnim, selectedResource]);

  useEffect(() => {
    if (!selectedResource) return;
    const target = (stepIndex + 1) / selectedSteps.length;
    Animated.timing(progressAnim, {
      toValue: target,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progressAnim, selectedResource, selectedSteps.length, stepIndex]);

  useEffect(() => {
    if (selectedResourceId !== 'breathing') return;

    if (!isTimerRunning) {
      return;
    }

    const phase = breathingPattern[breathingGuide.phaseIndex];
    const targetLevel = phase.id === 'exhale' ? 0 : 1;

    Animated.timing(breathingLevel, {
      toValue: targetLevel,
      duration: phase.seconds * 1000,
      easing: phase.id === 'exhale' ? Easing.inOut(Easing.sin) : Easing.out(Easing.sin),
      useNativeDriver: true,
    }).start();
  }, [breathingGuide.phaseIndex, breathingLevel, isTimerRunning, selectedResourceId]);

  useEffect(() => {
    if (!isTimerRunning) return;
    if (timerSec <= 0) return;

    const interval = setInterval(() => {
      setTimerSec((current) => {
        if (current <= 1) {
          clearInterval(interval);
          return 0;
        }
        return current - 1;
      });

      if (selectedResourceId === 'breathing') {
        setBreathingGuide((current) => {
          if (current.remaining > 1) {
            return { ...current, remaining: current.remaining - 1 };
          }

          const nextPhaseIndex = (current.phaseIndex + 1) % breathingPattern.length;
          return {
            phaseIndex: nextPhaseIndex,
            remaining: breathingPattern[nextPhaseIndex].seconds,
            cycles: nextPhaseIndex === 0 ? current.cycles + 1 : current.cycles,
          };
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, selectedResourceId, timerSec]);

  const openResource = (resource: Resource) => {
    setSelectedResourceId(resource.id);
    setStepIndex(0);
    setIsTimerRunning(false);
    setTimerSec(resource.durationSec ?? 0);
    if (resource.id === 'breathing') {
      setBreathingGuide({ phaseIndex: 0, remaining: breathingPattern[0].seconds, cycles: 0 });
      breathingLevel.setValue(0);
    }

    const checklist = resource.checklist ?? [];
    const prompts = resource.prompts ?? [];

    if (checklist.length > 0 && !checklistState[resource.id]) {
      setChecklistState((current) => ({
        ...current,
        [resource.id]: checklist.map(() => false),
      }));
    }

    if (prompts.length > 0 && !journalAnswers[resource.id]) {
      setJournalAnswers((current) => ({
        ...current,
        [resource.id]: prompts.map(() => ''),
      }));
    }
  };

  const closeResource = () => {
    setSelectedResourceId(null);
    setIsTimerRunning(false);
    breathingLevel.setValue(0);
  };

  const toggleChecklistItem = (resourceId: string, itemIndex: number) => {
    setChecklistState((current) => {
      const source = current[resourceId] ?? [];
      const next = [...source];
      next[itemIndex] = !next[itemIndex];
      return { ...current, [resourceId]: next };
    });
  };

  const updatePrompt = (resourceId: string, itemIndex: number, value: string) => {
    setJournalAnswers((current) => {
      const source = current[resourceId] ?? [];
      const next = [...source];
      next[itemIndex] = value;
      return { ...current, [resourceId]: next };
    });
  };

  const formatTimer = (seconds: number) => {
    const min = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const sec = Math.floor(seconds % 60)
      .toString()
      .padStart(2, '0');
    return `${min}:${sec}`;
  };

  if (selectedResource) {
    const progress = Math.round(((stepIndex + 1) / selectedSteps.length) * 100);
    const checklist: string[] = selectedChecklist;
    const checks = checklistState[selectedResource.id] ?? checklist.map(() => false);
    const prompts: string[] = selectedPrompts;
    const promptValues = journalAnswers[selectedResource.id] ?? prompts.map(() => '');
    const activeBreathingPhase = breathingPattern[breathingGuide.phaseIndex];

    return (
      <Animated.View style={[styles.screen, styles.screenAnimated, { paddingTop: Math.max(insets.top + 8, 18), opacity: screenFade, transform: [{ translateY: screenLift }] }]}>
        <View style={styles.backgroundBlobTop} />
        <View style={styles.backgroundBlobBottom} />
        <View style={styles.screenHeader}>
          <TouchableOpacity style={styles.backRow} onPress={closeResource} activeOpacity={0.8}>
            <Ionicons name="chevron-back" size={18} color="#276653" />
            <Text style={styles.backText}>{t('resources.back')}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t(selectedResource.titleKey)}</Text>
          <Text style={styles.headerSubtitle}>{t(selectedResource.categoryKey)}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.exerciseCard, styles.glassCard, { opacity: detailAnim, transform: [{ translateY: detailAnim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }] }]}>
            <View style={styles.progressRow}>
              <Text style={styles.progressText}>{t('resources.progress')}: {progress}%</Text>
              <Text style={styles.progressText}>{t('resources.step')} {stepIndex + 1}/{selectedSteps.length}</Text>
            </View>
            <View style={styles.progressTrack} onLayout={(event) => setProgressTrackWidth(event.nativeEvent.layout.width)}>
              <Animated.View style={[styles.progressFill, { width: Animated.multiply(progressAnim, progressTrackWidth) }]} />
            </View>
            <Text style={styles.exerciseStep}>{selectedSteps[stepIndex]}</Text>

            <View style={styles.stepActions}>
              <TouchableOpacity
                style={[styles.smallButton, stepIndex === 0 && styles.disabledButton]}
                onPress={() => setStepIndex((current) => Math.max(0, current - 1))}
                disabled={stepIndex === 0}
              >
                <Text style={styles.smallButtonText}>{t('resources.previous')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.smallButton, stepIndex === selectedSteps.length - 1 && styles.disabledButton]}
                onPress={() => setStepIndex((current) => Math.min(selectedSteps.length - 1, current + 1))}
                disabled={stepIndex === selectedSteps.length - 1}
              >
                <Text style={styles.smallButtonText}>{t('resources.next')}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {typeof selectedResource.durationSec === 'number' && (
            <Animated.View style={[styles.exerciseCard, styles.glassCard, { opacity: detailAnim, transform: [{ translateY: detailAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
              <Text style={styles.blockTitle}>{t('resources.timer')}</Text>
              <Text style={styles.timerValue}>{formatTimer(timerSec)}</Text>

              {selectedResource.id === 'breathing' && (
                <View style={styles.breathingPlayground}>
                  <View style={styles.breathingLineStage}>
                    <View style={styles.breathingLineGridTop} />
                    <View style={styles.breathingLineGridMid} />
                    <View style={styles.breathingLineGridBottom} />

                    <Animated.View
                      style={[
                        styles.breathingLine,
                        {
                          backgroundColor: activeBreathingPhase.color,
                          transform: [
                            {
                              translateY: breathingLevel.interpolate({
                                inputRange: [0, 1],
                                outputRange: [82, 12],
                              }),
                            },
                          ],
                        },
                      ]}
                    />
                    <Animated.View
                      style={[
                        styles.breathingCursor,
                        {
                          backgroundColor: activeBreathingPhase.color,
                          transform: [
                            {
                              translateY: breathingLevel.interpolate({
                                inputRange: [0, 1],
                                outputRange: [76, 6],
                              }),
                            },
                          ],
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.breathingLabelRow}>
                    <Text style={styles.breathingPhaseTitle}>{t(activeBreathingPhase.labelKey)}</Text>
                    <Text style={styles.breathingPhaseCount}>{breathingGuide.remaining}s</Text>
                  </View>
                  <View style={styles.breathingMetaRow}>
                    <Text style={styles.breathingMetaText}>{t('resources.breath.cycle')} {breathingGuide.cycles + 1}</Text>
                    <Text style={styles.breathingMetaText}>{t('resources.breath.pattern')}</Text>
                  </View>
                  <Text style={styles.breathingCue}>{t(activeBreathingPhase.cueKey)}</Text>
                </View>
              )}

              <View style={styles.stepActions}>
                <TouchableOpacity style={styles.smallButton} onPress={() => setIsTimerRunning((current) => !current)}>
                  <Text style={styles.smallButtonText}>{isTimerRunning ? t('resources.pause') : t('resources.startTimer')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.smallButton}
                  onPress={() => {
                    setIsTimerRunning(false);
                    setTimerSec(selectedResource.durationSec ?? 0);
                    if (selectedResource.id === 'breathing') {
                      setBreathingGuide({ phaseIndex: 0, remaining: breathingPattern[0].seconds, cycles: 0 });
                      breathingLevel.setValue(0);
                    }
                  }}
                >
                  <Text style={styles.smallButtonText}>{t('resources.reset')}</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          {checklist.length > 0 && (
            <Animated.View style={[styles.exerciseCard, styles.glassCard, { opacity: detailAnim, transform: [{ translateY: detailAnim.interpolate({ inputRange: [0, 1], outputRange: [22, 0] }) }] }]}>
              <Text style={styles.blockTitle}>{t('resources.checklist')}</Text>
              {checklist.map((item: string, index: number) => (
                <TouchableOpacity
                  key={`${item}-${index}`}
                  style={styles.checkItem}
                  onPress={() => toggleChecklistItem(selectedResource.id, index)}
                  activeOpacity={0.8}
                >
                  <Ionicons name={checks[index] ? 'checkbox' : 'square-outline'} size={18} color="#276653" />
                  <Text style={styles.checkText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </Animated.View>
          )}

          {prompts.length > 0 && (
            <Animated.View style={[styles.exerciseCard, styles.glassCard, { opacity: detailAnim, transform: [{ translateY: detailAnim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }] }]}>
              <Text style={styles.blockTitle}>{t('resources.journal')}</Text>
              {prompts.map((prompt: string, index: number) => (
                <View key={`${prompt}-${index}`} style={styles.promptItem}>
                  <Text style={styles.promptText}>{prompt}</Text>
                  <TextInput
                    value={promptValues[index]}
                    onChangeText={(value) => updatePrompt(selectedResource.id, index, value)}
                    style={styles.promptInput}
                    placeholder={t('resources.answerPlaceholder')}
                    placeholderTextColor="#98a29e"
                  />
                </View>
              ))}
            </Animated.View>
          )}

          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => {
              setCompleted((current) => ({ ...current, [selectedResource.id]: true }));
              closeResource();
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.completeButtonText}>{t('resources.complete')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.screen, styles.screenAnimated, { paddingTop: Math.max(insets.top + 8, 18), opacity: screenFade, transform: [{ translateY: screenLift }] }]}>
      <View style={styles.backgroundBlobTop} />
      <View style={styles.backgroundBlobBottom} />
      <View style={styles.screenHeader}>
        <Text style={styles.headerTitle}>{t('resources.title')}</Text>
        <Text style={styles.headerSubtitle}>{t('resources.subtitle')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        {isLoadingResources && (
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>{t('common.loading')}</Text>
            {[0, 1].map((idx) => (
              <Animated.View key={idx} style={[styles.skeletonCard, { opacity: loadingOpacity }]}>
                <View style={styles.skeletonIcon} />
                <View style={styles.skeletonTextWrap}>
                  <View style={styles.skeletonLine} />
                  <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
                </View>
              </Animated.View>
            ))}
          </View>
        )}

        {!isLoadingResources && resourceError && (
          <View style={styles.stateCard}>
            <Ionicons name="cloud-offline-outline" size={20} color="#c53030" />
            <Text style={styles.stateTitle}>{t('common.networkError')}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setResourceError(false);
                setIsLoadingResources(true);
                setTimeout(() => setIsLoadingResources(false), 420);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isLoadingResources && !resourceError && resources.length === 0 && (
          <View style={styles.stateCard}>
            <Ionicons name="book-outline" size={20} color="#5f6966" />
            <Text style={styles.stateTitle}>{t('resources.emptyTitle')}</Text>
            <Text style={styles.stateSubtitle}>{t('resources.emptySubtitle')}</Text>
          </View>
        )}

        {!isLoadingResources && !resourceError && resources.map((resource, index) => (
          <Animated.View
            key={resource.id}
            style={{
              opacity: cardAnims[index],
              transform: [
                { translateY: cardAnims[index].interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) },
                { scale: cardScales[index] },
              ],
            }}
          >
            <TouchableOpacity
              style={[styles.resourceCard, styles.glassCard, longPressedResourceId === resource.id && styles.resourceCardLongPressed]}
              activeOpacity={0.92}
              onPressIn={() =>
                Animated.spring(cardScales[index], {
                  toValue: 0.98,
                  friction: 8,
                  tension: 180,
                  useNativeDriver: true,
                }).start()
              }
              onPressOut={() =>
                Animated.spring(cardScales[index], {
                  toValue: 1,
                  friction: 8,
                  tension: 180,
                  useNativeDriver: true,
                }).start()
              }
              onLongPress={() => {
                setLongPressedResourceId(resource.id);
                setTimeout(() => setLongPressedResourceId((current) => (current === resource.id ? null : current)), 280);
              }}
              onPress={() => openResource(resource)}
            >
              <View style={styles.cardTopRow}>
                <View style={styles.iconWrap}>
                  <Ionicons name={resource.icon as any} size={18} color="#276653" />
                </View>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{t(resource.categoryKey)}</Text>
                </View>
              </View>

              <Text style={styles.resourceTitle}>{t(resource.titleKey)}</Text>
              <Text style={styles.resourceDetail}>{t(resource.detailKey)}</Text>

              <View style={styles.openRow}>
                <Text style={styles.openText}>{completed[resource.id] ? t('resources.redo') : t('resources.start')}</Text>
                <Ionicons name="arrow-forward" size={14} color="#276653" />
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8f6f0',
  },
  screenAnimated: {
    overflow: 'hidden',
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
  backgroundBlobBottom: {
    position: 'absolute',
    bottom: 120,
    left: -90,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(45, 156, 134, 0.1)',
  },
  screenHeader: { paddingHorizontal: 18, marginBottom: 12 },
  headerTitle: { fontSize: 36, fontWeight: '800', color: '#18211f', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: '#6b7571', marginTop: 2, fontWeight: '500' },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 10 },
  backText: { color: '#276653', fontSize: 13, fontWeight: '700' },
  listContainer: {
    marginHorizontal: 8,
    marginBottom: 84,
    padding: 10,
    backgroundColor: '#f9fbfa',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(220, 226, 223, 0.9)',
    gap: 10,
  },
  resourceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#1c2b27',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  resourceCardLongPressed: {
    transform: [{ scale: 0.985 }],
    borderColor: '#276653',
  },
  stateCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(220, 226, 223, 0.9)',
    padding: 14,
    alignItems: 'center',
    gap: 8,
  },
  skeletonCard: {
    width: '100%',
    backgroundColor: '#f7fbf9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5ece9',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  skeletonIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#e5ece9',
  },
  skeletonTextWrap: {
    flex: 1,
    gap: 8,
  },
  stateTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#183e36',
  },
  stateSubtitle: {
    fontSize: 12,
    color: '#51695f',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 2,
    borderRadius: 10,
    backgroundColor: '#276653',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  skeletonLine: {
    width: '100%',
    height: 9,
    borderRadius: 999,
    backgroundColor: '#e7ecea',
  },
  skeletonLineShort: {
    width: '76%',
  },
  glassCard: {
    borderWidth: 1,
    borderColor: 'rgba(221, 230, 226, 0.95)',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ecf7f2',
  },
  categoryBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#ecf7f2',
  },
  categoryText: {
    color: '#2a7567',
    fontSize: 10,
    fontWeight: '700',
  },
  resourceTitle: {
    fontSize: 17,
    color: '#183e36',
    fontWeight: '700',
    marginBottom: 6,
  },
  resourceDetail: {
    fontSize: 13,
    color: '#51695f',
    lineHeight: 19,
  },
  openRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  openText: {
    color: '#276653',
    fontSize: 13,
    fontWeight: '700',
  },
  exerciseCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#1c2b27',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressText: {
    fontSize: 12,
    color: '#51695f',
    fontWeight: '600',
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: '#e4ece9',
    marginBottom: 10,
  },
  progressFill: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#276653',
  },
  exerciseStep: {
    fontSize: 16,
    color: '#183e36',
    fontWeight: '700',
    lineHeight: 24,
  },
  stepActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  smallButton: {
    flex: 1,
    backgroundColor: '#276653',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  disabledButton: {
    backgroundColor: '#a7cfc4',
  },
  smallButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  blockTitle: {
    fontSize: 15,
    color: '#183e36',
    fontWeight: '700',
    marginBottom: 10,
  },
  timerValue: {
    fontSize: 34,
    fontWeight: '800',
    color: '#276653',
    letterSpacing: 1,
    textAlign: 'center',
  },
  breathingPlayground: {
    marginTop: 8,
    marginBottom: 4,
    alignItems: 'center',
  },
  breathingLineStage: {
    width: '100%',
    maxWidth: 280,
    height: 100,
    borderRadius: 14,
    backgroundColor: '#eff6f3',
    borderWidth: 1,
    borderColor: '#d5e7e1',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  breathingLineGridTop: {
    position: 'absolute',
    top: 18,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#dce9e4',
  },
  breathingLineGridMid: {
    position: 'absolute',
    top: 49,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#dce9e4',
  },
  breathingLineGridBottom: {
    position: 'absolute',
    bottom: 18,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#dce9e4',
  },
  breathingLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 3,
    borderRadius: 4,
  },
  breathingCursor: {
    position: 'absolute',
    right: 10,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#1d6f5f',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  breathingLabelRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breathingPhaseTitle: {
    color: '#285f54',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  breathingPhaseCount: {
    color: '#276653',
    fontSize: 20,
    fontWeight: '800',
  },
  breathingMetaRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
  },
  breathingMetaText: {
    backgroundColor: '#ecf7f2',
    color: '#2a7567',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  breathingCue: {
    marginTop: 8,
    color: '#4a5e58',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 6,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  checkText: {
    fontSize: 14,
    color: '#183e36',
    flex: 1,
  },
  promptItem: {
    marginBottom: 10,
  },
  promptText: {
    fontSize: 13,
    color: '#4f5b57',
    marginBottom: 6,
    fontWeight: '600',
  },
  promptInput: {
    backgroundColor: '#f2f2e9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#183e36',
    fontSize: 14,
  },
  completeButton: {
    marginTop: 2,
    marginBottom: 8,
    backgroundColor: '#276653',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
