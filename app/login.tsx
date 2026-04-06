import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/template';
import { useInAppNotification } from '@/components/ui/InAppNotification';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';

type AuthMode = 'login' | 'register' | 'otp';

const OTP_LENGTH = 4;

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { showNotification } = useInAppNotification();
  const { sendOTP, verifyOTPAndLogin, signInWithPassword, operationLoading } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [pendingPassword, setPendingPassword] = useState('');
  const [autoVerifying, setAutoVerifying] = useState(false);

  const otpRefs = useRef<(TextInput | null)[]>([]);
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));

  const fullOtp = otpDigits.join('');

  // Auto-verify when all OTP digits entered
  useEffect(() => {
    if (fullOtp.length === OTP_LENGTH && !autoVerifying && mode === 'otp') {
      handleAutoVerify(fullOtp);
    }
  }, [fullOtp, mode]);

  const handleAutoVerify = async (code: string) => {
    setAutoVerifying(true);
    const { error } = await verifyOTPAndLogin(pendingEmail, code, { password: pendingPassword });
    if (error) {
      showNotification({ title: 'Verification Failed', message: error, type: 'error' });
      // Reset OTP inputs on failure
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      otpRefs.current[0]?.focus();
    } else {
      showNotification({ title: 'Account Created!', message: 'Welcome to ID Photo Studio', type: 'success' });
      // AuthRouter will redirect automatically
    }
    setAutoVerifying(false);
  };

  const handleOtpChange = (val: string, idx: number) => {
    const digit = val.replace(/[^0-9]/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[idx] = digit;
    setOtpDigits(newDigits);
    if (digit && idx < OTP_LENGTH - 1) {
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showNotification({ title: 'Missing Fields', message: 'Please enter your email and password.', type: 'warning' });
      return;
    }
    const { error, user } = await signInWithPassword(email.trim(), password);
    if (error) {
      showNotification({ title: 'Login Failed', message: error, type: 'error' });
    } else if (user) {
      showNotification({ title: 'Welcome back!', message: user.email || '', type: 'success' });
      // AuthRouter will auto-redirect
    }
  };

  const handleSendOTP = async () => {
    if (!email.trim()) {
      showNotification({ title: 'Missing Email', message: 'Please enter your email address.', type: 'warning' });
      return;
    }
    if (!password.trim() || password.length < 6) {
      showNotification({ title: 'Weak Password', message: 'Password must be at least 6 characters.', type: 'warning' });
      return;
    }
    if (password !== confirmPassword) {
      showNotification({ title: 'Password Mismatch', message: 'Passwords do not match.', type: 'error' });
      return;
    }
    const { error } = await sendOTP(email.trim());
    if (error) {
      showNotification({ title: 'Error', message: error, type: 'error' });
    } else {
      setPendingEmail(email.trim());
      setPendingPassword(password);
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      setMode('otp');
      showNotification({ title: 'Code Sent', message: `Verification code sent to ${email.trim()}`, type: 'info' });
      setTimeout(() => otpRefs.current[0]?.focus(), 400);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={[styles.container, { paddingTop: insets.top }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="id-card" size={40} color={colors.primary} />
          </View>
          <Text style={styles.appName}>PhotoID Studio</Text>
          <Text style={styles.appTagline}>Professional ID photos in seconds</Text>
        </View>

        {/* OTP Screen */}
        {mode === 'otp' ? (
          <View style={styles.card}>
            <View style={styles.otpHeader}>
              <View style={styles.otpIcon}>
                <Ionicons name="mail-open-outline" size={28} color={colors.primary} />
              </View>
              <Text style={styles.cardTitle}>Check Your Email</Text>
              <Text style={styles.cardSubtitle}>
                We sent a {OTP_LENGTH}-digit code to{'\n'}
                <Text style={styles.emailHighlight}>{pendingEmail}</Text>
              </Text>
              <Text style={styles.autoNote}>Enter all {OTP_LENGTH} digits to verify automatically</Text>
            </View>

            {/* OTP digit boxes */}
            <View style={styles.otpBoxRow}>
              {otpDigits.map((digit, idx) => (
                <TextInput
                  key={idx}
                  ref={r => { otpRefs.current[idx] = r; }}
                  style={[
                    styles.otpBox,
                    digit ? styles.otpBoxFilled : null,
                  ]}
                  value={digit}
                  onChangeText={val => handleOtpChange(val, idx)}
                  onKeyPress={e => handleOtpKeyPress(e, idx)}
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                  accessibilityLabel={`OTP digit ${idx + 1}`}
                  selectTextOnFocus
                />
              ))}
            </View>

            {autoVerifying || operationLoading ? (
              <View style={styles.verifyingRow}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.verifyingText}>Verifying your code...</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.textButton}
              onPress={() => {
                setMode('register');
                setOtpDigits(Array(OTP_LENGTH).fill(''));
              }}
            >
              <Ionicons name="arrow-back-outline" size={15} color={colors.primary} />
              <Text style={styles.textButtonLabel}>Back to registration</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            {/* Tab switcher */}
            <View style={styles.tabRow}>
              <TouchableOpacity
                style={[styles.tab, mode === 'login' && styles.tabActive]}
                onPress={() => setMode('login')}
              >
                <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, mode === 'register' && styles.tabActive]}
                onPress={() => setMode('register')}
              >
                <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessibilityLabel="Email"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Min. 6 characters"
                  placeholderTextColor={colors.textTertiary}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  accessibilityLabel="Password"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={colors.textTertiary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password (register only) */}
            {mode === 'register' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Re-enter password"
                    placeholderTextColor={colors.textTertiary}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    accessibilityLabel="Confirm password"
                  />
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[styles.primaryButton, operationLoading && styles.buttonLoading]}
              onPress={mode === 'login' ? handleLogin : handleSendOTP}
              disabled={operationLoading}
              activeOpacity={0.85}
            >
              {operationLoading ? (
                <ActivityIndicator color={colors.surface} />
              ) : mode === 'login' ? (
                <>
                  <Ionicons name="log-in-outline" size={18} color={colors.surface} />
                  <Text style={styles.primaryButtonText}>Sign In</Text>
                </>
              ) : (
                <>
                  <Ionicons name="person-add-outline" size={18} color={colors.surface} />
                  <Text style={styles.primaryButtonText}>Continue with Email</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Footer */}
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    padding: spacing.xl,
    gap: spacing.xl,
    justifyContent: 'center',
    paddingBottom: spacing.xxxl,
  },
  header: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  appName: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
  },
  appTagline: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    gap: spacing.lg,
    ...shadows.lg,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.md,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  tabText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  inputGroup: {
    gap: spacing.sm,
  },
  inputLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 52,
    gap: spacing.sm,
  },
  inputIcon: {
    flexShrink: 0,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    height: '100%',
  },
  otpBoxRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  otpBox: {
    width: 60,
    height: 64,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  otpBoxFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
    color: colors.primary,
  },
  verifyingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  verifyingText: {
    ...typography.bodyMedium,
    color: colors.primary,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    ...shadows.md,
  },
  buttonLoading: {
    opacity: 0.7,
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.surface,
  },
  textButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  textButtonLabel: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  otpHeader: {
    alignItems: 'center',
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  otpIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    ...typography.heading,
    color: colors.text,
    textAlign: 'center',
  },
  cardSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emailHighlight: {
    color: colors.primary,
    fontWeight: '600',
  },
  autoNote: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  footer: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.lg,
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
