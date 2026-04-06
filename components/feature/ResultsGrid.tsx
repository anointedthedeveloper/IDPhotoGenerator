import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { GeneratePhotoResult } from '@/services/aiService';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import { useState } from 'react';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface ResultsGridProps {
  results: GeneratePhotoResult[];
}

function ResultCard({ result, index }: { result: GeneratePhotoResult; index: number }) {
  const [imageLoading, setImageLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [sharing, setSharing] = useState(false);

  const getLocalUri = async (): Promise<string> => {
    if (result.image.startsWith('http')) {
      const fileUri = `${FileSystem.cacheDirectory}id_photo_${Date.now()}.jpg`;
      await FileSystem.downloadAsync(result.image, fileUri);
      return fileUri;
    }
    return result.image;
  };

  const handleDownload = async () => {
    if (Platform.OS === 'web') {
      const link = document.createElement('a');
      link.href = result.image;
      link.download = `id_photo_${Date.now()}.jpg`;
      link.target = '_blank';
      link.click();
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
      return;
    }

    try {
      setDownloading(true);
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission required to save photos to your library.');
        return;
      }
      const localUri = await getLocalUri();
      await MediaLibrary.saveToLibraryAsync(localUri);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to save photo. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (Platform.OS === 'web') {
      if (navigator.share) {
        await navigator.share({ title: 'ID Photo', url: result.image });
      } else {
        window.open(result.image, '_blank');
      }
      return;
    }

    try {
      setSharing(true);
      const localUri = await getLocalUri();
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        alert('Sharing is not available on this device.');
        return;
      }
      await Sharing.shareAsync(localUri, {
        mimeType: 'image/jpeg',
        dialogTitle: 'Share your ID Photo',
        UTI: 'public.jpeg',
      });
    } catch (err) {
      console.error('Share error:', err);
    } finally {
      setSharing(false);
    }
  };

  return (
    <View style={styles.resultCard}>
      {imageLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}
      <Image
        source={{ uri: result.image }}
        style={styles.resultImage}
        contentFit="contain"
        onLoadStart={() => setImageLoading(true)}
        onLoadEnd={() => setImageLoading(false)}
      />

      {/* Action row */}
      <View style={styles.actionRow}>
        <View style={styles.photoBadge}>
          <Ionicons name="checkmark-circle" size={13} color={colors.success} />
          <Text style={styles.photoBadgeText}>Photo {index + 1}</Text>
        </View>

        <View style={styles.actionButtons}>
          {/* Share button */}
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
            disabled={sharing}
            activeOpacity={0.8}
          >
            {sharing ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <Ionicons name="share-outline" size={14} color={colors.primary} />
                <Text style={styles.shareText}>Share</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Download button */}
          <TouchableOpacity
            style={[styles.downloadButton, downloaded && styles.downloadButtonDone]}
            onPress={handleDownload}
            disabled={downloading}
            activeOpacity={0.8}
          >
            {downloading ? (
              <ActivityIndicator size="small" color={colors.surface} />
            ) : downloaded ? (
              <>
                <Ionicons name="checkmark" size={14} color={colors.surface} />
                <Text style={styles.downloadText}>Saved</Text>
              </>
            ) : (
              <>
                <Ionicons name="download-outline" size={14} color={colors.surface} />
                <Text style={styles.downloadText}>Save</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {result.description ? (
        <View style={styles.descriptionContainer}>
          <Text style={styles.description} numberOfLines={2}>
            {result.description}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export function ResultsGrid({ results }: ResultsGridProps) {
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Ionicons name="checkmark-circle" size={20} color={colors.success} />
        <Text style={styles.headerText}>{results.length} Photo{results.length > 1 ? 's' : ''} Generated</Text>
      </View>
      {results.map((result, index) => (
        <ResultCard key={index} result={result} index={index} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.xl,
    gap: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  headerText: {
    ...typography.bodyMedium,
    color: colors.success,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
    gap: spacing.lg,
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
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
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
  resultImage: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: colors.borderLight,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  photoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  photoBadgeText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  shareText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary,
  },
  downloadButtonDone: {
    backgroundColor: colors.success,
  },
  downloadText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '600',
  },
  descriptionContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
