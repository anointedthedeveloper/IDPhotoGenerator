import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { GeneratePhotoResult } from '@/services/aiService';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import { useState } from 'react';

interface ResultsGridProps {
  results: GeneratePhotoResult[];
  needsWatermark?: boolean;
}

export function ResultsGrid({ results, needsWatermark = false }: ResultsGridProps) {
  if (results.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="images-outline" size={64} color={colors.textTertiary} />
        </View>
        <Text style={styles.emptyTitle}>No photos yet</Text>
        <Text style={styles.emptyText}>Generated photos will appear here</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerBadge}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text style={styles.headerText}>{results.length} Photo{results.length > 1 ? 's' : ''} Ready</Text>
        </View>
      </View>
      {results.map((result, index) => (
        <ResultCard key={`${result.image}-${index}`} result={result} showWatermark={needsWatermark} />
      ))}
    </ScrollView>
  );
}

function ResultCard({ result, showWatermark }: { result: GeneratePhotoResult; showWatermark: boolean }) {
  const [imageLoading, setImageLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);

  const getLocalUri = async (): Promise<string | null> => {
    try {
      const filename = `idphoto_${Date.now()}.jpg`;
      const localUri = FileSystem.cacheDirectory + filename;
      const { uri } = await FileSystem.downloadAsync(result.image, localUri);
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
    <View style={styles.resultCard}>
      <View style={styles.previewWrap}>
        {imageLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
        <Image
          source={{ uri: result.image }}
          style={styles.resultImage}
          contentFit="cover"
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
        />
        {showWatermark && (
          <View style={styles.watermarkContainer} pointerEvents="none">
            <Text style={styles.watermarkText}>IDPhoto AI</Text>
            <Text style={styles.watermarkSub}>Upgrade to Pro to remove</Text>
          </View>
        )}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleDownload} disabled={downloading}>
          {downloading ? <ActivityIndicator size="small" color={colors.primary} /> : <Ionicons name="download-outline" size={18} color={colors.primary} />}
          <Text style={styles.actionText}>Save</Text>
        </TouchableOpacity>
        <View style={styles.actionDivider} />
        <TouchableOpacity style={styles.actionBtn} onPress={handleShare} disabled={sharing}>
          {sharing ? <ActivityIndicator size="small" color={colors.primary} /> : <Ionicons name="share-outline" size={18} color={colors.primary} />}
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: spacing.xl, gap: spacing.lg },
  header: { paddingBottom: spacing.xs },
  headerBadge: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: borderRadius.full, backgroundColor: colors.successLight,
  },
  headerText: { ...typography.bodyMedium, color: colors.success, fontWeight: '700' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxxl, gap: spacing.lg },
  emptyIconContainer: { padding: spacing.xl, borderRadius: borderRadius.full, backgroundColor: colors.primaryLight },
  emptyTitle: { ...typography.heading, color: colors.text },
  emptyText: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  resultCard: {
    backgroundColor: colors.surface, borderRadius: borderRadius.xl,
    overflow: 'hidden', ...shadows.md, borderWidth: 1, borderColor: colors.borderLight,
  },
  previewWrap: { position: 'relative' },
  loadingContainer: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center', backgroundColor: colors.borderLight, zIndex: 1,
  },
  resultImage: { width: '100%', aspectRatio: 3 / 4, backgroundColor: colors.borderLight },
  watermarkContainer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.45)', paddingVertical: spacing.md,
    alignItems: 'center', gap: 2,
  },
  watermarkText: { fontSize: 18, fontWeight: '800', color: 'rgba(255,255,255,0.85)', letterSpacing: 2 },
  watermarkSub: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '500' },
  actions: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.borderLight },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, paddingVertical: spacing.md },
  actionDivider: { width: 1, height: 20, backgroundColor: colors.borderLight },
  actionText: { ...typography.bodyMedium, color: colors.primary, fontSize: 14 },
});
