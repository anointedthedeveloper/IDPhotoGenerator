import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useAlert } from '@/template';
import { usePhotoLibrary } from '@/hooks/usePhotoLibrary';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout, operationLoading } = useAuth();
  const { photos } = usePhotoLibrary();
  const { showAlert } = useAlert();
  const router = useRouter();

  const handleLogout = async () => {
    showAlert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          const { error } = await logout();
          if (error) {
            showAlert('Error', error);
          }
        },
      },
    ]);
  };

  const totalPhotos = photos.length;
  const thisMonth = photos.filter(p => {
    const date = new Date(p.created_at);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  const avatarLetter = (user?.email?.[0] || 'U').toUpperCase();

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Profile</Text>
      </View>

      {/* Avatar + Identity */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarLetter}</Text>
          </View>
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark" size={12} color={colors.surface} />
          </View>
        </View>
        <View style={styles.identityInfo}>
          <Text style={styles.username}>{user?.username || 'User'}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.statCardPrimary]}>
          <Ionicons name="images-outline" size={28} color={colors.primary} />
          <Text style={styles.statValue}>{totalPhotos}</Text>
          <Text style={styles.statLabel}>Total Photos</Text>
        </View>
        <View style={[styles.statCard, styles.statCardSuccess]}>
          <Ionicons name="calendar-outline" size={28} color={colors.success} />
          <Text style={[styles.statValue, { color: colors.success }]}>{thisMonth}</Text>
          <Text style={styles.statLabel}>This Month</Text>
        </View>
      </View>

      {/* Account section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.menuCard}>
          <View style={styles.menuItem}>
            <View style={[styles.menuIconBox, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="mail-outline" size={18} color={colors.primary} />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemLabel}>Email</Text>
              <Text style={styles.menuItemValue} numberOfLines={1}>{user?.email || '—'}</Text>
            </View>
          </View>
          <View style={styles.menuDivider} />
          <View style={styles.menuItem}>
            <View style={[styles.menuIconBox, { backgroundColor: colors.successLight }]}>
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.success} />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemLabel}>Account Status</Text>
              <Text style={[styles.menuItemValue, { color: colors.success }]}>Verified</Text>
            </View>
          </View>
          <View style={styles.menuDivider} />
          <View style={styles.menuItem}>
            <View style={[styles.menuIconBox, { backgroundColor: colors.borderLight }]}>
              <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemLabel}>Member Since</Text>
              <Text style={styles.menuItemValue}>
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                  : '—'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* App section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Linking.openURL('https://github.com/anointedthedeveloper')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#F3F4F6' }]}>
              <Ionicons name="logo-github" size={18} color="#111827" />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemLabel}>Developer</Text>
              <Text style={styles.menuItemValue}>@anointedthedeveloper</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Linking.openURL('https://anobyte.online')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="globe-outline" size={18} color={colors.primary} />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemLabel}>Powered By</Text>
              <Text style={styles.menuItemValue}>Anobyte</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sign out */}
      <TouchableOpacity
        style={[styles.logoutButton, operationLoading && styles.logoutDisabled]}
        onPress={handleLogout}
        disabled={operationLoading}
        activeOpacity={0.85}
      >
        <Ionicons name="log-out-outline" size={20} color={colors.error} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      {/* Version */}
      <Text style={styles.version}>ID Photo Studio v1.0.0</Text>
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
    gap: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  header: {
    paddingTop: spacing.sm,
  },
  pageTitle: {
    ...typography.title,
    color: colors.text,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.lg,
    ...shadows.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.primary + '40',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primary,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  identityInfo: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  username: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  email: {
    ...typography.body,
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    ...shadows.sm,
  },
  statCardPrimary: {
    borderBottomWidth: 3,
    borderBottomColor: colors.primary,
  },
  statCardSuccess: {
    borderBottomWidth: 3,
    borderBottomColor: colors.success,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    lineHeight: 38,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textTertiary,
    paddingLeft: spacing.xs,
  },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
    minHeight: 64,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  menuItemContent: {
    flex: 1,
    gap: 2,
  },
  menuItemLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  menuItemValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 36 + spacing.md + spacing.lg,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.errorLight,
    borderWidth: 1,
    borderColor: colors.error + '30',
  },
  logoutDisabled: {
    opacity: 0.6,
  },
  logoutText: {
    ...typography.button,
    color: colors.error,
  },
  version: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
