import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAlert } from '@/template';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';

type PlanFeature = {
  label: string;
  included: boolean;
};

type Plan = {
  id: string;
  name: string;
  price: string;
  period: string;
  badge?: string;
  badgeColor?: string;
  description: string;
  cta: string;
  ctaStyle: 'primary' | 'outline' | 'ghost';
  features: PlanFeature[];
};

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Get started with basic ID photo generation',
    cta: 'Current Plan',
    ctaStyle: 'ghost',
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
    id: 'pro',
    name: 'Pro',
    price: '$4.99',
    period: 'per month',
    badge: 'Most Popular',
    badgeColor: colors.primary,
    description: 'For professionals who need high-quality ID photos regularly',
    cta: 'Start Free Trial',
    ctaStyle: 'primary',
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
    id: 'business',
    name: 'Business',
    price: '$14.99',
    period: 'per month',
    badge: 'Best Value',
    badgeColor: colors.success,
    description: 'Built for teams, agencies, and commercial use',
    cta: 'Contact Sales',
    ctaStyle: 'outline',
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
      showAlert('Current Plan', 'You are already on the Free plan. Upgrade to unlock more features.');
    } else if (plan.id === 'business') {
      Linking.openURL('mailto:hello@anobyte.online?subject=IDPhoto Business Plan Inquiry');
    } else {
      showAlert(
        'Coming Soon',
        'Subscription payments are launching soon. Stay tuned for updates from Anobyte!'
      );
    }
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerBadge}>
          <Ionicons name="sparkles" size={14} color={colors.primary} />
          <Text style={styles.headerBadgeText}>Upgrade Your Plan</Text>
        </View>
        <Text style={styles.title}>Simple, Transparent Pricing</Text>
        <Text style={styles.subtitle}>
          Generate professional ID photos with AI. Cancel anytime.
        </Text>
      </View>

      <View style={styles.plansContainer}>
        {plans.map((plan) => (
          <View
            key={plan.id}
            style={[
              styles.planCard,
              plan.id === 'pro' && styles.planCardHighlighted,
            ]}
          >
            {plan.badge && (
              <View style={[styles.badge, { backgroundColor: plan.badgeColor }]}>
                <Text style={styles.badgeText}>{plan.badge}</Text>
              </View>
            )}

            <View style={styles.planHeader}>
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
              <Text
                style={[
                  styles.ctaText,
                  plan.ctaStyle === 'primary' && styles.ctaTextPrimary,
                  plan.ctaStyle === 'outline' && styles.ctaTextOutline,
                  plan.ctaStyle === 'ghost' && styles.ctaTextGhost,
                ]}
              >
                {plan.cta}
              </Text>
            </TouchableOpacity>

            <View style={styles.featuresList}>
              {plan.features.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <View
                    style={[
                      styles.featureIcon,
                      feature.included
                        ? styles.featureIconIncluded
                        : styles.featureIconExcluded,
                    ]}
                  >
                    <Ionicons
                      name={feature.included ? 'checkmark' : 'close'}
                      size={12}
                      color={feature.included ? colors.success : colors.textTertiary}
                    />
                  </View>
                  <Text
                    style={[
                      styles.featureLabel,
                      !feature.included && styles.featureLabelExcluded,
                    ]}
                  >
                    {feature.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.trustSection}>
        <Text style={styles.trustTitle}>Why Choose IDPhoto?</Text>
        <View style={styles.trustGrid}>
          {[
            { icon: 'shield-checkmark-outline', label: 'Privacy First', desc: 'Your photos are never stored permanently without consent' },
            { icon: 'flash-outline', label: 'AI Powered', desc: 'State-of-the-art AI transforms any photo professionally' },
            { icon: 'globe-outline', label: 'Any ID Format', desc: 'Works for passports, visas, permits, and more' },
            { icon: 'card-outline', label: 'Cancel Anytime', desc: 'No lock-in contracts. Cancel with one tap' },
          ].map((item, i) => (
            <View key={i} style={styles.trustItem}>
              <View style={styles.trustIconContainer}>
                <Ionicons name={item.icon as any} size={22} color={colors.primary} />
              </View>
              <Text style={styles.trustItemLabel}>{item.label}</Text>
              <Text style={styles.trustItemDesc}>{item.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.contactSection}>
        <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
        <Text style={styles.contactText}>
          Questions? Contact us at{' '}
          <Text
            style={styles.contactLink}
            onPress={() => Linking.openURL('mailto:hello@anobyte.online')}
          >
            hello@anobyte.online
          </Text>
        </Text>
      </View>

      <View style={{ height: insets.bottom + spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  headerBadgeText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  title: {
    ...typography.title,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  plansContainer: {
    gap: spacing.lg,
  },
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
    backgroundColor: colors.surface,
    ...shadows.lg,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '700',
    fontSize: 11,
  },
  planHeader: {
    gap: spacing.sm,
  },
  planName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  planNameHighlighted: {
    color: colors.primary,
  },
  planDescription: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  priceBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: spacing.sm,
  },
  price: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -1,
  },
  priceHighlighted: {
    color: colors.primary,
  },
  period: {
    ...typography.body,
    color: colors.textSecondary,
  },
  ctaButton: {
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaPrimary: {
    backgroundColor: colors.primary,
    ...shadows.md,
  },
  ctaOutline: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  ctaGhost: {
    backgroundColor: colors.borderLight,
  },
  ctaText: {
    ...typography.button,
  },
  ctaTextPrimary: {
    color: colors.surface,
  },
  ctaTextOutline: {
    color: colors.primary,
  },
  ctaTextGhost: {
    color: colors.textSecondary,
  },
  featuresList: {
    gap: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIconIncluded: {
    backgroundColor: colors.successLight,
  },
  featureIconExcluded: {
    backgroundColor: colors.borderLight,
  },
  featureLabel: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    fontSize: 14,
  },
  featureLabelExcluded: {
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  trustSection: {
    gap: spacing.xl,
  },
  trustTitle: {
    ...typography.heading,
    color: colors.text,
    textAlign: 'center',
  },
  trustGrid: {
    gap: spacing.lg,
  },
  trustItem: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  trustIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustItemLabel: {
    ...typography.bodyMedium,
    color: colors.text,
    fontWeight: '600',
  },
  trustItemDesc: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  contactSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contactText: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 14,
    flex: 1,
    flexWrap: 'wrap',
  },
  contactLink: {
    color: colors.primary,
    fontWeight: '600',
  },
});
