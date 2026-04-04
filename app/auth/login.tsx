import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { authService } from '@/template/auth/supabase/service';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';

type Mode = 'login' | 'otp_sent' | 'forgot' | 'reset_sent';

export default function LoginScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { setError('Please enter email and password'); return; }
    setLoading(true); setError('');
    const { error: err } = await authService.signInWithPassword(email.trim(), password);
    setLoading(false);
    if (err) setError(err);
    else router.replace('/(tabs)');
  };

  const handleSendOTP = async () => {
    if (!email) { setError('Please enter your email'); return; }
    setLoading(true); setError('');
    const { error: err } = await authService.sendOTP(email.trim());
    setLoading(false);
    if (err) setError(err);
    else setMode('otp_sent');
  };

  const handleVerifyOTP = async () => {
    if (!otp) { setError('Please enter the code'); return; }
    setLoading(true); setError('');
    const { error: err } = await authService.verifyOTPAndLogin(email.trim(), otp.trim());
    setLoading(false);
    if (err) setError(err);
    else router.replace('/(tabs)');
  };

  const handleForgotPassword = async () => {
    if (!email) { setError('Please enter your email first'); return; }
    setLoading(true); setError('');
    const { error: err } = await authService.sendOTP(email.trim());
    setLoading(false);
    if (err) setError(err);
    else setMode('reset_sent');
  };

  const handleResetWithCode = async () => {
    if (!otp || !password) { setError('Please enter the code and new password'); return; }
    setLoading(true); setError('');
    const { error: err } = await authService.verifyOTPAndLogin(email.trim(), otp.trim(), { password });
    setLoading(false);
    if (err) setError(err);
    else router.replace('/(tabs)');
  };

  const renderError = () => error ? (
    <View style={styles.errorBox}>
      <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
      <Text style={styles.errorText}>{error}</Text>
    </View>
  ) : null;

  const renderInput = (props: {
    label: string; value: string; onChange: (v: string) => void;
    icon: string; placeholder: string; secure?: boolean;
    keyboard?: any; maxLength?: number;
  }) => (
    <View style={styles.field}>
      <Text style={styles.label}>{props.label}</Text>
      <View style={styles.inputWrap}>
        <Ionicons name={props.icon as any} size={18} color={colors.textTertiary} />
        <TextInput
          style={styles.input}
          placeholder={props.placeholder}
          placeholderTextColor={colors.textTertiary}
          value={props.value}
          onChangeText={props.onChange}
          keyboardType={props.keyboard ?? 'default'}
          autoCapitalize="none"
          secureTextEntry={props.secure}
          maxLength={props.maxLength}
        />
        {props.label === 'Password' || props.label === 'New Password' ? (
          <TouchableOpacity onPress={() => setShowPassword(p => !p)}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );

  // OTP sent — enter code to login
  if (mode === 'otp_sent') {
    return (
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <LinearGradient colors={['#F9FBFF', colors.background]} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <TouchableOpacity style={styles.back} onPress={() => { setMode('login'); setOtp(''); setError(''); }}>
              <Ionicons name="arrow-back" size={22} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.header}>
              <View style={styles.logoBox}><Ionicons name="mail" size={32} color={colors.surface} /></View>
              <Text style={styles.title}>Check your email</Text>
              <Text style={styles.subtitle}>We sent a 6-digit code to{'\n'}<Text style={styles.emailHighlight}>{email}</Text></Text>
            </View>
            <View style={styles.form}>
              {renderInput({ label: 'Verification Code', value: otp, onChange: setOtp, icon: 'keypad-outline', placeholder: '000000', keyboard: 'number-pad', maxLength: 6 })}
              {renderError()}
              <TouchableOpacity style={styles.btn} onPress={handleVerifyOTP} disabled={loading} activeOpacity={0.85}>
                {loading ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.btnText}>Verify & Sign In</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.linkRow} onPress={handleSendOTP}>
                <Text style={styles.linkText}>Didn't receive it? </Text>
                <Text style={styles.link}>Resend code</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    );
  }

  // Password reset — enter code + new password
  if (mode === 'reset_sent') {
    return (
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <LinearGradient colors={['#F9FBFF', colors.background]} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <TouchableOpacity style={styles.back} onPress={() => { setMode('login'); setOtp(''); setError(''); }}>
              <Ionicons name="arrow-back" size={22} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.header}>
              <View style={styles.logoBox}><Ionicons name="lock-open" size={32} color={colors.surface} /></View>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>Enter the code sent to{'\n'}<Text style={styles.emailHighlight}>{email}</Text>{'\n'}and your new password</Text>
            </View>
            <View style={styles.form}>
              {renderInput({ label: 'Reset Code', value: otp, onChange: setOtp, icon: 'keypad-outline', placeholder: '000000', keyboard: 'number-pad', maxLength: 6 })}
              {renderInput({ label: 'New Password', value: password, onChange: setPassword, icon: 'lock-closed-outline', placeholder: 'Min. 6 characters', secure: !showPassword })}
              {renderError()}
              <TouchableOpacity style={styles.btn} onPress={handleResetWithCode} disabled={loading} activeOpacity={0.85}>
                {loading ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.btnText}>Reset Password</Text>}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    );
  }

  // Main login screen
  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={['#F9FBFF', colors.background]} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.header}>
            <View style={styles.logoBox}><Ionicons name="id-card" size={32} color={colors.surface} /></View>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to your IDPhoto AI account</Text>
          </View>
          <View style={styles.form}>
            {renderInput({ label: 'Email', value: email, onChange: setEmail, icon: 'mail-outline', placeholder: 'you@example.com', keyboard: 'email-address' })}
            {renderInput({ label: 'Password', value: password, onChange: setPassword, icon: 'lock-closed-outline', placeholder: 'Your password', secure: !showPassword })}
            <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotRow}>
              <Text style={styles.link}>Forgot password?</Text>
            </TouchableOpacity>
            {renderError()}
            <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
              {loading ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.btnText}>Sign In</Text>}
            </TouchableOpacity>
            <View style={styles.dividerRow}>
              <View style={styles.divider} /><Text style={styles.dividerText}>or</Text><View style={styles.divider} />
            </View>
            <TouchableOpacity style={styles.otpBtn} onPress={handleSendOTP} disabled={loading} activeOpacity={0.85}>
              <Ionicons name="mail-outline" size={18} color={colors.primary} />
              <Text style={styles.otpBtnText}>Sign in with Email Code</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/auth/register')}>
              <Text style={styles.linkText}>Don't have an account? </Text>
              <Text style={styles.link}>Create one</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, padding: spacing.xl, gap: spacing.xl },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: borderRadius.full, backgroundColor: colors.surface, ...shadows.sm },
  header: { alignItems: 'center', gap: spacing.md, paddingTop: spacing.xl },
  logoBox: { width: 72, height: 72, borderRadius: borderRadius.xl, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', ...shadows.md },
  title: { fontSize: 26, fontWeight: '800', color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  emailHighlight: { color: colors.primary, fontWeight: '700' },
  form: { gap: spacing.lg },
  field: { gap: spacing.sm },
  label: { ...typography.bodyMedium, color: colors.text, fontWeight: '600' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  input: { flex: 1, ...typography.body, color: colors.text },
  forgotRow: { alignItems: 'flex-end', marginTop: -spacing.sm },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.errorLight, padding: spacing.md, borderRadius: borderRadius.md },
  errorText: { ...typography.caption, color: colors.error, flex: 1 },
  btn: { backgroundColor: colors.primary, paddingVertical: spacing.lg, borderRadius: borderRadius.lg, alignItems: 'center', ...shadows.md },
  btnText: { ...typography.button, color: colors.surface },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  divider: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { ...typography.caption, color: colors.textTertiary },
  otpBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, borderWidth: 1.5, borderColor: colors.primary, paddingVertical: spacing.lg, borderRadius: borderRadius.lg },
  otpBtnText: { ...typography.button, color: colors.primary },
  linkRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  linkText: { ...typography.body, color: colors.textSecondary },
  link: { ...typography.body, color: colors.primary, fontWeight: '700' },
});
