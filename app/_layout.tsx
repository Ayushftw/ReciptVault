import { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../services/firebase';
import { lightColors } from '../utils/constants';
import { useAppStore } from '../store/useAppStore';
import { ThemeProvider, useTheme } from '../hooks/useTheme';

function InnerLayout() {
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const { setCurrentUser } = useAppStore();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const { colors, isDark } = useTheme();

  // Build Paper theme from our palette
  const paperTheme = isDark
    ? {
        ...MD3DarkTheme,
        colors: {
          ...MD3DarkTheme.colors,
          primary: colors.primary,
          primaryContainer: colors.primaryLight,
          background: colors.background,
          surface: colors.surface,
          error: colors.danger,
          onSurface: colors.textPrimary,
          onBackground: colors.textPrimary,
        },
      }
    : {
        ...MD3LightTheme,
        colors: {
          ...MD3LightTheme.colors,
          primary: colors.primary,
          primaryContainer: colors.primaryLight,
          background: colors.background,
          surface: colors.surface,
          error: colors.danger,
          onSurface: colors.textPrimary,
          onBackground: colors.textPrimary,
        },
      };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        setCurrentUser({
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email?.split('@')[0] || 'User',
          photoURL: user.photoURL || undefined,
          createdAt: user.metadata.creationTime || new Date().toISOString(),
          plan: 'free',
        });
      } else {
        setCurrentUser(null);
      }
      setIsAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isAuthLoading || !navigationState?.key) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!firebaseUser && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (firebaseUser && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [firebaseUser, segments, isAuthLoading, navigationState?.key]);

  if (isAuthLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <PaperProvider theme={paperTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Slot />
    </PaperProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <InnerLayout />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
