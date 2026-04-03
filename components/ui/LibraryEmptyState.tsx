import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';

export function LibraryEmptyState() {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;
  const router = useRouter();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
      <View style={styles.illustration}>
        <View style={styles.illustrationBg}>
          <View style={styles.photoStack3} />
          <View style={styles.photoStack2} />
          <View style={styles.photoStack1}>
            <Ionicons name="person" size={36} color={colors.primary} />
          </View>
        </View>
        <View style={styles.sparkle1}><Ionicons name="sparkles" size={16} color={colors.primary} /></View>
        <View style={styles.sparkle2}><Ionicons name="sparkles" size={10} color={colors.accent} /></View>
      </View>

      <View style={styles.copy}>
        <Text style={styles.title}>Your library is empty</Text>
        <Text style={styles.subtitle}>
          Generate your first professional ID photo and it will appear here, ready to download or share.
        </Text>
      </View>

      <View style={styles.badges}>
        {['Passport', 'Visa', 'ID Card'].map(label => (
          <View key={label} style={styles.badge}>
            <Ionicons name="checkmark-circle" size={12} color={colors.success} />
            <Text style={styles.badgeText}>{label}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.cta} onPress={() => router.push('/(tabs)')} activeOpacity={0.85}>
        <Ionicons name="add-circle-outline" size={20} color={colors.surface} />
        <Text style={styles.ctaText}>Create Your First ID Photo</Text>
      </TouchableOpacity>

      <View style={styles.poweredBy}>
        <Text style={styles.poweredByText}>Powered by </Text>
        <Text style={styles.poweredByBrand}>Anobyte</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.xl },
  illustration: { position: 'relative', width: 140, height: 140, alignItems: 'center', justifyContent: 'center' },
  illustrationBg: { width: 100, height: 120, alignItems: 'center', justifyContent: 'center' },
  photoStack3: {
    position: 'absolute', width: 72, height: 90, borderRadius: borderRadius.lg,
    backgroundColor: colors.accentLight, transform: [{ rotate: '-8deg' }], top: 10, left: 10,
  },
  photoStack2: {
    position: 'absolute', width: 72, height: 90, borderRadius: borderRadius.lg,
    backgroundColor: colors.primaryLight, transform: [{ rotate: '-3deg' }], top: 5, left: 14,
  },
  photoStack1: {
    width: 80, height: 96, borderRadius: borderRadius.lg,
    backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', ...shadows.md,
  },
  sparkle1: { position: 'absolute', top: 0, right: 8 },
  sparkle2: { position: 'absolute', bottom: 8, left: 4 },
  copy: { alignItems: 'center', gap: spacing.sm },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  badges: { flexDirection: 'row', gap: spacing.sm },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: borderRadius.full, backgroundColor: colors.successLight,
  },
  badgeText: { ...typography.caption, color: colors.success, fontWeight: '600' },
  cta: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.primary, paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl, borderRadius: borderRadius.lg, ...shadows.md,
  },
  ctaText: { ...typography.button, color: colors.surface },
  poweredBy: { flexDirection: 'row', alignItems: 'center' },
  poweredByText: { ...typography.caption, color: colors.textTertiary },
  poweredByBrand: { ...typography.caption, color: colors.primary, fontWeight: '700' },
});
