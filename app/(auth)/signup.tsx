import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { FONTS, SPACING, BORDER_RADIUS, SHADOW } from '../../utils/constants';

interface SignupForm {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignupScreen() {
  const { signUp, loading, error, clearError } = useAuth();
  const { colors } = useTheme();
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupForm>({
    defaultValues: { displayName: '', email: '', password: '', confirmPassword: '' },
  });

  const password = watch('password');

  const onSubmit = async (data: SignupForm) => {
    try {
      clearError();
      await signUp(data.email, data.password, data.displayName);
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
        <View style={styles.headerContainer}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primaryLight }]}>
            <Text style={styles.logoEmoji}>🛡️</Text>
          </View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Start tracking your receipts and warranties
          </Text>
        </View>

        <View style={[styles.formCard, { backgroundColor: colors.card }, SHADOW.lg]}>
          {error && (
            <View style={[styles.errorBanner, { backgroundColor: colors.dangerLight }]}>
              <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
            </View>
          )}

          <Controller
            control={control}
            name="displayName"
            rules={{ required: 'Name is required' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Full Name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                mode="outlined"
                autoCapitalize="words"
                error={!!errors.displayName}
                style={[styles.input, { backgroundColor: colors.inputBg }]}
                outlineColor={colors.border}
                activeOutlineColor={colors.primary}
                textColor={colors.textPrimary}
                left={<TextInput.Icon icon="account-outline" color={colors.textTertiary} />}
              />
            )}
          />
          {errors.displayName && (
            <Text style={[styles.fieldError, { color: colors.danger }]}>{errors.displayName.message}</Text>
          )}

          <Controller
            control={control}
            name="email"
            rules={{
              required: 'Email is required',
              pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Enter a valid email' },
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
              minLength: { value: 6, message: 'Min 6 characters' },
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

          <Controller
            control={control}
            name="confirmPassword"
            rules={{
              required: 'Please confirm your password',
              validate: (v) => v === password || 'Passwords do not match',
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Confirm Password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                mode="outlined"
                secureTextEntry
                error={!!errors.confirmPassword}
                style={[styles.input, { backgroundColor: colors.inputBg }]}
                outlineColor={colors.border}
                activeOutlineColor={colors.primary}
                textColor={colors.textPrimary}
                left={<TextInput.Icon icon="lock-check-outline" color={colors.textTertiary} />}
              />
            )}
          />
          {errors.confirmPassword && (
            <Text style={[styles.fieldError, { color: colors.danger }]}>{errors.confirmPassword.message}</Text>
          )}

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            disabled={loading}
            style={styles.signUpButton}
            labelStyle={styles.signUpButtonLabel}
            buttonColor={colors.primary}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Already have an account?{' '}
          </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={[styles.footerLink, { color: colors.primary }]}>Sign In</Text>
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
  headerContainer: { alignItems: 'center', marginBottom: SPACING['2xl'] },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  logoEmoji: { fontSize: 36 },
  title: { fontSize: FONTS.sizes['2xl'], fontWeight: '800' },
  subtitle: { fontSize: FONTS.sizes.sm, marginTop: SPACING.xs, textAlign: 'center' },
  formCard: { borderRadius: BORDER_RADIUS.xl, padding: SPACING.xl },
  errorBanner: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.base,
  },
  errorText: { fontSize: FONTS.sizes.sm, textAlign: 'center' },
  input: { marginBottom: SPACING.md },
  fieldError: { fontSize: FONTS.sizes.xs, marginBottom: SPACING.sm, marginLeft: SPACING.xs },
  signUpButton: { marginTop: SPACING.sm, borderRadius: BORDER_RADIUS.md, paddingVertical: 2 },
  signUpButtonLabel: { fontSize: FONTS.sizes.lg, fontWeight: '700', paddingVertical: 4 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.xl },
  footerText: { fontSize: FONTS.sizes.base },
  footerLink: { fontSize: FONTS.sizes.base, fontWeight: '600' },
});
