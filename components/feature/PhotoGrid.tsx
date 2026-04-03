import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Photo } from '@/contexts/PhotoLibraryContext';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';

interface PhotoGridProps {
  photos: Photo[];
  onDeletePhoto: (id: string) => void;
}

const COLUMNS = 2;
const GAP = spacing.md;
const PADDING = spacing.xl;
const ITEM_WIDTH = (Dimensions.get('window').width - PADDING * 2 - GAP) / COLUMNS;

export function PhotoGrid({ photos, onDeletePhoto }: PhotoGridProps) {
  return (
    <View style={styles.grid}>
      {photos.map((photo) => (
        <View key={photo.id} style={styles.card}>
          <Image
            source={{ uri: photo.generated_image_url }}
            style={styles.image}
            contentFit="cover"
          />
          <View style={styles.info}>
            <Text style={styles.type} numberOfLines={1}>
              {photo.photo_type} · {photo.background_color}
            </Text>
            <Text style={styles.ratio}>{photo.aspect_ratio}</Text>
          </View>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => onDeletePhoto(photo.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={16} color={colors.error} />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: PADDING,
    gap: GAP,
  },
  card: {
    width: ITEM_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  image: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: colors.borderLight,
  },
  info: {
    padding: spacing.sm,
    gap: 2,
  },
  type: {
    ...typography.caption,
    color: colors.text,
    textTransform: 'capitalize',
  },
  ratio: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  deleteBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    padding: 6,
    ...shadows.sm,
  },
});
