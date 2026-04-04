import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { authService } from '@/template/auth/supabase/service';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    authService.getCurrentUser().then(u => { setUser(u); setLoading(false); });
    const sub = authService.onAuthStateChange(u => setUser(u));
    return () => sub?.unsubscribe?.();
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    await authService.logout();
    setLoggingOut(false);
    setUser(null);
  };

  const avatarLetter = (user?.email?.[0] ?? 'U').toUpperCase();

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.background, '#E4ECFF']} style={StyleSheet.absoluteFillObject} />

      <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <View style={styles.headerRow}>
          <LinearGradient
            colors={[colors.primary, colors.accent]}
            style={styles.headerIconGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="person" size={18} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={styles.kicker}>My Profile</Text>
            <Text style={styles.title}>Account</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : user ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profile Card */}
          <LinearGradient
            colors={[colors.primaryGradientStart, colors.accent]}
            style={styles.profileCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.avatarWrap}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{avatarLetter}</Text>
              </View>
              <View style={styles.avatarBadge}>
                <Ionicons name="checkmark" size={10} color="#fff" />
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user.username || 'User'}</Text>
              <Text style={styles.profileEmail}>{user.email}</Text>
            </View>
            <View style={styles.planChip}>
              <Text style={styles.planChipText}>Free Plan</Text>
            </View>
          </LinearGradient>

          {/* Upgrade Banner */}
          <TouchableOpacity
            style={styles.upgradeBanner}
            onPress={() => router.push('/(tabs)/plans')}
            activeOpacity={0.88}
          >
            <View style={styles.upgradeLeft}>
              <Ionicons name="sparkles" size={20} color={colors.primary} />
              <View>
                <Text style={styles.upgradeTitle}>Upgrade to Pro</Text>
                <Text style={styles.upgradeSubtitle}>Unlock unlimited photos + HD quality</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.primary} />
          </TouchableOpacity>

          {/* Menu */}
          <View style={styles.section}>
            {[
              { icon: 'images-outline' as const, label: 'My Library', sub: 'View your generated photos', onPress: () => router.push('/(tabs)/library') },
              { icon: 'mail-outline' as const, label: 'Contact Support', sub: 'Get help from our team', onPress: () => {} },
            ].map(({ icon, label, sub, onPress }) => (
              <TouchableOpacity key={label} style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
                <View style={styles.menuIcon}>
                  <Ionicons name={icon} size={18} color={colors.primary} />
                </View>
                <View style={styles.menuText}>
                  <Text style={styles.menuLabel}>{label}</Text>
                  <Text style={styles.menuSub}>{sub}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} disabled={loggingOut} activeOpacity={0.85}>
            {loggingOut ? <ActivityIndicator color={colors.error} /> : (
              <>
                <Ionicons name="log-out-outline" size={18} color={colors.error} />
                <Text style={styles.logoutText}>Sign Out</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <View style={styles.guestContainer}>
          <View style={styles.guestCard}>
            <LinearGradient
              colors={[colors.primaryLight, colors.accentLight]}
              style={styles.guestIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="person-outline" size={44} color={colors.primary} />
            </LinearGradient>
            <Text style={styles.guestTitle}>Sign in to your account</Text>
            <Text style={styles.guestSubtitle}>Save your photos, sync across devices, and unlock Pro features.</Text>
            <TouchableOpacity style={styles.signInBtn} onPress={() => router.push('/auth/login')} activeOpacity={0.85}>
              <LinearGradient
                colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
                style={styles.signInGrad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.signInText}>Sign In</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.registerBtn} onPress={() => router.push('/auth/register')} activeOpacity={0.85}>
              <Text style={styles.registerText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, gap: spacing.sm },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerIconGrad: { width: 44, height: 44, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  kicker: { ...typography.label, color: colors.primary },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, letterSpacing: -0.4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.xl, gap: spacing.lg, paddingBottom: spacing.xxxl },

  // Profile Card
  profileCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    ...shadows.brand,
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarText: { fontSize: 22, fontWeight: '800', color: '#fff' },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileInfo: { flex: 1, gap: 3 },
  profileName: { fontSize: 16, fontWeight: '700', color: '#fff' },
  profileEmail: { ...typography.caption, color: 'rgba(255,255,255,0.75)' },
  planChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  planChipText: { ...typography.label, color: '#fff', fontSize: 10 },

  // Upgrade Banner
  upgradeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.primaryMid,
    ...shadows.sm,
  },
  upgradeLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  upgradeTitle: { ...typography.bodyMedium, color: colors.primary, fontWeight: '700' },
  upgradeSubtitle: { ...typography.caption, color: colors.textSecondary },

  // Menu
  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: { flex: 1, gap: 2 },
  menuLabel: { ...typography.bodyMedium, color: colors.text, fontWeight: '600' },
  menuSub: { ...typography.caption, color: colors.textSecondary },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.errorLight,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  logoutText: { ...typography.button, color: colors.error },

  // Guest
  guestContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  guestCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.xxl,
    alignItems: 'center',
    gap: spacing.lg,
    width: '100%',
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  guestIcon: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestTitle: { fontSize: 22, fontWeight: '800', color: colors.text, textAlign: 'center', letterSpacing: -0.3 },
  guestSubtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  signInBtn: { width: '100%', borderRadius: borderRadius.xl, overflow: 'hidden', ...shadows.brand },
  signInGrad: { paddingVertical: spacing.lg, alignItems: 'center' },
  signInText: { ...typography.button, color: '#fff' },
  registerBtn: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
  },
  registerText: { ...typography.button, color: colors.primary },
});
