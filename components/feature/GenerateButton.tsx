import { Text, Pressable, ActivityIndicator, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';

interface GenerateButtonProps {
  onPress: () => void;
  loading: boolean;
  disabled?: boolean;
}

export function GenerateButton({ onPress, loading, disabled }: GenerateButtonProps) {
  const isDisabled = disabled || loading;

  if (isDisabled && !loading) {
    return (
      <View style={styles.disabledBtn}>
        <Ionicons name="sparkles-outline" size={20} color={colors.textTertiary} />
        <Text style={styles.disabledText}>Upload a photo to continue</Text>
      </View>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.wrapper, pressed && !isDisabled && styles.pressed]}
      onPress={onPress}
      disabled={isDisabled}
    >
      <LinearGradient
        colors={isDisabled ? [colors.border, colors.border] : [colors.primaryGradientStart, colors.primaryGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {loading ? (
          <View style={styles.content}>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={styles.text}>Generating your ID photo...</Text>
          </View>
        ) : (
          <View style={styles.content}>
            <Ionicons name="sparkles" size={20} color="#fff" />
            <Text style={styles.text}>Generate ID Photo</Text>
            <View style={styles.arrowWrap}>
              <Ionicons name="arrow-forward" size={16} color="rgba(255,255,255,0.7)" />
            </View>
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.brand,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  gradient: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  text: {
    ...typography.button,
    color: '#fff',
    fontSize: 17,
    flex: 1,
    textAlign: 'center',
  },
  arrowWrap: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.surface,
    minHeight: 60,
  },
  disabledText: {
    ...typography.bodyMedium,
    color: colors.textTertiary,
  },
});
