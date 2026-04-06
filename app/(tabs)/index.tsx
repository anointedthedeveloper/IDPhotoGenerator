import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIDPhotoGenerator } from '@/hooks/useIDPhotoGenerator';
import { UploadSection } from '@/components/feature/UploadSection';
import { OptionsPanel } from '@/components/feature/OptionsPanel';
import { GenerateButton } from '@/components/feature/GenerateButton';
import { ResultsGrid } from '@/components/feature/ResultsGrid';
import { TemplateSelector } from '@/components/feature/TemplateSelector';
import { useAlert } from '@/template';
import { useInAppNotification } from '@/components/ui/InAppNotification';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();
  const { showNotification } = useInAppNotification();
  const {
    selectedImage,
    photoType,
    backgroundColor,
    aspectRatio,
    clothingStyle,
    selectedTemplateId,
    generatedPhotos,
    isGenerating,
    error,
    setPhotoType,
    setBackgroundColor,
    setAspectRatio,
    setClothingStyle,
    applyTemplate,
    handlePickImage,
    handleEditedImage,
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
      showNotification({ title: 'Error', message: error, type: 'error' });
      clearError();
    }
  }, [error]);

  // Show success notification when photos are generated
  const prevPhotosLength = generatedPhotos.length;
  useEffect(() => {
    if (generatedPhotos.length > prevPhotosLength && prevPhotosLength !== undefined) {
      showNotification({
        title: 'ID Photo Ready!',
        message: 'Your professional ID photo has been generated.',
        type: 'success',
        duration: 5000,
      });
    }
  }, [generatedPhotos.length]);

  const isTablet = Math.max(1, dimensions.width) >= 768;
  const isLandscape = Math.max(1, dimensions.width) > Math.max(1, dimensions.height);

  const Header = () => (
    <View style={styles.header}>
      <View style={styles.headerIconRow}>
        <View style={styles.headerIconBox}>
          <Ionicons name="id-card-outline" size={22} color={colors.primary} />
        </View>
        <View style={{ gap: 2 }}>
          <Text style={styles.title}>PhotoID Studio</Text>
          <Text style={styles.subtitle}>AI-powered professional ID photos</Text>
        </View>
      </View>
    </View>
  );

  const Footer = () => (
    <View style={styles.footer}>
      <View style={styles.footerDivider} />
      <View style={styles.footerContent}>
        <View style={styles.footerRow}>
          <Ionicons name="code-slash-outline" size={12} color={colors.textTertiary} />
          <Text style={styles.footerText}> Developed by </Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://github.com/anointedthedeveloper')}>
            <Text style={styles.footerLink}>@anointedthedeveloper</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.footerRow}>
          <Ionicons name="flash-outline" size={12} color={colors.textTertiary} />
          <Text style={styles.footerText}> Powered by </Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://anobyte.online')}>
            <Text style={styles.footerLink}>Anobyte</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const Controls = () => (
    <>
      <TemplateSelector
        selectedTemplateId={selectedTemplateId}
        onSelectTemplate={applyTemplate}
      />
      <UploadSection
        imageUri={selectedImage}
        onPress={handlePickImage}
        onEditedImage={handleEditedImage}
      />
      <OptionsPanel
        photoType={photoType}
        backgroundColor={backgroundColor}
        aspectRatio={aspectRatio}
        clothingStyle={clothingStyle}
        onPhotoTypeChange={setPhotoType}
        onBackgroundColorChange={setBackgroundColor}
        onAspectRatioChange={setAspectRatio}
        onClothingStyleChange={setClothingStyle}
      />
      <GenerateButton
        onPress={handleGenerate}
        loading={isGenerating}
        disabled={!selectedImage}
      />
    </>
  );

  if (isTablet || isLandscape) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Header />
        <View style={styles.splitContainer}>
          <View style={styles.leftPanel}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.leftContent}>
              <Controls />
              <Footer />
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
      <Header />
      <Controls />
      {generatedPhotos.length > 0 && (
        <View style={styles.resultsSection}>
          <View style={styles.resultsTitleRow}>
            <Ionicons name="images-outline" size={18} color={colors.text} />
            <Text style={styles.resultsTitle}>Generated Photos</Text>
          </View>
          <View style={styles.resultsContainer}>
            <ResultsGrid results={generatedPhotos} />
          </View>
        </View>
      )}
      <Footer />
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerIconBox: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.title,
    color: colors.text,
    fontSize: 22,
  },
  subtitle: {
    ...typography.caption,
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
  },
  resultsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
  footer: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  footerDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  footerContent: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  footerLink: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
