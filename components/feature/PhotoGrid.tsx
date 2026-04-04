import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { Photo } from '@/contexts/PhotoLibraryContext';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import { useState } from 'react';

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
      {photos.map((photo, index) => (
        <PhotoCard key={photo.id} photo={photo} index={index} onDelete={onDeletePhoto} />
      ))}
    </View>
  );
}

function PhotoCard({ photo, index, onDelete }: { photo: Photo; index: number; onDelete: (id: string) => void }) {
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const showWatermark = index >= 3;

  const getLocalUri = async (): Promise<string | null> => {
    try {
      const filename = `idphoto_${Date.now()}.jpg`;
      const localUri = FileSystem.cacheDirectory + filename;
      const { uri } = await FileSystem.downloadAsync(photo.generated_image_url, localUri);
      return uri;
    } catch { return null; }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission Required', 'Please allow access to save photos to your gallery.'); return; }
      const localUri = await getLocalUri();
      if (!localUri) { Alert.alert('Error', 'Failed to download photo.'); return; }
      await MediaLibrary.saveToLibraryAsync(localUri);
      Alert.alert('Saved!', 'Photo saved to your gallery.');
    } catch { Alert.alert('Error', 'Failed to save photo.'); }
    finally { setDownloading(false); }
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const localUri = await getLocalUri();
      if (!localUri) { Alert.alert('Error', 'Failed to prepare photo for sharing.'); return; }
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) { Alert.alert('Unavailable', 'Sharing is not available on this device.'); return; }
      await Sharing.shareAsync(localUri, { mimeType: 'image/jpeg', dialogTitle: 'Share ID Photo' });
    } catch { Alert.alert('Error', 'Failed to share photo.'); }
    finally { setSharing(false); }
  };

  return (
    <View style={styles.card}>
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: photo.generated_image_url }}
          style={styles.image}
          contentFit="cover"
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          transition={300}
        />
        {showWatermark && (
          <View style={styles.watermark} pointerEvents="none">
            <Text style={styles.watermarkText}>IDPhoto AI</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.type} numberOfLines={1}>{photo.photo_type} · {photo.background_color}</Text>
        <Text style={styles.ratio}>{photo.aspect_ratio}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleDownload} disabled={downloading}>
          {downloading ? <ActivityIndicator size="small" color={colors.primary} /> : <Ionicons name="download-outline" size={14} color={colors.primary} />}
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.actionBtn} onPress={handleShare} disabled={sharing}>
          {sharing ? <ActivityIndicator size="small" color={colors.primary} /> : <Ionicons name="share-outline" size={14} color={colors.primary} />}
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.actionBtn} onPress={() => onDelete(photo.id)}>
          <Ionicons name="trash-outline" size={14} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: PADDING, gap: GAP },
  card: { width: ITEM_WIDTH, backgroundColor: colors.surface, borderRadius: borderRadius.xl, overflow: 'hidden', ...shadows.sm, borderWidth: 1, borderColor: colors.borderLight },
  imageWrap: { position: 'relative' },
  image: { width: '100%', aspectRatio: 3 / 4, backgroundColor: colors.borderLight },
  watermark: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)', paddingVertical: 6, alignItems: 'center',
  },
  watermarkText: { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.8)', letterSpacing: 1.5 },
  info: { padding: spacing.sm, gap: 2 },
  type: { ...typography.caption, color: colors.text, textTransform: 'capitalize', fontWeight: '600' },
  ratio: { ...typography.caption, color: colors.textTertiary },
  actions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.borderLight },
  actionBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.sm },
  divider: { width: 1, backgroundColor: colors.borderLight },
});
