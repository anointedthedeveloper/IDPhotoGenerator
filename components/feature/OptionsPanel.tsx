import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

type SectionProps = {
  step: number;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  children: React.ReactNode;
};

function Section({ step, icon, title, children }: SectionProps) {
  return (
    <View style={sectionStyles.card}>
      <View style={sectionStyles.header}>
        <View style={sectionStyles.stepBadge}>
          <Text style={sectionStyles.stepText}>{step}</Text>
        </View>
        <Ionicons name={icon} size={16} color={colors.textSecondary} style={sectionStyles.icon} />
        <Text style={sectionStyles.title}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 14,
  },
  icon: { marginLeft: 2 },
  title: {
    ...typography.bodyMedium,
    color: colors.text,
    fontWeight: '700',
    flex: 1,
  },
});

export function OptionsPanel({
  photoType, backgroundColor, aspectRatio,
  onPhotoTypeChange, onBackgroundColorChange, onAspectRatioChange,
}: OptionsPanelProps) {
  return (
    <View style={styles.container}>
      <Section step={1} icon="person-outline" title="Photo Type">
        <View style={styles.row}>
          <OptionButton label="Full-body" selected={photoType === 'full'} onPress={() => onPhotoTypeChange('full')} />
          <View style={styles.gap} />
          <OptionButton label="Half-body" selected={photoType === 'half'} onPress={() => onPhotoTypeChange('half')} />
        </View>
      </Section>

      <Section step={2} icon="color-palette-outline" title="Background Color">
        <View style={styles.row}>
          <ColorOption color="white" selected={backgroundColor === 'white'} onPress={() => onBackgroundColorChange('white')} />
          <View style={styles.gap} />
          <ColorOption color="gray" selected={backgroundColor === 'gray'} onPress={() => onBackgroundColorChange('gray')} />
          <View style={styles.gap} />
          <ColorOption color="blue" selected={backgroundColor === 'blue'} onPress={() => onBackgroundColorChange('blue')} />
        </View>
      </Section>

      <Section step={3} icon="crop-outline" title="Aspect Ratio">
        <View style={styles.row}>
          <OptionButton label="4:3  Landscape" selected={aspectRatio === '4:3'} onPress={() => onAspectRatioChange('4:3')} />
          <View style={styles.gap} />
          <OptionButton label="3:4  Portrait" selected={aspectRatio === '3:4'} onPress={() => onAspectRatioChange('3:4')} />
        </View>
      </Section>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'stretch' },
  gap: { width: spacing.sm },
});
