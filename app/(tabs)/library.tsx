import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePhotoLibrary } from '@/hooks/usePhotoLibrary';
import { useAlert } from '@/template';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { useEffect, useMemo, useState } from 'react';
import { LibraryPhotoGrid } from '@/components/feature/LibraryPhotoGrid';

type FilterBg = 'all' | 'white' | 'gray' | 'blue' | 'red' | 'green' | 'lightblue';
type FilterType = 'all' | 'full' | 'half';

const BG_FILTERS: { label: string; value: FilterBg; color: string }[] = [
  { label: 'All Colors', value: 'all', color: colors.primary },
  { label: 'White', value: 'white', color: '#AAAAAA' },
  { label: 'Gray', value: 'gray', color: '#9CA3AF' },
  { label: 'Blue', value: 'blue', color: '#3B82F6' },
  { label: 'Red', value: 'red', color: '#EF4444' },
  { label: 'Green', value: 'green', color: '#10B981' },
  { label: 'Light Blue', value: 'lightblue', color: '#38BDF8' },
];

const TYPE_FILTERS: { label: string; value: FilterType; icon: any }[] = [
  { label: 'All', value: 'all', icon: 'grid-outline' },
  { label: 'Half Body', value: 'half', icon: 'person-outline' },
  { label: 'Full Body', value: 'full', icon: 'body-outline' },
];

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();
  const { photos, loading, error, deletePhoto, refreshPhotos } = usePhotoLibrary();

  const [bgFilter, setBgFilter] = useState<FilterBg>('all');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');

  useEffect(() => {
    if (error) showAlert('Error', error);
  }, [error]);

  const filteredPhotos = useMemo(() => {
    return photos.filter(p => {
      const bgMatch = bgFilter === 'all' || p.background_color === bgFilter;
      const typeMatch = typeFilter === 'all' || p.photo_type === typeFilter;
      return bgMatch && typeMatch;
    });
  }, [photos, bgFilter, typeFilter]);

  const handleDeletePhoto = async (id: string) => {
    const { error: deleteError } = await deletePhoto(id);
    if (deleteError) {
      showAlert('Error', deleteError);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerIconBox}>
            <Ionicons name="images-outline" size={20} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.title}>My Library</Text>
            <Text style={styles.subtitle}>
              {loading ? 'Loading...' : `${filteredPhotos.length} of ${photos.length} photo${photos.length !== 1 ? 's' : ''}`}
            </Text>
          </View>
        </View>
      </View>

      {/* Filter bar */}
      {!loading && photos.length > 0 && (
        <View style={styles.filtersSection}>
          {/* Type filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {TYPE_FILTERS.map(f => {
              const isActive = typeFilter === f.value;
              return (
                <TouchableOpacity
                  key={f.value}
                  style={[styles.typeChip, isActive && styles.typeChipActive]}
                  onPress={() => setTypeFilter(f.value)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={f.icon}
                    size={14}
                    color={isActive ? colors.surface : colors.textSecondary}
                  />
                  <Text style={[styles.typeChipText, isActive && styles.typeChipTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Background color filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {BG_FILTERS.map(f => {
              const isActive = bgFilter === f.value;
              return (
                <TouchableOpacity
                  key={f.value}
                  style={[
                    styles.colorChip,
                    isActive && { borderColor: f.color, borderWidth: 2, backgroundColor: f.color + '18' },
                  ]}
                  onPress={() => setBgFilter(f.value)}
                  activeOpacity={0.8}
                >
                  {f.value !== 'all' && (
                    <View style={[styles.colorDot, { backgroundColor: f.color }]} />
                  )}
                  {f.value === 'all' && (
                    <Ionicons
                      name="color-palette-outline"
                      size={13}
                      color={isActive ? f.color : colors.textSecondary}
                    />
                  )}
                  <Text style={[styles.colorChipText, isActive && { color: f.color, fontWeight: '700' }]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Loading */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your photos...</Text>
        </View>
      ) : (
        <LibraryPhotoGrid photos={filteredPhotos} onDeletePhoto={handleDeletePhoto} />
      )}
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerIconBox: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.title,
    fontSize: 22,
    color: colors.text,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  filtersSection: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  typeChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  typeChipTextActive: {
    color: colors.surface,
  },
  colorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  colorChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
