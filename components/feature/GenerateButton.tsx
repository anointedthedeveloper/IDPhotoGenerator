import { Text, TouchableOpacity, ActivityIndicator, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';

interface GenerateButtonProps {
  onPress: () => void;
  loading: boolean;
  disabled?: boolean;
  remainingFree?: number;
  cooldownSeconds?: number;
  isPro?: boolean;
  canGenerate?: boolean;
}

export function GenerateButton({ onPress, loading, disabled, remainingFree = 0, cooldownSeconds = 0, isPro = false, canGenerate = true }: GenerateButtonProps) {
  const isDisabled = disabled || loading || !canGenerate;
  const inCooldown = cooldownSeconds > 0;
  const hitLimit = !isPro && remainingFree === 0 && !inCooldown;

  const getLabel = () => {
    if (loading) return 'Generating...';
    if (inCooldown) return `Wait ${cooldownSeconds}s`;
    if (hitLimit) return 'Upgrade to Pro';
    return 'Generate ID Photo';
  };

  const getIcon = () => {
    if (loading) return null;
    if (inCooldown) return 'time-outline';
    if (hitLimit) return 'lock-closed-outline';
    return 'sparkles';
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={[styles.button, isDisabled && styles.buttonDisabled, hitLimit && styles.buttonLocked, inCooldown && styles.buttonCooldown]}
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.9}
      >
        {loading ? (
          <View style={styles.content}>
            <ActivityIndicator color={colors.surface} size="small" />
            <Text style={styles.text}>Generating...</Text>
          </View>
        ) : (
          <View style={styles.content}>
            <Ionicons name={getIcon() as any} size={20} color={colors.surface} />
            <Text style={styles.text}>{getLabel()}</Text>
          </View>
        )}
      </TouchableOpacity>

      {!isPro && !loading && (
        <View style={styles.quota}>
          {inCooldown ? (
            <View style={styles.quotaRow}>
              <Ionicons name="time-outline" size={13} color={colors.textTertiary} />
              <Text style={styles.quotaText}>Cooldown: {cooldownSeconds}s</Text>
            </View>
          ) : hitLimit ? (
            <View style={styles.quotaRow}>
              <Ionicons name="lock-closed-outline" size={13} color={colors.error} />
              <Text style={[styles.quotaText, { color: colors.error }]}>Daily limit reached — resets tomorrow</Text>
            </View>
          ) : (
            <View style={styles.quotaRow}>
              <Ionicons name="images-outline" size={13} color={colors.textTertiary} />
              <Text style={styles.quotaText}>{remainingFree} free photo{remainingFree !== 1 ? 's' : ''} remaining today</Text>
            </View>
          )}
        </View>
      )}

      {isPro && !loading && (
        <View style={styles.quota}>
          <View style={styles.quotaRow}>
            <Ionicons name="sparkles" size={13} color={colors.primary} />
            <Text style={[styles.quotaText, { color: colors.primary }]}>Pro — unlimited generations</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  button: {
    width: '100%', paddingVertical: spacing.xl,
    borderRadius: borderRadius.lg, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', ...shadows.md,
  },
  buttonDisabled: { backgroundColor: colors.border, ...shadows.sm },
  buttonLocked: { backgroundColor: colors.accent },
  buttonCooldown: { backgroundColor: colors.textTertiary },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  text: { ...typography.button, color: colors.surface, fontSize: 17 },
  quota: { alignItems: 'center' },
  quotaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  quotaText: { ...typography.caption, color: colors.textTertiary },
});
