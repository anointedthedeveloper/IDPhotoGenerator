import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AlertProvider } from '@/template';
import { PhotoLibraryProvider } from '@/contexts/PhotoLibraryContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor="#F9FAFB" translucent={false} />
      <AlertProvider>
        <PhotoLibraryProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </PhotoLibraryProvider>
      </AlertProvider>
    </SafeAreaProvider>
  );
}
