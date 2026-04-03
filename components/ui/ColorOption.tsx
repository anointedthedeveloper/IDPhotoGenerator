import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BackgroundColor } from '@/services/imageService';
import { colors, borderRadius } from '@/constants/theme';

const COLOR_MAP: Record<BackgroundColor, string> = {
  white: '#FFFFFF',
  gray: '#E5E7EB',
  blue: '#DBEAFE',
};

interface ColorOptionProps {
  color: BackgroundColor;
  selected: boolean;
  onPress: () => void;
}

export function ColorOption({ color, selected, onPress }: ColorOptionProps) {
  return (
    <TouchableOpacity
      style={[styles.outer, selected && styles.outerSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.swatch, { backgroundColor: COLOR_MAP[color] }]}>
        {selected && <Ionicons name="checkmark" size={16} color={colors.primary} />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  outer: {
    padding: 3,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  outerSelected: {
    borderColor: colors.primary,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
