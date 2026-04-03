import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePhotoLibrary } from '@/hooks/usePhotoLibrary';
import { PhotoGrid } from '@/components/feature/PhotoGrid';
import { useAlert } from '@/template';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { useEffect } from 'react';
import { AppFooter } from '@/components/ui/AppFooter';

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();
  const { photos, loading, error, deletePhoto } = usePhotoLibrary();

  useEffect(() => {
    if (error) {
      showAlert('Error', error);
    }
  }, [error, showAlert]);

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
      <View style={styles.container}>
        <LinearGradient
          colors={['#F9FBFF', colors.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
          <View style={styles.headerRow}>
            <View style={styles.headerIcon}>
              <Ionicons name="images" size={20} color={colors.primaryDark} />
            </View>
            <Text style={styles.title}>My Library</Text>
          </View>
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
      <View style={styles.container}>
        <LinearGradient
          colors={['#F9FBFF', colors.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
          <View style={styles.headerRow}>
            <View style={styles.headerIcon}>
              <Ionicons name="images" size={20} color={colors.primaryDark} />
            </View>
            <Text style={styles.title}>My Library</Text>
          </View>
          <Text style={styles.subtitle}>Your generated photos collection</Text>
        </View>
        <View style={styles.centerContainer}>
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="images-outline" size={64} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No photos yet</Text>
            <Text style={styles.emptyText}>
              Create your first ID photo and it will appear here
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F9FBFF', colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerIcon}>
            <Ionicons name="images" size={20} color={colors.primaryDark} />
          </View>
          <Text style={styles.title}>My Library</Text>
        </View>
        <Text style={styles.subtitle}>
          {photos.length} photo{photos.length > 1 ? 's' : ''} saved
        </Text>
      </View>
      <PhotoGrid photos={photos} onDeletePhoto={handleDeletePhoto} />
      <AppFooter />
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
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
  emptyCard: {
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    minWidth: '100%',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  emptyIconContainer: {
    padding: spacing.xl,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
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
