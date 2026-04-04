import { View, Text, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GenerationProgress as ProgressType, GenerationStage } from '@/hooks/useIDPhotoGenerator';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';

interface Props {
  progress: ProgressType;
  visible: boolean;
}

const STAGE_ICONS: Record<GenerationStage, { name: string; color: string }> = {
  idle: { name: 'ellipse-outline', color: colors.textTertiary },
  uploading: { name: 'cloud-upload-outline', color: colors.primary },
  processing: { name: 'sparkles-outline', color: colors.accent },
  finalizing: { name: 'checkmark-circle-outline', color: colors.success },
  done: { name: 'checkmark-circle', color: colors.success },
};

const STAGES_ORDER: GenerationStage[] = ['uploading', 'processing', 'finalizing', 'done'];

const STAGE_LABELS: Record<GenerationStage, string> = {
  idle: '',
  uploading: 'Upload',
  processing: 'AI Process',
  finalizing: 'Finalize',
  done: 'Done',
};

export function GenerationProgressOverlay({ progress, visible }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const barAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  useEffect(() => {
    Animated.spring(barAnim, {
      toValue: progress.percent / 100,
      useNativeDriver: false,
      tension: 60,
      friction: 10,
    }).start();
  }, [progress.percent]);

  useEffect(() => {
    if (visible && progress.stage !== 'done' && progress.stage !== 'idle') {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.12, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      pulseLoop.current.start();
    } else {
      pulseLoop.current?.stop();
      pulseAnim.setValue(1);
    }
    return () => pulseLoop.current?.stop();
  }, [visible, progress.stage]);

  if (!visible) return null;

  const currentStageIndex = STAGES_ORDER.indexOf(progress.stage);
  const icon = STAGE_ICONS[progress.stage] ?? STAGE_ICONS.uploading;

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <View style={styles.card}>
        {/* Animated Icon */}
        <Animated.View style={[styles.iconRing, { transform: [{ scale: pulseAnim }] }]}>
          <LinearGradient
            colors={progress.stage === 'done' ? [colors.success, '#0EC974'] : [colors.primary, colors.accent]}
            style={styles.iconGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name={icon.name as any} size={32} color="#fff" />
          </LinearGradient>
        </Animated.View>

        {/* Stage label */}
        <Text style={styles.stageLabel}>{progress.label}</Text>
        <Text style={styles.stageSub}>{progress.subLabel}</Text>

        {/* Progress Bar */}
        <View style={styles.barTrack}>
          <Animated.View
            style={[
              styles.barFill,
              {
                width: barAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          >
            <LinearGradient
              colors={progress.stage === 'done' ? [colors.success, '#0EC974'] : [colors.primary, colors.accent]}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </Animated.View>
        </View>

        <Text style={styles.percentText}>{Math.round(progress.percent)}%</Text>

        {/* Step Indicators */}
        <View style={styles.stepsRow}>
          {STAGES_ORDER.map((stage, i) => {
            const isDone = i < currentStageIndex;
            const isActive = i === currentStageIndex;
            return (
              <View key={stage} style={styles.stepWrap}>
                <View style={[
                  styles.stepDot,
                  isDone && styles.stepDone,
                  isActive && styles.stepActive,
                ]}>
                  {isDone ? (
                    <Ionicons name="checkmark" size={10} color="#fff" />
                  ) : (
                    <View style={[styles.stepInner, isActive && styles.stepInnerActive]} />
                  )}
                </View>
                <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>
                  {STAGE_LABELS[stage]}
                </Text>
                {i < STAGES_ORDER.length - 1 && (
                  <View style={[styles.connector, isDone && styles.connectorDone]} />
                )}
              </View>
            );
          })}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(15,23,41,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    borderRadius: borderRadius.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    marginHorizontal: spacing.xxl,
    alignItems: 'center',
    gap: spacing.lg,
    ...shadows.lg,
    width: 300,
  },
  iconRing: {
    borderRadius: borderRadius.full,
    padding: 4,
    backgroundColor: colors.surface,
    ...shadows.brand,
  },
  iconGrad: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  stageSub: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  barTrack: {
    width: '100%',
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  percentText: {
    ...typography.label,
    color: colors.primary,
    marginTop: -spacing.xs,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
    width: '100%',
  },
  stepWrap: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.full,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: spacing.xs,
  },
  stepDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  stepActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...shadows.brand,
  },
  stepInner: {
    width: 6,
    height: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.border,
  },
  stepInnerActive: {
    backgroundColor: '#fff',
  },
  stepLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  stepLabelActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  connector: {
    position: 'absolute',
    top: 10,
    right: -spacing.md,
    width: spacing.xl,
    height: 2,
    backgroundColor: colors.borderLight,
    borderRadius: 1,
  },
  connectorDone: {
    backgroundColor: colors.success,
  },
});
