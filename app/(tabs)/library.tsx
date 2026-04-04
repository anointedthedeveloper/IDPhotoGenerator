import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePhotoLibrary } from '@/hooks/usePhotoLibrary';
import { PhotoGrid } from '@/components/feature/PhotoGrid';
import { useAlert } from '@/template';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { useEffect } from 'react';

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();
  const { photos, loading, error, deletePhoto, refreshPhotos } = usePhotoLibrary();

  useEffect(() => {
    if (error) {
      showAlert('Error', error);
    }
  }, [error]);

  const handleDeletePhoto = async (id: string) => {
    const { error: deleteError } = await deletePhoto(id);
    if (deleteError) {
      showAlert('Error', deleteError);
    } else {
      showAlert('Success', 'Photo deleted successfully');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.title}>📚 My Library</Text>
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your photos...</Text>
        </View>
      </View>
    );
  }

  if (photos.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.title}>📚 My Library</Text>
          <Text style={styles.subtitle}>Your generated photos collection</Text>
        </View>
        <View style={styles.centerContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="images-outline" size={64} color={colors.textTertiary} />
          </View>
          <Text style={styles.emptyTitle}>No photos yet</Text>
          <Text style={styles.emptyText}>
            Create your first ID photo and it will appear here
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>📚 My Library</Text>
        <Text style={styles.subtitle}>{photos.length} photo{photos.length > 1 ? 's' : ''} saved</Text>
      </View>
      <PhotoGrid photos={photos} onDeletePhoto={handleDeletePhoto} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
    gap: spacing.lg,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  emptyIconContainer: {
    padding: spacing.xl,
    borderRadius: borderRadius.full,
    backgroundColor: colors.borderLight,
  },
  emptyTitle: {
    ...typography.heading,
    color: colors.text,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
