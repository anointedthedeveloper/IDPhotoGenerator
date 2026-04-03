import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { authService } from '@/template/auth/supabase/service';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');
    const { error: err, needsEmailConfirmation } = await authService.signUpWithPassword(email.trim(), password);
    setLoading(false);
    if (err) { setError(err); return; }
    if (needsEmailConfirmation) {
      router.replace('/auth/verify');
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={['#F9FBFF', colors.background]} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.logoBox}>
              <Ionicons name="person-add" size={32} color={colors.surface} />
            </View>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Join IDPhoto AI and start generating professional photos</Text>
          </View>

          <View style={styles.form}>
            {[
              { label: 'Email', value: email, onChange: setEmail, icon: 'mail-outline', placeholder: 'you@example.com', keyboard: 'email-address', secure: false },
              { label: 'Password', value: password, onChange: setPassword, icon: 'lock-closed-outline', placeholder: 'Min. 6 characters', keyboard: 'default', secure: !showPassword },
              { label: 'Confirm Password', value: confirm, onChange: setConfirm, icon: 'lock-closed-outline', placeholder: 'Repeat password', keyboard: 'default', secure: !showPassword },
            ].map(({ label, value, onChange, icon, placeholder, keyboard, secure }) => (
              <View key={label} style={styles.field}>
                <Text style={styles.label}>{label}</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name={icon as any} size={18} color={colors.textTertiary} />
                  <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textTertiary}
                    value={value}
                    onChangeText={onChange}
                    keyboardType={keyboard as any}
                    autoCapitalize="none"
                    secureTextEntry={secure}
                  />
                  {label === 'Password' && (
                    <TouchableOpacity onPress={() => setShowPassword(p => !p)}>
                      <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textTertiary} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
              {loading ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.btnText}>Create Account</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/auth/login')}>
              <Text style={styles.linkText}>Already have an account? </Text>
              <Text style={styles.link}>Sign in</Text>
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
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  form: { gap: spacing.lg },
  field: { gap: spacing.sm },
  label: { ...typography.bodyMedium, color: colors.text, fontWeight: '600' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  input: { flex: 1, ...typography.body, color: colors.text },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.errorLight, padding: spacing.md, borderRadius: borderRadius.md },
  errorText: { ...typography.caption, color: colors.error, flex: 1 },
  btn: { backgroundColor: colors.primary, paddingVertical: spacing.lg, borderRadius: borderRadius.lg, alignItems: 'center', ...shadows.md },
  btnText: { ...typography.button, color: colors.surface },
  linkRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  linkText: { ...typography.body, color: colors.textSecondary },
  link: { ...typography.body, color: colors.primary, fontWeight: '700' },
});
