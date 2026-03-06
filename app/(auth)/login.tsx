import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { FONTS, SPACING, BORDER_RADIUS, SHADOW } from '../../utils/constants';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const { signIn, loading, error, clearError } = useAuth();
  const { colors, isDark } = useTheme();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      clearError();
      await signIn(data.email, data.password);
    } catch {}
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primaryLight }]}>
            <Text style={styles.logoEmoji}>🧾</Text>
          </View>
          <Text style={[styles.appName, { color: colors.textPrimary }]}>
            ReceiptVault
          </Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            Never lose a warranty again
          </Text>
        </View>

        {/* Form Card */}
        <View style={[styles.formCard, { backgroundColor: colors.card }, SHADOW.lg]}>
          {error && (
            <View style={[styles.errorBanner, { backgroundColor: colors.dangerLight }]}>
              <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
            </View>
          )}

          <Controller
            control={control}
            name="email"
            rules={{
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Enter a valid email address',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                error={!!errors.email}
                style={[styles.input, { backgroundColor: colors.inputBg }]}
                outlineColor={colors.border}
                activeOutlineColor={colors.primary}
                textColor={colors.textPrimary}
                left={<TextInput.Icon icon="email-outline" color={colors.textTertiary} />}
              />
            )}
          />
          {errors.email && (
            <Text style={[styles.fieldError, { color: colors.danger }]}>{errors.email.message}</Text>
          )}

          <Controller
            control={control}
            name="password"
            rules={{
              required: 'Password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                mode="outlined"
                secureTextEntry
                error={!!errors.password}
                style={[styles.input, { backgroundColor: colors.inputBg }]}
                outlineColor={colors.border}
                activeOutlineColor={colors.primary}
                textColor={colors.textPrimary}
                left={<TextInput.Icon icon="lock-outline" color={colors.textTertiary} />}
              />
            )}
          />
          {errors.password && (
            <Text style={[styles.fieldError, { color: colors.danger }]}>{errors.password.message}</Text>
          )}

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            disabled={loading}
            style={styles.signInButton}
            labelStyle={styles.signInButtonLabel}
            buttonColor={colors.primary}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textTertiary }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          <Button
            mode="outlined"
            onPress={() => Alert.alert('Google Sign-In', 'Google Sign-In requires a development build. Configure with expo-auth-session for production.')}
            style={[styles.googleButton, { borderColor: colors.border }]}
            labelStyle={[styles.googleButtonLabel, { color: colors.textPrimary }]}
            icon="google"
          >
            Continue with Google
          </Button>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Don't have an account?{' '}
          </Text>
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity>
              <Text style={[styles.footerLink, { color: colors.primary }]}>Create Account</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING['3xl'],
  },
  logoContainer: { alignItems: 'center', marginBottom: SPACING['2xl'] },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  logoEmoji: { fontSize: 40 },
  appName: { fontSize: FONTS.sizes['3xl'], fontWeight: '800', letterSpacing: -0.5 },
  tagline: { fontSize: FONTS.sizes.base, marginTop: SPACING.xs },
  formCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
  },
  errorBanner: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.base,
  },
  errorText: { fontSize: FONTS.sizes.sm, textAlign: 'center' },
  input: { marginBottom: SPACING.md },
  fieldError: { fontSize: FONTS.sizes.xs, marginBottom: SPACING.sm, marginLeft: SPACING.xs },
  signInButton: {
    marginTop: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 2,
  },
  signInButtonLabel: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    paddingVertical: 4,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { paddingHorizontal: SPACING.base, fontSize: FONTS.sizes.sm },
  googleButton: {
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 2,
  },
  googleButtonLabel: { fontSize: FONTS.sizes.base },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  footerText: { fontSize: FONTS.sizes.base },
  footerLink: { fontSize: FONTS.sizes.base, fontWeight: '600' },
});
