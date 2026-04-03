import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useIDPhotoGenerator } from '@/hooks/useIDPhotoGenerator';
import { UploadSection } from '@/components/feature/UploadSection';
import { OptionsPanel } from '@/components/feature/OptionsPanel';
import { GenerateButton } from '@/components/feature/GenerateButton';
import { ResultsGrid } from '@/components/feature/ResultsGrid';
import { useAlert } from '@/template';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { useEffect, useState } from 'react';
import { AppLogo } from '@/components/ui/AppLogo';
import { AppFooter } from '@/components/ui/AppFooter';

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
  }, [error, showAlert, clearError]);

  const isTablet = Math.max(1, dimensions.width) >= 768;
  const isLandscape = Math.max(1, dimensions.width) > Math.max(1, dimensions.height);

  const renderHero = () => (
    <View style={styles.heroWrap}>
      <LinearGradient
        colors={['#FFFFFF', colors.backgroundAlt]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.heroTopRow}>
          <View style={styles.heroBadge}>
            <View style={styles.heroDot} />
            <Text style={styles.heroBadgeText}>AI-powered ID photo studio</Text>
          </View>
          <View style={styles.heroMiniStat}>
            <Text style={styles.heroMiniStatValue}>3-step</Text>
            <Text style={styles.heroMiniStatLabel}>flow</Text>
          </View>
        </View>

        <View style={styles.heroCopy}>
          <AppLogo size="lg" />
          <Text style={styles.heroTitle}>Professional ID photos, without the studio visit.</Text>
          <Text style={styles.subtitle}>
            Upload a portrait, choose your format, and generate a clean ID-ready result in seconds.
          </Text>
        </View>

        <View style={styles.heroChips}>
          <View style={styles.heroChip}>
            <Text style={styles.heroChipText}>Passport ready</Text>
          </View>
          <View style={styles.heroChip}>
            <Text style={styles.heroChipText}>Visa formats</Text>
          </View>
          <View style={styles.heroChip}>
            <Text style={styles.heroChipText}>Fast export</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  if (isTablet || isLandscape) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#F9FBFF', colors.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
          <Text style={styles.kicker}>Create</Text>
          <Text style={styles.title}>AI ID Photo Generator</Text>
          <Text style={styles.subtitle}>
            A polished workspace for turning everyday portraits into professional ID photos.
          </Text>
        </View>
        <View style={styles.splitContainer}>
          <View style={styles.leftPanel}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.leftContent}
            >
              {renderHero()}
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
    <View style={styles.container}>
      <LinearGradient
        colors={['#F8FBFF', colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.mobileContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
          <Text style={styles.kicker}>Create</Text>
          <Text style={styles.title}>AI ID Photo Generator</Text>
          <Text style={styles.subtitle}>
            Turn any portrait into a sharp, ID-ready photo with a few taps.
          </Text>
        </View>
        {renderHero()}
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
            <View style={styles.sectionHeader}>
              <Text style={styles.resultsTitle}>Generated Photos</Text>
              <View style={styles.sectionPill}>
                <Text style={styles.sectionPillText}>{generatedPhotos.length} ready</Text>
              </View>
            </View>
            <View style={styles.resultsContainer}>
              <ResultsGrid results={generatedPhotos} />
            </View>
          </View>
        )}
        <AppFooter />
      </ScrollView>
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
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  kicker: {
    ...typography.label,
    color: colors.primary,
  },
  title: {
    ...typography.title,
    color: colors.text,
    fontSize: 30,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 23,
  },
  heroWrap: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  heroCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.md,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    flexShrink: 1,
  },
  heroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  heroBadgeText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  heroMiniStat: {
    alignItems: 'flex-end',
  },
  heroMiniStatValue: {
    ...typography.bodyMedium,
    color: colors.text,
    fontWeight: '700',
  },
  heroMiniStatLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  heroCopy: {
    gap: spacing.sm,
  },
  heroTitle: {
    fontSize: 24,
    lineHeight: 32,
    color: colors.text,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  heroChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  heroChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  heroChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
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
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  rightPanel: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  mobileContent: {
    paddingBottom: spacing.xl,
    gap: spacing.lg,
    flexGrow: 1,
  },
  resultsSection: {
    gap: spacing.lg,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultsTitle: {
    ...typography.heading,
    color: colors.text,
  },
  sectionPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
  },
  sectionPillText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  resultsContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    minHeight: 300,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.md,
  },
});
