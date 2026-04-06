import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { IDPhoto } from '@/contexts/PhotoLibraryContext';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import { useState } from 'react';

interface PhotoGridProps {
  photos: IDPhoto[];
  onDeletePhoto: (id: string) => void;
}

export function PhotoGrid({ photos, onDeletePhoto }: PhotoGridProps) {
  const handleDelete = (photo: IDPhoto) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDeletePhoto(photo.id),
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: IDPhoto }) => {
    const [imageLoading, setImageLoading] = useState(true);

    return (
      <View style={styles.photoCard}>
        {imageLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
        <Image
          source={{ uri: item.generated_image_url }}
          style={styles.photoImage}
          contentFit="cover"
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
        />
        <View style={styles.photoOverlay}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item)}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={20} color={colors.surface} />
          </TouchableOpacity>
        </View>
        <View style={styles.photoInfo}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.photo_type === 'full' ? 'Full' : 'Half'}</Text>
          </View>
          <View style={[styles.colorDot, { backgroundColor: getColorValue(item.background_color) }]} />
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={photos}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    />
  );
}

const getColorValue = (color: string): string => {
  const colorMap: Record<string, string> = {
    white: colors.bgWhite,
    gray: colors.bgGray,
    blue: colors.bgBlue,
    red: colors.bgRed,
    green: colors.bgGreen,
    lightblue: colors.bgLightBlue,
  };
  return colorMap[color] || colors.bgWhite;
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  row: {
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  photoCard: {
    flex: 1,
    aspectRatio: 3 / 4,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    ...shadows.md,
    position: 'relative',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    zIndex: 1,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  deleteButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  photoInfo: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.overlay,
  },
  badgeText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '600',
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.surface,
    ...shadows.sm,
  },
});
