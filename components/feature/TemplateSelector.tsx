import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ID_PHOTO_TEMPLATES, IDPhotoTemplate } from '@/constants/templates';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';

interface TemplateSelectorProps {
  selectedTemplateId: string | null;
  onSelectTemplate: (template: IDPhotoTemplate) => void;
}

function TemplateCard({
  template,
  selected,
  onPress,
}: {
  template: IDPhotoTemplate;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        selected && { borderColor: template.accentColor, borderWidth: 2 },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Icon */}
      <View style={[styles.iconBox, { backgroundColor: template.accentBg }]}>
        <Ionicons name={template.iconName} size={22} color={template.accentColor} />
      </View>

      {/* Labels */}
      <Text style={styles.name} numberOfLines={1}>{template.name}</Text>
      <Text style={styles.size}>{template.size}</Text>

      {/* Selected check */}
      {selected && (
        <View style={[styles.checkBadge, { backgroundColor: template.accentColor }]}>
          <Ionicons name="checkmark" size={10} color={colors.surface} />
        </View>
      )}
    </TouchableOpacity>
  );
}

export function TemplateSelector({ selectedTemplateId, onSelectTemplate }: TemplateSelectorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <View style={styles.stepBadge}>
          <Text style={styles.stepNumber}>0</Text>
        </View>
        <Text style={styles.label}>Photo Template</Text>
        {selectedTemplateId && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedBadgeText}>
              {ID_PHOTO_TEMPLATES.find(t => t.id === selectedTemplateId)?.name}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.outerContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {ID_PHOTO_TEMPLATES.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              selected={selectedTemplateId === template.id}
              onPress={() => onSelectTemplate(template)}
            />
          ))}
        </ScrollView>
      </View>

      {selectedTemplateId && (
        <View style={styles.hint}>
          <Ionicons name="information-circle-outline" size={14} color={colors.primary} />
          <Text style={styles.hintText}>
            Aspect ratio and background auto-set for{' '}
            {ID_PHOTO_TEMPLATES.find(t => t.id === selectedTemplateId)?.name}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    color: '#D97706',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  label: {
    ...typography.bodyMedium,
    color: colors.text,
    flex: 1,
  },
  selectedBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
  },
  selectedBadgeText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  outerContainer: {
    minHeight: 120,
  },
  scrollContent: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: 2,
    paddingVertical: 4,
  },
  card: {
    width: 92,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    position: 'relative',
    ...shadows.sm,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  size: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textTertiary,
    textAlign: 'center',
  },
  checkBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  hint: {
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
    flex: 1,
    lineHeight: 18,
  },
});
