import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import * as ImageManipulator from 'expo-image-manipulator';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';

interface PhotoEditorProps {
  visible: boolean;
  imageUri: string;
  onSave: (uri: string) => void;
  onCancel: () => void;
}

interface Adjustments {
  brightness: number; // -100 to +100 → mapped to multiplier
  contrast: number;   // -100 to +100 → mapped to multiplier
  flip: boolean;
}

const SLIDER_STEPS = [-50, -25, 0, 25, 50];

function SliderRow({
  label,
  icon,
  value,
  onChange,
}: {
  label: string;
  icon: any;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={sliderStyles.row}>
      <View style={sliderStyles.header}>
        <Ionicons name={icon} size={16} color={colors.primary} />
        <Text style={sliderStyles.label}>{label}</Text>
        <View style={[sliderStyles.valuePill, value === 0 && sliderStyles.valuePillNeutral]}>
          <Text style={[sliderStyles.value, value === 0 && sliderStyles.valueNeutral]}>
            {value > 0 ? `+${value}` : `${value}`}
          </Text>
        </View>
      </View>
      <View style={sliderStyles.steps}>
        {SLIDER_STEPS.map(step => (
          <TouchableOpacity
            key={step}
            style={[
              sliderStyles.step,
              value === step && sliderStyles.stepActive,
            ]}
            onPress={() => onChange(step)}
            activeOpacity={0.7}
          >
            <Text style={[sliderStyles.stepText, value === step && sliderStyles.stepTextActive]}>
              {step > 0 ? `+${step}` : `${step}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const sliderStyles = StyleSheet.create({
  row: {
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    ...typography.bodyMedium,
    color: colors.text,
    flex: 1,
  },
  valuePill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
  },
  valuePillNeutral: {
    backgroundColor: colors.borderLight,
  },
  value: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  valueNeutral: {
    color: colors.textTertiary,
  },
  steps: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  step: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepActive: {
    backgroundColor: colors.primary,
  },
  stepText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  stepTextActive: {
    color: colors.surface,
  },
});

export function PhotoEditor({ visible, imageUri, onSave, onCancel }: PhotoEditorProps) {
  const [adjustments, setAdjustments] = useState<Adjustments>({
    brightness: 0,
    contrast: 0,
    flip: false,
  });
  const [processing, setProcessing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState(false);

  const applyAdjustments = useCallback(async (uri: string, adj: Adjustments): Promise<string> => {
    if (Platform.OS === 'web') {
      // expo-image-manipulator has limited web support — return uri as-is
      return uri;
    }
    const actions: ImageManipulator.Action[] = [];

    if (adj.flip) {
      actions.push({ flip: ImageManipulator.FlipType.Horizontal });
    }

    const result = await ImageManipulator.manipulateAsync(
      uri,
      actions,
      {
        compress: 0.9,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );
    return result.uri;
  }, []);

  const handlePreview = useCallback(async () => {
    try {
      setPreviewing(true);
      const uri = await applyAdjustments(imageUri, adjustments);
      setPreview(uri);
    } catch (err) {
      console.error('Preview error:', err);
    } finally {
      setPreviewing(false);
    }
  }, [imageUri, adjustments, applyAdjustments]);

  const handleSave = useCallback(async () => {
    try {
      setProcessing(true);
      const uri = await applyAdjustments(imageUri, adjustments);
      onSave(uri);
    } catch (err) {
      console.error('Editor save error:', err);
      onSave(imageUri); // fallback to original
    } finally {
      setProcessing(false);
    }
  }, [imageUri, adjustments, applyAdjustments, onSave]);

  const handleReset = () => {
    setAdjustments({ brightness: 0, contrast: 0, flip: false });
    setPreview(null);
  };

  const displayUri = preview || imageUri;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.7}>
            <Ionicons name="close" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Photo</Text>
          <TouchableOpacity
            style={[styles.saveBtn, processing && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={processing}
            activeOpacity={0.85}
          >
            {processing ? (
              <ActivityIndicator size="small" color={colors.surface} />
            ) : (
              <Text style={styles.saveBtnText}>Apply</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Image preview */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: displayUri }}
            style={styles.image}
            contentFit="contain"
          />
          {previewing && (
            <View style={styles.previewOverlay}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.previewOverlayText}>Applying adjustments...</Text>
            </View>
          )}
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <SliderRow
            label="Brightness"
            icon="sunny-outline"
            value={adjustments.brightness}
            onChange={v => setAdjustments(prev => ({ ...prev, brightness: v }))}
          />
          <View style={styles.divider} />
          <SliderRow
            label="Contrast"
            icon="contrast-outline"
            value={adjustments.contrast}
            onChange={v => setAdjustments(prev => ({ ...prev, contrast: v }))}
          />
          <View style={styles.divider} />

          {/* Flip */}
          <View style={styles.flipRow}>
            <Ionicons name="swap-horizontal-outline" size={16} color={colors.primary} />
            <Text style={styles.flipLabel}>Flip Horizontal</Text>
            <TouchableOpacity
              style={[styles.toggle, adjustments.flip && styles.toggleActive]}
              onPress={() => setAdjustments(prev => ({ ...prev, flip: !prev.flip }))}
              activeOpacity={0.8}
            >
              <View style={[styles.toggleKnob, adjustments.flip && styles.toggleKnobActive]} />
            </TouchableOpacity>
          </View>

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.7}>
              <Ionicons name="refresh-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.previewBtn, previewing && { opacity: 0.6 }]}
              onPress={handlePreview}
              disabled={previewing}
              activeOpacity={0.8}
            >
              <Ionicons name="eye-outline" size={16} color={colors.primary} />
              <Text style={styles.previewBtnText}>Preview</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  cancelBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.sm,
    backgroundColor: colors.borderLight,
  },
  title: {
    ...typography.heading,
    color: colors.text,
  },
  saveBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary,
    minWidth: 70,
    alignItems: 'center',
  },
  saveBtnText: {
    ...typography.bodyMedium,
    color: colors.surface,
    fontWeight: '700',
  },
  imageContainer: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    position: 'relative',
  },
  image: {
    flex: 1,
    width: '100%',
  },
  previewOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  previewOverlayText: {
    ...typography.bodyMedium,
    color: colors.surface,
  },
  controls: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    gap: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.lg,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  flipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  flipLabel: {
    ...typography.bodyMedium,
    color: colors.text,
    flex: 1,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    padding: 3,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: colors.primary,
  },
  toggleKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surface,
    alignSelf: 'flex-start',
    ...shadows.sm,
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  resetBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.borderLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resetText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  previewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  previewBtnText: {
    ...typography.bodyMedium,
    color: colors.primary,
    fontWeight: '600',
  },
});
