import { Text, Pressable, StyleSheet, View } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

interface OptionButtonProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: string;
}

export function OptionButton({ label, selected, onPress }: OptionButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      {selected && <View style={styles.activeDot} />}
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    paddingVertical: spacing.md + 2,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
  label: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    fontSize: 14,
  },
  selectedLabel: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
});
