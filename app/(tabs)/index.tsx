import { View, Text, StyleSheet, Platform, ScrollView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIDPhotoGenerator } from '@/hooks/useIDPhotoGenerator';
import { UploadSection } from '@/components/feature/UploadSection';
import { OptionsPanel } from '@/components/feature/OptionsPanel';
import { GenerateButton } from '@/components/feature/GenerateButton';
import { ResultsGrid } from '@/components/feature/ResultsGrid';
import { useAlert } from '@/template';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { useEffect, useState } from 'react';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();
  const {
    selectedImage,
    photoType,
    backgroundColor,
    aspectRatio,
    generatedPhotos,
    isGenerating,
    error,
    setPhotoType,
    setBackgroundColor,
    setAspectRatio,
    handlePickImage,
    handleGenerate,
    clearError,
  } = useIDPhotoGenerator();

  const [dimensions, setDimensions] = useState({
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  });

  useEffect(() => {
    const update = () => setDimensions(Dimensions.get('window'));
    update();
    const sub = Dimensions.addEventListener('change', update);
    return () => sub?.remove();
  }, []);

  useEffect(() => {
    if (error) {
      showAlert('Error', error);
      clearError();
    }
  }, [error]);

  const isTablet = Math.max(1, dimensions.width) >= 768;
  const isLandscape = Math.max(1, dimensions.width) > Math.max(1, dimensions.height);

  if (isTablet || isLandscape) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.title}>✨ ID Photo Generator</Text>
          <Text style={styles.subtitle}>Transform your photo into professional ID format</Text>
        </View>
        <View style={styles.splitContainer}>
          <View style={styles.leftPanel}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.leftContent}
            >
              <UploadSection imageUri={selectedImage} onPress={handlePickImage} />
              <OptionsPanel
                photoType={photoType}
                backgroundColor={backgroundColor}
                aspectRatio={aspectRatio}
                onPhotoTypeChange={setPhotoType}
                onBackgroundColorChange={setBackgroundColor}
                onAspectRatioChange={setAspectRatio}
              />
              <GenerateButton
                onPress={handleGenerate}
                loading={isGenerating}
                disabled={!selectedImage}
              />
            </ScrollView>
          </View>
          <View style={styles.rightPanel}>
            <ResultsGrid results={generatedPhotos} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.mobileContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>✨ ID Photo Generator</Text>
        <Text style={styles.subtitle}>Transform your photo into professional ID format</Text>
      </View>
      <UploadSection imageUri={selectedImage} onPress={handlePickImage} />
      <OptionsPanel
        photoType={photoType}
        backgroundColor={backgroundColor}
        aspectRatio={aspectRatio}
        onPhotoTypeChange={setPhotoType}
        onBackgroundColorChange={setBackgroundColor}
        onAspectRatioChange={setAspectRatio}
      />
      <GenerateButton
        onPress={handleGenerate}
        loading={isGenerating}
        disabled={!selectedImage}
      />
      {generatedPhotos.length > 0 && (
        <View style={styles.resultsSection}>
          <Text style={styles.resultsTitle}>Generated Photos</Text>
          <View style={styles.resultsContainer}>
            <ResultsGrid results={generatedPhotos} />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  splitContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  leftPanel: {
    flex: 1,
    maxWidth: 420,
  },
  leftContent: {
    gap: spacing.xl,
  },
  rightPanel: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  mobileContent: {
    padding: spacing.xl,
    gap: spacing.xl,
  },
  resultsSection: {
    gap: spacing.lg,
    marginTop: spacing.xl,
  },
  resultsTitle: {
    ...typography.heading,
    color: colors.text,
  },
  resultsContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    minHeight: 300,
    ...shadows.md,
  },
});
