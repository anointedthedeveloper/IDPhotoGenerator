import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" />
      ) : (
        <LinearGradient
          colors={['#FFFFFF', colors.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.placeholder}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="cloud-upload-outline" size={40} color={colors.primaryDark} />
          </View>
          <Text style={styles.title}>Upload your photo</Text>
          <Text style={styles.subtitle}>Tap to choose a portrait from your library</Text>
          <View style={styles.helperPill}>
            <Ionicons name="sparkles-outline" size={14} color={colors.primaryDark} />
            <Text style={styles.helperText}>Best with a front-facing portrait</Text>
          </View>
        </LinearGradient>
      )}
      {imageUri && (
        <View style={styles.changeOverlay}>
          <Ionicons name="camera-outline" size={18} color={colors.surface} />
          <Text style={styles.changeText}>Change Photo</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    ...shadows.sm,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.heading,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  helperPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  helperText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '600',
  },
  image: {
    flex: 1,
  },
  changeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.overlay,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  changeText: {
    ...typography.bodyMedium,
    color: colors.surface,
  },
});
