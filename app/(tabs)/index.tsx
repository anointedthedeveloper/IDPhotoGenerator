import { View, Text, StyleSheet, ScrollView, Dimensions, Modal, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useIDPhotoGenerator } from '@/hooks/useIDPhotoGenerator';
import { UploadSection } from '@/components/feature/UploadSection';
import { OptionsPanel } from '@/components/feature/OptionsPanel';
import { GenerateButton } from '@/components/feature/GenerateButton';
import { ResultsGrid } from '@/components/feature/ResultsGrid';
import { GenerationProgressOverlay } from '@/components/ui/GenerationProgress';
import { BeforeAfterSlider } from '@/components/ui/BeforeAfterSlider';
import { UploadGuidance } from '@/components/ui/UploadGuidance';
import { useAlert } from '@/template';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { useEffect, useState } from 'react';

type Screen = 'main' | 'guidance' | 'result';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();
  const {
    selectedImage, photoType, backgroundColor, aspectRatio,
    generatedPhotos, isGenerating, progress, error, latestResult,
    needsWatermark, remainingFree, cooldownSeconds, isPro, canGenerate,
    setPhotoType, setBackgroundColor, setAspectRatio,
    handlePickImage, handleGenerate, clearError,
  } = useIDPhotoGenerator();

  const [screen, setScreen] = useState<Screen>('main');
  const [showSlider, setShowSlider] = useState(false);

  const [dimensions, setDimensions] = useState({
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  });

  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window }) => setDimensions(window));
    return () => sub?.remove();
  }, []);

  useEffect(() => {
    if (error) { showAlert('Error', error); clearError(); }
  }, [error]);

  // When a result arrives, show result view
  useEffect(() => {
    if (latestResult && !isGenerating && progress.stage === 'done') {
      setShowSlider(true);
    }
  }, [latestResult, isGenerating, progress.stage]);

  const isTablet = dimensions.width >= 768;
  const isLandscape = dimensions.width > dimensions.height;

  const handleUploadAndGuide = async () => {
    await handlePickImage();
    setScreen('guidance');
  };

  const handlePickAndStay = async () => {
    await handlePickImage();
  };

  const handleContinueToGenerate = () => {
    setScreen('main');
  };

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.kicker}>AI Studio</Text>
          <Text style={styles.title}>ID Photo{'\n'}Generator</Text>
        </View>
        <View style={styles.headerBadge}>
          <LinearGradient
            colors={[colors.primary, colors.accent]}
            style={styles.headerBadgeGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="sparkles" size={14} color="#fff" />
            <Text style={styles.headerBadgeText}>AI Powered</Text>
          </LinearGradient>
        </View>
      </View>
      <Text style={styles.subtitle}>
        Turn any portrait into a sharp, ID-ready photo in seconds.
      </Text>
    </View>
  );

  const renderSteps = () => (
    <View style={styles.stepsRow}>
      {[
        { n: '1', label: 'Upload' },
        { n: '2', label: 'Configure' },
        { n: '3', label: 'Generate' },
      ].map((step, i, arr) => (
        <View key={step.n} style={styles.stepItem}>
          <View style={styles.stepCircle}>
            <Text style={styles.stepNum}>{step.n}</Text>
          </View>
          <Text style={styles.stepLabel}>{step.label}</Text>
          {i < arr.length - 1 && <View style={styles.stepLine} />}
        </View>
      ))}
    </View>
  );

  // Upload section that opens guidance
  const renderUploadWithGuidance = () => (
    <View style={styles.uploadWrap}>
      <Pressable
        style={({ pressed }) => [styles.uploadCard, pressed && styles.uploadCardPressed]}
        onPress={handleUploadAndGuide}
      >
        {selectedImage ? (
          <View style={styles.imagePreviewWrap}>
            <UploadSection imageUri={selectedImage} onPress={() => {}} />
            {/* Guidance button overlay */}
            <Pressable
              style={styles.guidanceChip}
              onPress={() => setScreen('guidance')}
            >
              <Ionicons name="checkmark-circle-outline" size={14} color={colors.primary} />
              <Text style={styles.guidanceChipText}>View Quality Check</Text>
            </Pressable>
          </View>
        ) : (
          <UploadSection imageUri={null} onPress={handleUploadAndGuide} />
        )}
      </Pressable>
    </View>
  );

  const renderControls = () => (
    <>
      {renderUploadWithGuidance()}
      <OptionsPanel
        photoType={photoType}
        backgroundColor={backgroundColor}
        aspectRatio={aspectRatio}
        onPhotoTypeChange={setPhotoType}
        onBackgroundColorChange={setBackgroundColor}
        onAspectRatioChange={setAspectRatio}
      />
      <View style={styles.generateWrap}>
        <GenerateButton
          onPress={handleGenerate}
          loading={isGenerating}
          disabled={!selectedImage}
          remainingFree={remainingFree}
          cooldownSeconds={cooldownSeconds}
          isPro={isPro}
          canGenerate={canGenerate}
        />
        {/* Progress overlay inside generate wrap area */}
        <GenerationProgressOverlay
          progress={progress}
          visible={isGenerating || progress.stage === 'done'}
        />
      </View>
    </>
  );

  // Guidance screen
  if (screen === 'guidance') {
    return (
      <View style={styles.container}>
        <LinearGradient colors={[colors.background, '#E4ECFF']} style={StyleSheet.absoluteFillObject} />
        <View style={{ paddingTop: insets.top }} />
        <UploadGuidance
          imageUri={selectedImage}
          onContinue={handleContinueToGenerate}
          onChangePhoto={handlePickAndStay}
          onBack={() => setScreen('main')}
        />
      </View>
    );
  }

  if (isTablet || isLandscape) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={[colors.background, '#E4ECFF']} style={StyleSheet.absoluteFillObject} />
        {renderHeader()}
        <View style={styles.splitContainer}>
          <View style={styles.leftPanel}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.leftContent}>
              {renderSteps()}
              {renderControls()}
            </ScrollView>
          </View>
          <View style={styles.rightPanel}>
            {latestResult ? (
              <BeforeAfterSlider
                originalUri={latestResult.original}
                generatedUri={latestResult.generated}
              />
            ) : (
              <ResultsGrid results={generatedPhotos} needsWatermark={needsWatermark} />
            )}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.background, '#E4ECFF']} style={StyleSheet.absoluteFillObject} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.mobileContent}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderSteps()}
        {renderControls()}

        {/* Before/After Slider for latest result */}
        {latestResult && (
          <View style={styles.sliderSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Latest Result</Text>
              <Pressable
                style={styles.viewAllBtn}
                onPress={() => setShowSlider(true)}
              >
                <Text style={styles.viewAllText}>Full View</Text>
                <Ionicons name="expand-outline" size={14} color={colors.primary} />
              </Pressable>
            </View>
            <BeforeAfterSlider
              originalUri={latestResult.original}
              generatedUri={latestResult.generated}
              aspectRatio={3 / 4}
            />
          </View>
        )}

        {generatedPhotos.length > 0 && (
          <View style={styles.resultsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Generated Photos</Text>
              <View style={styles.sectionCount}>
                <Text style={styles.sectionCountText}>{generatedPhotos.length} ready</Text>
              </View>
            </View>
            <View style={styles.resultsContainer}>
              <ResultsGrid results={generatedPhotos} needsWatermark={needsWatermark} />
            </View>
          </View>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>

      {/* Full-screen slider modal */}
      <Modal visible={showSlider} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowSlider(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHandle} />
          <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
            {latestResult ? (
              <BeforeAfterSlider
                originalUri={latestResult.original}
                generatedUri={latestResult.generated}
                aspectRatio={3 / 4}
                onClose={() => setShowSlider(false)}
              />
            ) : null}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  kicker: {
    ...typography.label,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.8,
    lineHeight: 38,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  headerBadge: { borderRadius: borderRadius.full, overflow: 'hidden', marginTop: spacing.xs },
  headerBadgeGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  headerBadgeText: {
    ...typography.caption,
    color: '#fff',
    fontWeight: '700',
  },

  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  stepItem: {
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
    position: 'relative',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
  },
  stepLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  stepLine: {
    position: 'absolute',
    top: 16,
    right: -spacing.lg,
    width: spacing.xxl,
    height: 2,
    backgroundColor: colors.primaryLight,
    borderRadius: 1,
  },

  uploadWrap: { paddingHorizontal: spacing.xl },
  uploadCard: { width: '100%' },
  uploadCardPressed: { opacity: 0.94, transform: [{ scale: 0.99 }] },
  imagePreviewWrap: { position: 'relative' },
  guidanceChip: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary,
    ...shadows.sm,
  },
  guidanceChipText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },

  generateWrap: {
    position: 'relative',
    paddingHorizontal: spacing.xl,
  },

  mobileContent: { paddingBottom: spacing.xl, flexGrow: 1, gap: spacing.xl },
  splitContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  leftPanel: { flex: 1, maxWidth: 420 },
  leftContent: { gap: spacing.xl, paddingBottom: spacing.xl },
  rightPanel: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  sliderSection: {
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  resultsSection: {
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: { ...typography.heading, color: colors.text },
  sectionCount: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
  },
  sectionCountText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryMid,
  },
  viewAllText: {
    ...typography.caption,
    color: colors.primary,
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
  bottomPad: { height: spacing.xl },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: spacing.md,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  modalContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
});
