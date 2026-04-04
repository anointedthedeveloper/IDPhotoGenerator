import { Pressable, StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BackgroundColor } from '@/services/imageService';
import { colors, borderRadius, typography, spacing } from '@/constants/theme';

const COLOR_MAP: Record<BackgroundColor, string> = {
  white: '#FFFFFF',
  gray: '#C8CDD6',
  blue: '#93BBFC',
};

const LABEL_MAP: Record<BackgroundColor, string> = {
  white: 'White',
  gray: 'Gray',
  blue: 'Blue',
};

interface ColorOptionProps {
  color: BackgroundColor;
  selected: boolean;
  onPress: () => void;
}

export function ColorOption({ color, selected, onPress }: ColorOptionProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.wrapper, selected && styles.wrapperSelected, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={[styles.swatch, { backgroundColor: COLOR_MAP[color] }]}>
        {selected && (
          <Ionicons name="checkmark" size={14} color={color === 'white' ? colors.primary : '#fff'} />
        )}
      </View>
      <Text style={[styles.colorLabel, selected && styles.colorLabelSelected]}>
        {LABEL_MAP[color]}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  wrapperSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  colorLabelSelected: {
    color: colors.primaryDark,
  },
});
