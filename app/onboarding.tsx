import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Linking,
} from 'react-native';
import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

const ONBOARDING_KEY = 'onboarding_complete';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    icon: 'camera-outline' as const,
    iconBg: '#DBEAFE',
    iconColor: '#3B82F6',
    accentColor: '#3B82F6',
    title: 'Upload Your Photo',
    subtitle: 'Simply pick any photo from your gallery — selfie, portrait, or casual shot — and let the AI do the rest.',
    features: [
      { icon: 'image-outline' as const, label: 'Any photo from gallery' },
      { icon: 'crop-outline' as const, label: 'No manual cropping needed' },
    ],
  },
  {
    id: 2,
    icon: 'options-outline' as const,
    iconBg: '#D1FAE5',
    iconColor: '#10B981',
    accentColor: '#10B981',
    title: 'Customize Your Style',
    subtitle: 'Choose your photo type, background color, outfit style, and aspect ratio to match any official requirement.',
    features: [
      { icon: 'shirt-outline' as const, label: 'Formal suit or keep your outfit' },
      { icon: 'color-palette-outline' as const, label: '6 background color options' },
    ],
  },
  {
    id: 3,
    icon: 'sparkles' as const,
    iconBg: '#FEF3C7',
    iconColor: '#F59E0B',
    accentColor: '#F59E0B',
    title: 'Generate & Save',
    subtitle: 'AI generates your professional ID photo instantly. Download it, share it, or save it to your library.',
    features: [
      { icon: 'download-outline' as const, label: 'Save to device gallery' },
      { icon: 'share-outline' as const, label: 'Share to any app' },
    ],
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentSlide, setCurrentSlide] = useState(0);
  const translateX = useSharedValue(0);
  const cardScale = useSharedValue(1);

  const goToSlide = (index: number) => {
    const direction = index > currentSlide ? -1 : 1;
    translateX.value = withTiming(direction * 40, { duration: 150 }, () => {
      translateX.value = direction * -40;
      cardScale.value = 0.96;
    });
    setTimeout(() => {
      setCurrentSlide(index);
      translateX.value = withSpring(0, { damping: 18, stiffness: 180 });
      cardScale.value = withSpring(1, { damping: 18, stiffness: 180 });
    }, 150);
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      goToSlide(currentSlide + 1);
    }
  };

  const handleGetStarted = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/login');
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/login');
  };

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: cardScale.value },
    ],
  }));

  const slide = slides[currentSlide];

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Skip button */}
      {currentSlide < slides.length - 1 && (
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} activeOpacity={0.7}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Slide count indicator top */}
      <View style={styles.slideCount}>
        <Text style={styles.slideCountText}>{currentSlide + 1} / {slides.length}</Text>
      </View>

      {/* Main illustration card */}
      <Animated.View style={[styles.illustrationWrapper, cardAnimStyle]}>
        <View style={[styles.illustrationCard, { borderColor: slide.accentColor + '33' }]}>
          {/* Large icon backdrop */}
          <View style={[styles.iconBackdrop, { backgroundColor: slide.iconBg }]}>
            <View style={[styles.iconRing, { borderColor: slide.accentColor + '40' }]}>
              <Ionicons name={slide.icon} size={72} color={slide.iconColor} />
            </View>
          </View>

          {/* Floating feature chips */}
          {slide.features.map((f, i) => (
            <View
              key={i}
              style={[
                styles.featureChip,
                i === 0 ? styles.chipTopLeft : styles.chipBottomRight,
                { borderColor: slide.accentColor + '40', backgroundColor: slide.iconBg },
              ]}
            >
              <Ionicons name={f.icon} size={14} color={slide.iconColor} />
              <Text style={[styles.chipText, { color: slide.iconColor }]}>{f.label}</Text>
            </View>
          ))}

          {/* Slide number badge */}
          <View style={[styles.slideBadge, { backgroundColor: slide.accentColor }]}>
            <Text style={styles.slideBadgeText}>{currentSlide + 1}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Text content */}
      <View style={styles.textContent}>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
      </View>

      {/* Dot indicators */}
      <View style={styles.dots}>
        {slides.map((_, i) => (
          <TouchableOpacity key={i} onPress={() => goToSlide(i)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <View
              style={[
                styles.dot,
                i === currentSlide
                  ? [styles.dotActive, { backgroundColor: slide.accentColor }]
                  : styles.dotInactive,
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* CTA buttons */}
      <View style={styles.ctaContainer}>
        {currentSlide < slides.length - 1 ? (
          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: slide.accentColor }]}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <Text style={styles.nextButtonText}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.surface} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
            activeOpacity={0.85}
          >
            <Ionicons name="sparkles" size={20} color={colors.surface} />
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Footer branding */}
      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Developed by </Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://github.com/anointedthedeveloper')}>
            <Text style={styles.footerLink}>@anointedthedeveloper</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Powered by </Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://anobyte.online')}>
            <Text style={styles.footerLink}>Anobyte</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
  },
  skipBtn: {
    alignSelf: 'flex-end',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  skipText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  slideCount: {
    position: 'absolute',
    top: 60,
    left: spacing.xl,
  },
  slideCountText: {
    ...typography.caption,
    color: colors.textTertiary,
    fontWeight: '600',
  },
  illustrationWrapper: {
    width: '100%',
    marginTop: spacing.md,
  },
  illustrationCard: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    overflow: 'hidden',
    ...shadows.lg,
    position: 'relative',
  },
  iconBackdrop: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureChip: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  chipTopLeft: {
    top: spacing.xl,
    left: spacing.lg,
  },
  chipBottomRight: {
    bottom: spacing.xl,
    right: spacing.lg,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  slideBadge: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideBadgeText: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: '700',
  },
  textContent: {
    gap: spacing.md,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  dot: {
    borderRadius: borderRadius.full,
  },
  dotActive: {
    width: 24,
    height: 8,
  },
  dotInactive: {
    width: 8,
    height: 8,
    backgroundColor: colors.border,
  },
  ctaContainer: {
    width: '100%',
  },
  nextButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  nextButtonText: {
    ...typography.button,
    color: colors.surface,
  },
  getStartedButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    ...shadows.md,
  },
  getStartedText: {
    ...typography.button,
    color: colors.surface,
  },
  footer: {
    alignItems: 'center',
    gap: 2,
    paddingBottom: spacing.sm,
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
