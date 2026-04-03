import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';

export default function VerifyScreen() {
  const router = useRouter();
  return (
    <LinearGradient colors={['#F9FBFF', colors.background]} style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconBox}>
          <Ionicons name="mail" size={40} color={colors.primary} />
        </View>
        <Text style={styles.title}>Check your email</Text>
        <Text style={styles.subtitle}>
          We sent a confirmation link to your email address. Click the link to activate your account.
        </Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.replace('/auth/login')} activeOpacity={0.85}>
          <Text style={styles.btnText}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  card: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.xxl, alignItems: 'center', gap: spacing.lg, width: '100%', ...shadows.lg },
  iconBox: { width: 80, height: 80, borderRadius: borderRadius.full, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: colors.text, textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  btn: { backgroundColor: colors.primary, paddingVertical: spacing.lg, paddingHorizontal: spacing.xxl, borderRadius: borderRadius.lg, ...shadows.md },
  btnText: { ...typography.button, color: colors.surface },
});
