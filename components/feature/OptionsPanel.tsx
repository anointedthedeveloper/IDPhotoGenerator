import { View, Text, StyleSheet } from 'react-native';
import { OptionButton } from '@/components/ui/OptionButton';
import { ColorOption } from '@/components/ui/ColorOption';
import { PhotoType, BackgroundColor, AspectRatio } from '@/services/imageService';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';

interface OptionsPanelProps {
  photoType: PhotoType;
  backgroundColor: BackgroundColor;
  aspectRatio: AspectRatio;
  onPhotoTypeChange: (type: PhotoType) => void;
  onBackgroundColorChange: (color: BackgroundColor) => void;
  onAspectRatioChange: (ratio: AspectRatio) => void;
}

export function OptionsPanel({
  photoType,
  backgroundColor,
  aspectRatio,
  onPhotoTypeChange,
  onBackgroundColorChange,
  onAspectRatioChange,
}: OptionsPanelProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.section}>
          <View style={styles.labelContainer}>
            <Text style={styles.labelNumber}>1</Text>
            <Text style={styles.label}>Photo Type</Text>
          </View>
          <View style={styles.row}>
            <OptionButton
              label="Full-body"
              selected={photoType === 'full'}
              onPress={() => onPhotoTypeChange('full')}
            />
            <View style={styles.gap} />
            <OptionButton
              label="Half-body"
              selected={photoType === 'half'}
              onPress={() => onPhotoTypeChange('half')}
            />
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.section}>
          <View style={styles.labelContainer}>
            <Text style={styles.labelNumber}>2</Text>
            <Text style={styles.label}>Background Color</Text>
          </View>
          <View style={styles.row}>
            <ColorOption
              color="white"
              selected={backgroundColor === 'white'}
              onPress={() => onBackgroundColorChange('white')}
            />
            <View style={styles.gap} />
            <ColorOption
              color="gray"
              selected={backgroundColor === 'gray'}
              onPress={() => onBackgroundColorChange('gray')}
            />
            <View style={styles.gap} />
            <ColorOption
              color="blue"
              selected={backgroundColor === 'blue'}
              onPress={() => onBackgroundColorChange('blue')}
            />
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.section}>
          <View style={styles.labelContainer}>
            <Text style={styles.labelNumber}>3</Text>
            <Text style={styles.label}>Aspect Ratio</Text>
          </View>
          <View style={styles.row}>
            <OptionButton
              label="4:3"
              selected={aspectRatio === '4:3'}
              onPress={() => onAspectRatioChange('4:3')}
            />
            <View style={styles.gap} />
            <OptionButton
              label="3:4"
              selected={aspectRatio === '3:4'}
              onPress={() => onAspectRatioChange('3:4')}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

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
    gap: spacing.md,
  },
  labelNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    color: colors.primary,
    ...typography.bodyMedium,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 28,
  },
  label: {
    ...typography.bodyMedium,
    color: colors.text,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gap: {
    width: spacing.md,
  },
});
