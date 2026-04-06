import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OptionButton } from '@/components/ui/OptionButton';
import { ColorOption } from '@/components/ui/ColorOption';
import { PhotoType, BackgroundColor, AspectRatio, ClothingStyle } from '@/services/imageService';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';

interface OptionsPanelProps {
  photoType: PhotoType;
  backgroundColor: BackgroundColor;
  aspectRatio: AspectRatio;
  clothingStyle: ClothingStyle;
  onPhotoTypeChange: (type: PhotoType) => void;
  onBackgroundColorChange: (color: BackgroundColor) => void;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  onClothingStyleChange: (style: ClothingStyle) => void;
}

const ALL_COLORS: BackgroundColor[] = ['white', 'gray', 'blue', 'red', 'green', 'lightblue'];

interface SectionHeaderProps {
  step: number;
  label: string;
  icon: any;
  extra?: React.ReactNode;
}

function SectionHeader({ step, label, icon, extra }: SectionHeaderProps) {
  return (
    <View style={styles.labelContainer}>
      <View style={styles.stepBadge}>
        <Text style={styles.stepNumber}>{step}</Text>
      </View>
      <Ionicons name={icon} size={16} color={colors.primary} />
      <Text style={styles.label}>{label}</Text>
      {extra}
    </View>
  );
}

export function OptionsPanel({
  photoType,
  backgroundColor,
  aspectRatio,
  clothingStyle,
  onPhotoTypeChange,
  onBackgroundColorChange,
  onAspectRatioChange,
  onClothingStyleChange,
}: OptionsPanelProps) {
  return (
    <View style={styles.container}>
      {/* Photo Type */}
      <View style={styles.card}>
        <View style={styles.section}>
          <SectionHeader step={1} label="Photo Type" icon="body-outline" />
          <View style={styles.row}>
            <OptionButton
              label="Full Body"
              selected={photoType === 'full'}
              onPress={() => onPhotoTypeChange('full')}
              icon="person-outline"
            />
            <View style={styles.gap} />
            <OptionButton
              label="Half Body"
              selected={photoType === 'half'}
              onPress={() => onPhotoTypeChange('half')}
              icon="person-circle-outline"
            />
          </View>
        </View>
      </View>

      {/* Clothing Style */}
      <View style={styles.card}>
        <View style={styles.section}>
          <SectionHeader step={2} label="Outfit Style" icon="shirt-outline" />
          <View style={styles.row}>
            <OptionButton
              label="Formal Suit"
              selected={clothingStyle === 'suit'}
              onPress={() => onClothingStyleChange('suit')}
              icon="briefcase-outline"
            />
            <View style={styles.gap} />
            <OptionButton
              label="Keep Outfit"
              selected={clothingStyle === 'keep'}
              onPress={() => onClothingStyleChange('keep')}
              icon="happy-outline"
            />
          </View>
          <View style={styles.hintBox}>
            <Ionicons
              name={clothingStyle === 'suit' ? 'briefcase-outline' : 'happy-outline'}
              size={13}
              color={colors.primary}
            />
            <Text style={styles.hintText}>
              {clothingStyle === 'suit'
                ? 'AI will dress the person in a professional business suit'
                : 'AI will keep the original outfit from your photo'}
            </Text>
          </View>
        </View>
      </View>

      {/* Background Color */}
      <View style={styles.card}>
        <View style={styles.section}>
          <SectionHeader
            step={3}
            label="Background Color"
            icon="color-palette-outline"
            extra={
              <View style={[styles.selectedColorDot, { backgroundColor: getColorHex(backgroundColor) }]} />
            }
          />
          <View style={styles.colorOuter}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.colorScroll}
            >
              {ALL_COLORS.map(c => (
                <View key={c} style={styles.colorItem}>
                  <ColorOption
                    color={c}
                    selected={backgroundColor === c}
                    onPress={() => onBackgroundColorChange(c)}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>

      {/* Aspect Ratio */}
      <View style={styles.card}>
        <View style={styles.section}>
          <SectionHeader step={4} label="Aspect Ratio" icon="crop-outline" />
          <View style={styles.row}>
            <OptionButton
              label="4:3  Landscape"
              selected={aspectRatio === '4:3'}
              onPress={() => onAspectRatioChange('4:3')}
              icon="tablet-landscape-outline"
            />
            <View style={styles.gap} />
            <OptionButton
              label="3:4  Portrait"
              selected={aspectRatio === '3:4'}
              onPress={() => onAspectRatioChange('3:4')}
              icon="phone-portrait-outline"
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const getColorHex = (color: BackgroundColor): string => {
  const map: Record<BackgroundColor, string> = {
    white: '#FFFFFF',
    gray: '#9CA3AF',
    blue: '#3B82F6',
    red: '#EF4444',
    green: '#10B981',
    lightblue: '#38BDF8',
  };
  return map[color] || '#FFFFFF';
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  section: {
    gap: spacing.lg,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  label: {
    ...typography.bodyMedium,
    color: colors.text,
    flex: 1,
  },
  selectedColorDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gap: {
    width: spacing.md,
  },
  colorOuter: {
    minHeight: 100,
  },
  colorScroll: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: 2,
    paddingVertical: 4,
  },
  colorItem: {
    width: 80,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  hintText: {
    ...typography.caption,
    color: colors.primary,
    lineHeight: 18,
    flex: 1,
  },
});
