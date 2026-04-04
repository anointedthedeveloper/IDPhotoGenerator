import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';

interface OptionButtonProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function OptionButton({ label, selected, onPress }: OptionButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, selected && styles.buttonSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {selected && <View style={styles.selectedIndicator} />}
      <Text style={[styles.text, selected && styles.textSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  buttonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
    ...shadows.sm,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.primary,
  },
  text: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  textSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
});
