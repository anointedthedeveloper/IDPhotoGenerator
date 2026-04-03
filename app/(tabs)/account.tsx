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

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#F9FBFF', colors.background]} style={StyleSheet.absoluteFillObject} />
      <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerIcon}><Ionicons name="person-circle" size={20} color={colors.primaryDark} /></View>
          <Text style={styles.title}>Account</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : user ? (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(user.email?.[0] ?? 'U').toUpperCase()}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user.username || 'User'}</Text>
              <Text style={styles.profileEmail}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.section}>
            {[
              { icon: 'sparkles-outline', label: 'Upgrade to Pro', onPress: () => router.push('/(tabs)/plans'), highlight: true },
              { icon: 'images-outline', label: 'My Library', onPress: () => router.push('/(tabs)/library') },
              { icon: 'mail-outline', label: 'Contact Support', onPress: () => {} },
            ].map(({ icon, label, onPress, highlight }) => (
              <TouchableOpacity key={label} style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
                <View style={[styles.menuIcon, highlight && styles.menuIconHighlight]}>
                  <Ionicons name={icon as any} size={18} color={highlight ? colors.primary : colors.textSecondary} />
                </View>
                <Text style={[styles.menuLabel, highlight && styles.menuLabelHighlight]}>{label}</Text>
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
            <View style={styles.guestIcon}><Ionicons name="person-outline" size={48} color={colors.primary} /></View>
            <Text style={styles.guestTitle}>Sign in to your account</Text>
            <Text style={styles.guestSubtitle}>Save your photos, sync across devices, and unlock Pro features.</Text>
            <TouchableOpacity style={styles.signInBtn} onPress={() => router.push('/auth/login')} activeOpacity={0.85}>
              <Text style={styles.signInText}>Sign In</Text>
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
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.xl, paddingVertical: spacing.xl, gap: spacing.sm },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerIcon: { width: 36, height: 36, borderRadius: borderRadius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryLight },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.xl, gap: spacing.xl },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.xl, ...shadows.sm, borderWidth: 1, borderColor: colors.borderLight },
  avatar: { width: 56, height: 56, borderRadius: borderRadius.full, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 24, fontWeight: '800', color: colors.surface },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { ...typography.bodyMedium, color: colors.text, fontWeight: '700' },
  profileEmail: { ...typography.caption, color: colors.textSecondary },
  section: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, overflow: 'hidden', borderWidth: 1, borderColor: colors.borderLight, ...shadows.sm },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  menuIcon: { width: 36, height: 36, borderRadius: borderRadius.md, backgroundColor: colors.borderLight, alignItems: 'center', justifyContent: 'center' },
  menuIconHighlight: { backgroundColor: colors.primaryLight },
  menuLabel: { flex: 1, ...typography.bodyMedium, color: colors.text },
  menuLabelHighlight: { color: colors.primary, fontWeight: '700' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.errorLight, paddingVertical: spacing.lg, borderRadius: borderRadius.lg },
  logoutText: { ...typography.button, color: colors.error },
  guestContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  guestCard: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.xxl, alignItems: 'center', gap: spacing.lg, width: '100%', ...shadows.md, borderWidth: 1, borderColor: colors.borderLight },
  guestIcon: { width: 88, height: 88, borderRadius: borderRadius.full, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  guestTitle: { fontSize: 22, fontWeight: '800', color: colors.text, textAlign: 'center' },
  guestSubtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  signInBtn: { width: '100%', backgroundColor: colors.primary, paddingVertical: spacing.lg, borderRadius: borderRadius.lg, alignItems: 'center', ...shadows.md },
  signInText: { ...typography.button, color: colors.surface },
  registerBtn: { width: '100%', borderWidth: 1.5, borderColor: colors.primary, paddingVertical: spacing.lg, borderRadius: borderRadius.lg, alignItems: 'center' },
  registerText: { ...typography.button, color: colors.primary },
});
