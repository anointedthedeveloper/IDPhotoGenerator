import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { AlertProvider } from '@/template';
import { PhotoLibraryProvider } from '@/contexts/PhotoLibraryContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    const timer = setTimeout(() => SplashScreen.hideAsync(), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor="#F9FBFF" translucent={false} />
      <AlertProvider>
        <PhotoLibraryProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="auth/login" options={{ presentation: 'modal' }} />
            <Stack.Screen name="auth/register" options={{ presentation: 'modal' }} />
            <Stack.Screen name="auth/verify" options={{ presentation: 'modal' }} />
          </Stack>
        </PhotoLibraryProvider>
      </AlertProvider>
    </SafeAreaProvider>
  );
}
