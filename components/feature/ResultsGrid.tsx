import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { GeneratePhotoResult } from '@/services/aiService';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import { useState } from 'react';

interface ResultsGridProps {
  results: GeneratePhotoResult[];
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
        <View style={styles.headerBadge}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text style={styles.headerText}>
            {results.length} Photo{results.length > 1 ? 's' : ''} Ready
          </Text>
        </View>
      </View>
      {results.map((result, index) => {
        return <ResultCard key={`${result.image}-${index}`} result={result} />;
      })}
    </ScrollView>
  );
}

function ResultCard({ result }: { result: GeneratePhotoResult }) {
  const [imageLoading, setImageLoading] = useState(true);

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
      </View>
      {result.description && (
        <View style={styles.descriptionContainer}>
          <View style={styles.captionRow}>
            <Ionicons name="document-text-outline" size={14} color={colors.textTertiary} />
            <Text style={styles.captionLabel}>Prompt</Text>
          </View>
          <Text style={styles.description} numberOfLines={3}>
            {result.description}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  header: {
    paddingBottom: spacing.xs,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.successLight,
  },
  headerText: {
    ...typography.bodyMedium,
    color: colors.success,
    fontWeight: '700',
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
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: 0,
  },
  previewWrap: {
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
  descriptionContainer: {
    padding: spacing.lg,
    backgroundColor: colors.surfaceMuted,
    gap: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  captionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  captionLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    fontWeight: '700',
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
