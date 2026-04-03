import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePhotoLibrary } from '@/hooks/usePhotoLibrary';
import { PhotoGrid } from '@/components/feature/PhotoGrid';
import { LibraryEmptyState } from '@/components/ui/LibraryEmptyState';
import { useAlert } from '@/template';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { useEffect } from 'react';

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();
  const { photos, loading, error, deletePhoto } = usePhotoLibrary();

  useEffect(() => {
    if (error) showAlert('Error', error);
  }, [error]);

  const handleDeletePhoto = async (id: string) => {
    const { error: deleteError } = await deletePhoto(id);
    if (deleteError) showAlert('Error', deleteError);
    else showAlert('Success', 'Photo deleted successfully');
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#F9FBFF', colors.background]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFillObject} />
      <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerIcon}>
            <Ionicons name="images" size={20} color={colors.primaryDark} />
          </View>
          <Text style={styles.title}>My Library</Text>
        </View>
        {photos.length > 0 && (
          <Text style={styles.subtitle}>{photos.length} photo{photos.length > 1 ? 's' : ''} saved</Text>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your photos...</Text>
        </View>
      ) : photos.length === 0 ? (
        <LibraryEmptyState />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <PhotoGrid photos={photos} onDeletePhoto={handleDeletePhoto} />
          <View style={styles.watermarkNote}>
            <Ionicons name="information-circle-outline" size={14} color={colors.textTertiary} />
            <Text style={styles.watermarkNoteText}>First 3 photos are watermark-free. Upgrade to Pro to remove watermarks.</Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.xl, paddingVertical: spacing.xl, gap: spacing.sm },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerIcon: { width: 36, height: 36, borderRadius: borderRadius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryLight },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  loadingText: { ...typography.body, color: colors.textSecondary },
  scrollContent: { paddingBottom: spacing.xxxl },
  watermarkNote: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs, paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  watermarkNoteText: { ...typography.caption, color: colors.textTertiary, flex: 1, lineHeight: 18 },
});
