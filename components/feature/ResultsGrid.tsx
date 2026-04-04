import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Pressable, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
        <LinearGradient
          colors={[colors.primaryLight, colors.accentLight]}
          style={styles.emptyIconWrap}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="images-outline" size={48} color={colors.primary} />
        </LinearGradient>
        <Text style={styles.emptyTitle}>Your photo will appear here</Text>
        <Text style={styles.emptyText}>Upload a portrait and hit Generate</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.successBadge}>
          <View style={styles.successDot} />
          <Text style={styles.headerText}>{results.length} Photo{results.length > 1 ? 's' : ''} Ready</Text>
        </View>
      </View>
      {results.map((result, index) => (
        <ResultCard key={`${result.image}-${index}`} result={result} showWatermark={needsWatermark} index={index} />
      ))}
    </ScrollView>
  );
}

function ResultCard({ result, showWatermark, index }: { result: GeneratePhotoResult; showWatermark: boolean; index: number }) {
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
      <View style={styles.cardLabel}>
        <Text style={styles.cardLabelText}>Result #{index + 1}</Text>
      </View>
      <View style={styles.previewWrap}>
        {imageLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        )}
        <Image
          source={{ uri: result.image }}
          style={styles.resultImage}
          contentFit="cover"
          transition={300}
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
        <Pressable
          style={({ pressed }) => [styles.actionBtn, styles.actionBtnPrimary, pressed && styles.actionBtnPressed]}
          onPress={handleDownload}
          disabled={downloading}
        >
          {downloading
            ? <ActivityIndicator size="small" color="#fff" />
            : <Ionicons name="download-outline" size={18} color="#fff" />
          }
          <Text style={styles.actionTextWhite}>Save</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.actionBtn, styles.actionBtnOutline, pressed && styles.actionBtnPressed]}
          onPress={handleShare}
          disabled={sharing}
        >
          {sharing
            ? <ActivityIndicator size="small" color={colors.primary} />
            : <Ionicons name="share-social-outline" size={18} color={colors.primary} />
          }
          <Text style={styles.actionTextOutline}>Share</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: spacing.xl, gap: spacing.xl },
  header: { paddingBottom: spacing.xs },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.successLight,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  successDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success,
  },
  headerText: { ...typography.bodyMedium, color: colors.success, fontWeight: '700' },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
    gap: spacing.lg,
  },
  emptyIconWrap: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { ...typography.heading, color: colors.text, textAlign: 'center' },
  emptyText: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardLabel: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surfaceElevated,
  },
  cardLabelText: {
    ...typography.label,
    color: colors.textSecondary,
  },
  previewWrap: { position: 'relative' },
  loadingContainer: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.borderLight, zIndex: 1, gap: spacing.sm,
  },
  loadingText: { ...typography.caption, color: colors.textSecondary },
  resultImage: { width: '100%', aspectRatio: 3 / 4, backgroundColor: colors.borderLight },
  watermarkContainer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(15,23,41,0.5)', paddingVertical: spacing.md,
    alignItems: 'center', gap: 2,
  },
  watermarkText: { fontSize: 18, fontWeight: '800', color: 'rgba(255,255,255,0.9)', letterSpacing: 2 },
  watermarkSub: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '500' },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    minHeight: 48,
  },
  actionBtnPrimary: {
    backgroundColor: colors.primary,
    ...shadows.md,
  },
  actionBtnOutline: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  actionBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  actionTextWhite: { ...typography.bodyMedium, color: '#fff', fontWeight: '700', fontSize: 14 },
  actionTextOutline: { ...typography.bodyMedium, color: colors.primary, fontWeight: '700', fontSize: 14 },
});
