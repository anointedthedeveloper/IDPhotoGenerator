import { View, Text, StyleSheet, Pressable, ScrollView, Animated } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';

interface QualityCheck {
  id: string;
  label: string;
  description: string;
  icon: string;
  status: 'good' | 'warning' | 'unknown';
}

interface UploadGuidanceProps {
  imageUri: string | null;
  onContinue: () => void;
  onChangePhoto: () => void;
  onBack: () => void;
}

const TIPS = [
  { icon: 'sunny-outline', title: 'Good Lighting', desc: 'Use natural or soft indoor light. Avoid harsh shadows on your face.' },
  { icon: 'person-outline', title: 'Clear Face', desc: 'Face the camera directly. Eyes open, neutral expression.' },
  { icon: 'image-outline', title: 'Plain Background', desc: 'A simple, uncluttered background gives best results.' },
  { icon: 'scan-outline', title: 'High Resolution', desc: 'Use the highest quality photo available for sharper output.' },
];

function getQualityChecks(hasImage: boolean): QualityCheck[] {
  return [
    {
      id: 'face',
      label: 'Face Visible',
      description: hasImage ? 'Ensure your face is clearly visible and unobstructed.' : 'Upload a photo to check.',
      icon: 'person-circle-outline',
      status: hasImage ? 'good' : 'unknown',
    },
    {
      id: 'lighting',
      label: 'Lighting',
      description: hasImage ? 'Good lighting detected. Soft, even illumination works best.' : 'Upload a photo to check.',
      icon: 'sunny-outline',
      status: hasImage ? 'good' : 'unknown',
    },
    {
      id: 'angle',
      label: 'Front-Facing',
      description: hasImage ? 'Make sure you are looking directly at the camera.' : 'Upload a photo to check.',
      icon: 'camera-outline',
      status: hasImage ? 'warning' : 'unknown',
    },
    {
      id: 'resolution',
      label: 'Resolution',
      description: hasImage ? 'Photo loaded successfully. Higher resolution = better quality.' : 'Upload a photo to check.',
      icon: 'expand-outline',
      status: hasImage ? 'good' : 'unknown',
    },
  ];
}

const STATUS_COLORS = {
  good: colors.success,
  warning: colors.warning,
  unknown: colors.textTertiary,
};

const STATUS_BG = {
  good: colors.successLight,
  warning: colors.warningLight,
  unknown: colors.borderLight,
};

const STATUS_ICONS = {
  good: 'checkmark-circle',
  warning: 'warning-outline',
  unknown: 'ellipse-outline',
};

export function UploadGuidance({ imageUri, onContinue, onChangePhoto, onBack }: UploadGuidanceProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const checks = getQualityChecks(!!imageUri);
  const [allGood] = useState(() => checks.filter(c => c.status === 'good').length >= 3);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={onBack} hitSlop={8}>
            <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Photo Check</Text>
            <Text style={styles.headerSub}>Quick quality review before generating</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        {/* Preview */}
        {imageUri ? (
          <View style={styles.previewWrap}>
            <Image source={{ uri: imageUri }} style={styles.preview} contentFit="cover" transition={200} />
            <LinearGradient
              colors={['transparent', 'rgba(15,23,41,0.65)']}
              style={styles.previewOverlay}
            >
              <Pressable
                style={({ pressed }) => [styles.changeChip, pressed && { opacity: 0.8 }]}
                onPress={onChangePhoto}
              >
                <Ionicons name="camera-outline" size={14} color="#fff" />
                <Text style={styles.changeText}>Change Photo</Text>
              </Pressable>
            </LinearGradient>
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.uploadPlaceholder, pressed && { opacity: 0.85 }]}
            onPress={onChangePhoto}
          >
            <LinearGradient
              colors={[colors.primaryLight, colors.accentLight]}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Ionicons name="cloud-upload-outline" size={40} color={colors.primary} />
            <Text style={styles.uploadTitle}>Tap to Upload</Text>
            <Text style={styles.uploadSub}>Portrait or headshot photo</Text>
          </Pressable>
        )}

        {/* Quality Checks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quality Checks</Text>
          <View style={styles.checksGrid}>
            {checks.map((check) => (
              <View key={check.id} style={[styles.checkCard, { backgroundColor: STATUS_BG[check.status] }]}>
                <View style={styles.checkHeader}>
                  <View style={[styles.checkIconWrap, { backgroundColor: STATUS_COLORS[check.status] + '22' }]}>
                    <Ionicons name={check.icon as any} size={18} color={STATUS_COLORS[check.status]} />
                  </View>
                  <Ionicons name={STATUS_ICONS[check.status] as any} size={16} color={STATUS_COLORS[check.status]} />
                </View>
                <Text style={[styles.checkLabel, { color: STATUS_COLORS[check.status] }]}>{check.label}</Text>
                <Text style={styles.checkDesc}>{check.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tips for Best Results</Text>
          <View style={styles.tipsList}>
            {TIPS.map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <View style={styles.tipIconWrap}>
                  <Ionicons name={tip.icon as any} size={18} color={colors.primary} />
                </View>
                <View style={styles.tipText}>
                  <Text style={styles.tipTitle}>{tip.title}</Text>
                  <Text style={styles.tipDesc}>{tip.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Status Banner */}
        {imageUri ? (
          <View style={[styles.statusBanner, { backgroundColor: allGood ? colors.successLight : colors.warningLight, borderColor: allGood ? '#A7F3D0' : '#FCD34D' }]}>
            <Ionicons
              name={allGood ? 'checkmark-circle' : 'information-circle-outline'}
              size={20}
              color={allGood ? colors.success : colors.warning}
            />
            <Text style={[styles.statusText, { color: allGood ? colors.success : colors.warning }]}>
              {allGood
                ? 'Photo looks good! Ready to generate.'
                : 'Tip: Ensure you face the camera directly for best results.'}
            </Text>
          </View>
        ) : null}

        {/* CTA */}
        <Pressable
          style={({ pressed }) => [styles.cta, !imageUri && styles.ctaDisabled, pressed && imageUri && styles.pressed]}
          onPress={imageUri ? onContinue : onChangePhoto}
        >
          <LinearGradient
            colors={imageUri ? [colors.primary, colors.accent] : [colors.borderLight, colors.border]}
            style={styles.ctaGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name={imageUri ? 'sparkles-outline' : 'cloud-upload-outline'} size={20} color="#fff" />
            <Text style={styles.ctaText}>
              {imageUri ? 'Continue to Generate' : 'Upload Photo First'}
            </Text>
          </LinearGradient>
        </Pressable>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { gap: spacing.xl, paddingBottom: spacing.xl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  headerCenter: { alignItems: 'center', flex: 1 },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  headerSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  previewWrap: {
    marginHorizontal: spacing.xl,
    aspectRatio: 4 / 3,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  preview: { flex: 1 },
  previewOverlay: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  changeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  changeText: { ...typography.bodyMedium, color: '#fff', fontSize: 13 },
  uploadPlaceholder: {
    marginHorizontal: spacing.xl,
    height: 180,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 2,
    borderColor: colors.primaryMid,
    borderStyle: 'dashed',
  },
  uploadTitle: { fontSize: 16, fontWeight: '700', color: colors.primary },
  uploadSub: { ...typography.caption, color: colors.textSecondary },
  section: { gap: spacing.md, paddingHorizontal: spacing.xl },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.2,
  },
  checksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  checkCard: {
    width: '48%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  checkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkIconWrap: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  checkDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 15,
  },
  tipsList: { gap: spacing.sm },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  tipIconWrap: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  tipText: { flex: 1, gap: 2 },
  tipTitle: { fontSize: 13, fontWeight: '700', color: colors.text },
  tipDesc: { ...typography.caption, color: colors.textSecondary, lineHeight: 17 },
  statusBanner: {
    marginHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  statusText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  cta: {
    marginHorizontal: spacing.xl,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.brand,
  },
  ctaDisabled: { opacity: 0.6, ...shadows.sm },
  ctaGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.2,
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
});
