import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAlert } from '@/template';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';

type PlanFeature = { label: string; included: boolean };
type Plan = {
  id: string; name: string; price: string; period: string;
  badge?: string; badgeColor?: string; description: string;
  cta: string; ctaStyle: 'primary' | 'outline' | 'ghost';
  features: PlanFeature[];
};

const plans: Plan[] = [
  {
    id: 'free', name: 'Free', price: '$0', period: 'forever',
    description: 'Get started with basic AI ID photo generation',
    cta: 'Current Plan', ctaStyle: 'ghost',
    features: [
      { label: '3 photo generations per day', included: true },
      { label: 'Standard backgrounds (White, Gray, Blue)', included: true },
      { label: 'Half-body and full-body formats', included: true },
      { label: 'Save to library (up to 10 photos)', included: true },
      { label: 'HD quality output', included: false },
      { label: 'Priority AI processing', included: false },
      { label: 'Custom background colors', included: false },
      { label: 'Batch generation', included: false },
      { label: 'Commercial license', included: false },
    ],
  },
  {
    id: 'pro', name: 'Pro', price: '$4.99', period: 'per month',
    badge: 'Most Popular', badgeColor: colors.primary,
    description: 'For professionals who need high-quality ID photos regularly',
    cta: 'Start Free Trial', ctaStyle: 'primary',
    features: [
      { label: '50 photo generations per day', included: true },
      { label: 'Standard backgrounds (White, Gray, Blue)', included: true },
      { label: 'Half-body and full-body formats', included: true },
      { label: 'Unlimited library storage', included: true },
      { label: 'HD quality output', included: true },
      { label: 'Priority AI processing', included: true },
      { label: 'Custom background colors', included: true },
      { label: 'Batch generation (up to 5)', included: false },
      { label: 'Commercial license', included: false },
    ],
  },
  {
    id: 'business', name: 'Business', price: '$14.99', period: 'per month',
    badge: 'Best Value', badgeColor: colors.success,
    description: 'Built for teams, agencies, and commercial use',
    cta: 'Contact Sales', ctaStyle: 'outline',
    features: [
      { label: 'Unlimited photo generations', included: true },
      { label: 'Standard backgrounds (White, Gray, Blue)', included: true },
      { label: 'Half-body and full-body formats', included: true },
      { label: 'Unlimited library storage', included: true },
      { label: 'HD quality output', included: true },
      { label: 'Priority AI processing', included: true },
      { label: 'Custom background colors', included: true },
      { label: 'Batch generation (up to 20)', included: true },
      { label: 'Commercial license', included: true },
    ],
  },
];

export default function PlansScreen() {
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();

  const handleCTA = (plan: Plan) => {
    if (plan.id === 'free') {
      showAlert('Current Plan', 'You are on the Free plan. Upgrade to unlock more features.');
    } else if (plan.id === 'business') {
      Linking.openURL('mailto:anointedthedeveloper@gmail.com?subject=IDPhoto Business Plan Inquiry');
    } else {
      showAlert('Coming Soon', 'Subscription payments are launching soon. Stay tuned!');
    }
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <LinearGradient
        colors={[colors.primaryGradientStart, colors.accent]}
        style={styles.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.heroBadge}>
          <Ionicons name="sparkles" size={12} color={colors.primary} />
          <Text style={styles.heroBadgeText}>Simple Pricing</Text>
        </View>
        <Text style={styles.heroTitle}>Upgrade Your{'\n'}ID Photo Experience</Text>
        <Text style={styles.heroSubtitle}>
          Generate professional results with AI. Cancel anytime.
        </Text>
      </LinearGradient>

      {/* Plans */}
      <View style={styles.plansContainer}>
        {plans.map((plan) => (
          <View
            key={plan.id}
            style={[styles.planCard, plan.id === 'pro' && styles.planCardHighlighted]}
          >
            {plan.badge && (
              <View style={[styles.badge, { backgroundColor: plan.badgeColor }]}>
                <Text style={styles.badgeText}>{plan.badge}</Text>
              </View>
            )}

            <View style={styles.planTopRow}>
              <View>
                <Text style={[styles.planName, plan.id === 'pro' && styles.planNameHighlighted]}>
                  {plan.name}
                </Text>
                <Text style={styles.planDescription}>{plan.description}</Text>
              </View>
              <View style={styles.priceBlock}>
                <Text style={[styles.price, plan.id === 'pro' && styles.priceHighlighted]}>
                  {plan.price}
                </Text>
                <Text style={styles.period}>/{plan.period}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.ctaButton,
                plan.ctaStyle === 'primary' && styles.ctaPrimary,
                plan.ctaStyle === 'outline' && styles.ctaOutline,
                plan.ctaStyle === 'ghost' && styles.ctaGhost,
              ]}
              onPress={() => handleCTA(plan)}
              activeOpacity={0.85}
            >
              {plan.ctaStyle === 'primary' ? (
                <LinearGradient
                  colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
                  style={styles.ctaGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={[styles.ctaText, styles.ctaTextPrimary]}>{plan.cta}</Text>
                </LinearGradient>
              ) : (
                <Text style={[
                  styles.ctaText,
                  plan.ctaStyle === 'outline' && styles.ctaTextOutline,
                  plan.ctaStyle === 'ghost' && styles.ctaTextGhost,
                ]}>{plan.cta}</Text>
              )}
            </TouchableOpacity>

            <View style={styles.featuresList}>
              {plan.features.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <View style={[styles.featureIcon, feature.included ? styles.featureIconIncluded : styles.featureIconExcluded]}>
                    <Ionicons
                      name={feature.included ? 'checkmark' : 'close'}
                      size={11}
                      color={feature.included ? colors.success : colors.textTertiary}
                    />
                  </View>
                  <Text style={[styles.featureLabel, !feature.included && styles.featureLabelExcluded]}>
                    {feature.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      {/* Trust Grid */}
      <View style={styles.trustSection}>
        <Text style={styles.trustTitle}>Why Choose IDPhoto?</Text>
        <View style={styles.trustGrid}>
          {[
            { icon: 'shield-checkmark-outline', label: 'Privacy First', desc: 'Your photos are never stored permanently' },
            { icon: 'flash-outline', label: 'AI Powered', desc: 'State-of-the-art Gemini AI transforms photos' },
            { icon: 'globe-outline', label: 'Any ID Format', desc: 'Passports, visas, permits and more' },
            { icon: 'card-outline', label: 'Cancel Anytime', desc: 'No lock-in. Cancel with one tap' },
          ].map((item, i) => (
            <View key={i} style={styles.trustItem}>
              <LinearGradient
                colors={[colors.primaryLight, colors.accentLight]}
                style={styles.trustIconWrap}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name={item.icon as any} size={20} color={colors.primary} />
              </LinearGradient>
              <Text style={styles.trustItemLabel}>{item.label}</Text>
              <Text style={styles.trustItemDesc}>{item.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Contact */}
      <TouchableOpacity
        style={styles.contactSection}
        onPress={() => Linking.openURL('mailto:anointedthedeveloper@gmail.com')}
        activeOpacity={0.8}
      >
        <Ionicons name="mail-outline" size={18} color={colors.primary} />
        <Text style={styles.contactText}>
          Questions? <Text style={styles.contactLink}>Contact us</Text>
        </Text>
        <Ionicons name="chevron-forward" size={14} color={colors.textTertiary} />
      </TouchableOpacity>

      <View style={{ height: insets.bottom + spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { gap: spacing.xxl },

  hero: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  heroBadgeText: { ...typography.caption, color: '#fff', fontWeight: '700' },
  heroTitle: { fontSize: 30, fontWeight: '800', color: '#fff', letterSpacing: -0.6, lineHeight: 38 },
  heroSubtitle: { ...typography.body, color: 'rgba(255,255,255,0.8)', lineHeight: 22 },

  plansContainer: { gap: spacing.lg, paddingHorizontal: spacing.xl },
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: spacing.lg,
    ...shadows.sm,
  },
  planCardHighlighted: {
    borderColor: colors.primary,
    ...shadows.brand,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  badgeText: { ...typography.label, color: '#fff', fontSize: 10 },
  planTopRow: { gap: spacing.sm },
  planName: { fontSize: 22, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  planNameHighlighted: { color: colors.primary },
  planDescription: { ...typography.body, color: colors.textSecondary, lineHeight: 20 },
  priceBlock: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: spacing.sm },
  price: { fontSize: 36, fontWeight: '800', color: colors.text, letterSpacing: -1 },
  priceHighlighted: { color: colors.primary },
  period: { ...typography.body, color: colors.textSecondary },

  ctaButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  ctaPrimary: { ...shadows.brand },
  ctaOutline: { borderWidth: 1.5, borderColor: colors.primary, minHeight: 52 },
  ctaGhost: { backgroundColor: colors.borderLight, minHeight: 52 },
  ctaGradient: { width: '100%', paddingVertical: spacing.lg, alignItems: 'center' },
  ctaText: { ...typography.button },
  ctaTextPrimary: { color: '#fff' },
  ctaTextOutline: { color: colors.primary },
  ctaTextGhost: { color: colors.textSecondary },

  featuresList: {
    gap: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  featureIcon: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  featureIconIncluded: { backgroundColor: colors.successLight },
  featureIconExcluded: { backgroundColor: colors.borderLight },
  featureLabel: { ...typography.body, color: colors.text, flex: 1, fontSize: 14 },
  featureLabelExcluded: { color: colors.textTertiary, textDecorationLine: 'line-through' },

  trustSection: { gap: spacing.xl, paddingHorizontal: spacing.xl },
  trustTitle: { ...typography.heading, color: colors.text, textAlign: 'center' },
  trustGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  trustItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  trustIconWrap: { width: 44, height: 44, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  trustItemLabel: { ...typography.bodyMedium, color: colors.text, fontWeight: '700' },
  trustItemDesc: { ...typography.caption, color: colors.textSecondary, lineHeight: 17 },

  contactSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  contactText: { ...typography.body, color: colors.textSecondary, flex: 1 },
  contactLink: { color: colors.primary, fontWeight: '700' },
});
