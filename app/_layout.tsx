import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AlertProvider, AuthProvider } from '@/template';
import { PhotoLibraryProvider } from '@/contexts/PhotoLibraryContext';
import { InAppNotificationProvider } from '@/components/ui/InAppNotification';

export default function RootLayout() {
  return (
    <AlertProvider>
      <SafeAreaProvider>
        <InAppNotificationProvider>
          <AuthProvider>
            <PhotoLibraryProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="onboarding" />
                <Stack.Screen name="login" />
                <Stack.Screen name="(tabs)" />
              </Stack>
            </PhotoLibraryProvider>
          </AuthProvider>
        </InAppNotificationProvider>
      </SafeAreaProvider>
    </AlertProvider>
  );
}
