import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import { BackgroundColor } from '@/services/imageService';

interface ColorOptionProps {
  color: BackgroundColor;
  selected: boolean;
  onPress: () => void;
}

const colorMap: Record<BackgroundColor, string> = {
  white: colors.bgWhite,
  gray: colors.bgGray,
  blue: colors.bgBlue,
  red: colors.bgRed,
  green: colors.bgGreen,
  lightblue: colors.bgLightBlue,
};

const colorLabels: Record<BackgroundColor, string> = {
  white: 'White',
  gray: 'Gray',
  blue: 'Blue',
  red: 'Red',
  green: 'Green',
  lightblue: 'Lt. Blue',
};

export function ColorOption({ color, selected, onPress }: ColorOptionProps) {
  return (
    <TouchableOpacity
      style={[styles.container, selected && styles.containerSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.colorCircle, { backgroundColor: colorMap[color] }]}>
        {selected && (
          <View style={styles.checkmark}>
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
          </View>
        )}
      </View>
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {colorLabels[color]}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  containerSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
    ...shadows.sm,
  },
  colorCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  checkmark: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  labelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
});
