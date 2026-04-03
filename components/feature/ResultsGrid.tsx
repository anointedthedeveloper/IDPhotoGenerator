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
        <Ionicons name="checkmark-circle" size={20} color={colors.success} />
        <Text style={styles.headerText}>{results.length} Photo{results.length > 1 ? 's' : ''} Generated</Text>
      </View>
      {results.map((result, index) => {
        const [imageLoading, setImageLoading] = useState(true);
        return (
          <View key={index} style={styles.resultCard}>
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
            {result.description && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.description} numberOfLines={2}>
                  {result.description}
                </Text>
              </View>
            )}
          </View>
        );
      })}
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
  descriptionContainer: {
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
