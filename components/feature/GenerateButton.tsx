import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';

interface GenerateButtonProps {
  onPress: () => void;
  loading: boolean;
  disabled?: boolean;
}

const STEPS = ['Processing', 'Generating', 'Saving'];
const STEP_ICONS: Array<'scan-outline' | 'sparkles' | 'cloud-upload-outline'> = [
  'scan-outline',
  'sparkles',
  'cloud-upload-outline',
];

export function GenerateButton({ onPress, loading, disabled }: GenerateButtonProps) {
  const isDisabled = disabled || loading;
  const dotAnim = useRef(new Animated.Value(0)).current;
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (loading) {
      setCurrentStep(0);
      const interval = setInterval(() => {
        setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
      }, 2500);

      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(dotAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(dotAnim, { toValue: 0.4, duration: 600, useNativeDriver: true }),
        ])
      );
      pulse.start();

      return () => {
        clearInterval(interval);
        pulse.stop();
        dotAnim.setValue(0);
        setCurrentStep(0);
      };
    }
  }, [loading]);

  if (loading) {
    return (
      <View style={styles.loadingWrapper}>
        <View style={styles.progressCard}>
          {/* Steps row */}
          <View style={styles.stepsOuter}>
            {STEPS.map((step, i) => {
              const isActive = i === currentStep;
              const isDone = i < currentStep;
              return (
                <View key={step} style={styles.stepGroup}>
                  <View style={styles.stepItem}>
                    <View style={[styles.stepDot, isActive && styles.stepDotActive, isDone && styles.stepDotDone]}>
                      {isDone ? (
                        <Ionicons name="checkmark" size={12} color={colors.surface} />
                      ) : (
                        <Ionicons
                          name={STEP_ICONS[i]}
                          size={12}
                          color={isActive ? colors.surface : colors.textTertiary}
                        />
                      )}
                    </View>
                    <Text style={[styles.stepLabel, isActive && styles.stepLabelActive, isDone && styles.stepLabelDone]}>
                      {step}
                    </Text>
                  </View>
                  {i < STEPS.length - 1 && (
                    <View style={[styles.connector, isDone && styles.connectorDone]} />
                  )}
                </View>
              );
            })}
          </View>

          {/* Progress bar */}
          <View style={styles.progressBarBg}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: `${((currentStep + 1) / STEPS.length) * 100}%`,
                  opacity: dotAnim,
                },
              ]}
            />
          </View>

          <Text style={styles.progressLabel}>{STEPS[currentStep]}...</Text>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.button, isDisabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
    >
      <View style={styles.content}>
        <Ionicons name="sparkles" size={20} color={isDisabled ? colors.textTertiary : colors.surface} />
        <Text style={[styles.text, isDisabled && styles.textDisabled]}>Generate ID Photo</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    paddingVertical: spacing.xl,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  buttonDisabled: {
    backgroundColor: colors.borderLight,
    ...shadows.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  text: {
    ...typography.button,
    color: colors.surface,
    fontSize: 17,
  },
  textDisabled: {
    color: colors.textTertiary,
  },
  loadingWrapper: {
    width: '100%',
  },
  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    gap: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    ...shadows.md,
    alignItems: 'center',
  },
  stepsOuter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  stepGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  stepItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  stepDotActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepDotDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.xl,
  },
  connectorDone: {
    backgroundColor: colors.success,
  },
  stepLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    fontWeight: '500',
    fontSize: 11,
  },
  stepLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  stepLabelDone: {
    color: colors.success,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.borderLight,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  progressLabel: {
    ...typography.bodyMedium,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
});
