import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';

interface UploadSectionProps {
  imageUri: string | null;
  onPress: () => void;
}

export function UploadSection({ imageUri, onPress }: UploadSectionProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          contentFit="contain"
        />
      ) : (
        <View style={styles.placeholder}>
          <View style={{
            backgroundColor: colors.primaryLight,
            padding: spacing.lg,
            borderRadius: borderRadius.full,
          }}>
            <Ionicons name="cloud-upload-outline" size={48} color={colors.primary} />
          </View>
          <View style={{ gap: spacing.xs }}>
            <Text style={styles.placeholderText}>Click to upload your photo</Text>
            <Text style={styles.placeholderSubtext}>Support JPG, PNG formats</Text>
          </View>
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
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    ...shadows.sm,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  placeholderText: {
    ...typography.bodyMedium,
    color: colors.text,
    textAlign: 'center',
  },
  placeholderSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
