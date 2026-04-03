import { Text, TouchableOpacity, ActivityIndicator, StyleSheet, View } from 'react-native';
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

  return (
    <TouchableOpacity
      style={[styles.buttonShell, isDisabled && styles.buttonShellDisabled]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={isDisabled ? [colors.border, colors.border] : [colors.primaryDark, colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.button}
      >
        {loading ? (
          <View style={styles.content}>
            <ActivityIndicator color={colors.surface} size="small" />
            <Text style={styles.text}>Generating...</Text>
          </View>
        ) : (
          <View style={styles.content}>
            <Ionicons name="sparkles" size={20} color={colors.surface} />
            <Text style={styles.text}>Generate ID Photo</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonShell: {
    width: '100%',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  buttonShellDisabled: {
    ...shadows.sm,
  },
  button: {
    width: '100%',
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
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
    letterSpacing: 0.2,
  },
});
