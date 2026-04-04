import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePhotoLibrary } from '@/hooks/usePhotoLibrary';
import { PhotoGrid } from '@/components/feature/PhotoGrid';
import { LibraryEmptyState } from '@/components/ui/LibraryEmptyState';
import { useAlert } from '@/template';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { useEffect } from 'react';

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();
  const { photos, loading, error, deletePhoto } = usePhotoLibrary();

  useEffect(() => {
    if (error) showAlert('Error', error);
  }, [error]);

  const handleDeletePhoto = async (id: string) => {
    showAlert('Delete Photo', 'Are you sure you want to delete this photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error: deleteError } = await deletePhoto(id);
          if (deleteError) showAlert('Error', deleteError);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background, '#E4ECFF']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <View style={styles.headerRow}>
          <LinearGradient
            colors={[colors.primary, colors.accent]}
            style={styles.headerIconGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="images" size={18} color="#fff" />
          </LinearGradient>
          <View style={styles.headerText}>
            <Text style={styles.kicker}>My Collection</Text>
            <Text style={styles.title}>Photo Library</Text>
          </View>
          {photos.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{photos.length}</Text>
            </View>
          )}
        </View>
        {photos.length > 0 && (
          <Text style={styles.subtitle}>
            {photos.length} photo{photos.length > 1 ? 's' : ''} · Tap to view or delete
          </Text>
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
            <View style={styles.noteIconWrap}>
              <Ionicons name="information-circle" size={16} color={colors.primary} />
            </View>
            <Text style={styles.watermarkNoteText}>
              First 3 photos are watermark-free. Upgrade to Pro to remove watermarks from all photos.
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerIconGrad: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1, gap: 2 },
  kicker: { ...typography.label, color: colors.primary },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, letterSpacing: -0.4 },
  countBadge: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.brand,
  },
  countText: { fontSize: 14, fontWeight: '800', color: '#fff' },
  subtitle: { ...typography.body, color: colors.textSecondary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  loadingText: { ...typography.body, color: colors.textSecondary },
  scrollContent: { paddingBottom: spacing.xxxl },
  watermarkNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primaryMid,
  },
  noteIconWrap: { marginTop: 1 },
  watermarkNoteText: {
    ...typography.caption,
    color: colors.primaryDark,
    flex: 1,
    lineHeight: 18,
  },
});
