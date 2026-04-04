import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';

interface UploadSectionProps {
  imageUri: string | null;
  onPress: () => void;
}

export function UploadSection({ imageUri, onPress }: UploadSectionProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
    >
      {imageUri ? (
        <View style={styles.imageWrap}>
          <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" transition={200} />
          <LinearGradient
            colors={['transparent', 'rgba(15,23,41,0.7)']}
            style={styles.imageOverlay}
          >
            <View style={styles.changeChip}>
              <Ionicons name="camera" size={14} color="#fff" />
              <Text style={styles.changeText}>Change Photo</Text>
            </View>
          </LinearGradient>
        </View>
      ) : (
        <LinearGradient
          colors={[colors.surfaceElevated, colors.primaryLight]}
          style={styles.placeholder}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.dashedBorder}>
            <View style={styles.iconRing}>
              <LinearGradient
                colors={[colors.primary, colors.accent]}
                style={styles.iconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="cloud-upload-outline" size={32} color="#fff" />
              </LinearGradient>
            </View>
            <Text style={styles.uploadTitle}>Upload Your Photo</Text>
            <Text style={styles.uploadSubtitle}>Portrait, headshot, or full-body photo</Text>
            <View style={styles.formatRow}>
              {['JPG', 'PNG', 'HEIC'].map(fmt => (
                <View key={fmt} style={styles.formatTag}>
                  <Text style={styles.formatTagText}>{fmt}</Text>
                </View>
              ))}
            </View>
          </View>
        </LinearGradient>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  pressed: { opacity: 0.93, transform: [{ scale: 0.99 }] },
  imageWrap: { flex: 1 },
  image: { flex: 1 },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
  changeText: {
    ...typography.bodyMedium,
    color: '#fff',
    fontSize: 14,
  },
  placeholder: {
    flex: 1,
    padding: spacing.lg,
  },
  dashedBorder: {
    flex: 1,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.primaryMid,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  iconRing: {
    borderRadius: borderRadius.full,
    padding: 3,
    backgroundColor: colors.surface,
    ...shadows.brand,
  },
  iconGradient: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  uploadSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  formatRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  formatTag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formatTagText: {
    ...typography.label,
    color: colors.textSecondary,
    fontSize: 10,
  },
});
